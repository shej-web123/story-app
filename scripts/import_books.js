import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function importBooks() {
    try {
        console.log("Fetching books from Gutendex...");
        const res = await axios.get('https://gutendex.com/books?languages=en&sort=popular');
        const books = res.data.results.filter(b => b.formats['image/jpeg']).slice(0, 5);

        console.log(`Found ${books.length} books. Importing...`);

        for (const book of books) {
            try {
                // Check if story already exists to avoid duplicates
                const checkRes = await axios.get(`${API_URL}/stories?title=${encodeURIComponent(book.title)}`);
                if (checkRes.data.length > 0) {
                    console.log(`Story "${book.title}" already exists. Skipping.`);
                    continue;
                }

                const authorName = book.authors.length > 0 ? book.authors[0].name.replace(/, /g, ' ') : 'Unknown';
                const cover = book.formats['image/jpeg'];
                const textUrl = book.formats['text/plain; charset=utf-8'];

                const content = `Đây là một tác phẩm kinh điển từ Project Gutenberg.\n\nBạn có thể đọc toàn bộ tác phẩm tại: ${textUrl || 'Project Gutenberg'}\n\n(Hệ thống hiện tại chỉ lưu trữ thông tin metadata của sách này do hạn chế về CORS khi tải nội dung trực tiếp từ trình duyệt).`;

                // Create Story
                const storyRes = await axios.post(`${API_URL}/stories`, {
                    title: book.title,
                    author: authorName,
                    categoryId: 1,
                    status: 'Completed',
                    description: `Một tác phẩm kinh điển được nhập từ Project Gutenberg. Lượt tải: ${book.download_count}.`,
                    coverUrl: cover,
                    createdAt: new Date().toISOString()
                });

                const storyId = storyRes.data.id;
                console.log(`Imported story: ${book.title} (ID: ${storyId})`);

                // Small delay to ensure server processes the story creation
                await delay(500);

                // Create Chapter
                await axios.post(`${API_URL}/chapters`, {
                    storyId: storyId,
                    title: "Chương 1: Giới thiệu & Nội dung",
                    content: content,
                    order: 1,
                    createdAt: new Date().toISOString()
                });

                console.log(`Added chapter for story ID: ${storyId}`);
                await delay(500);

            } catch (innerError) {
                console.error(`Failed to import book "${book.title}":`, innerError.message);
                if (innerError.response) {
                    console.error("Response data:", innerError.response.data);
                    console.error("Response status:", innerError.response.status);
                }
            }
        }

        console.log("Import process finished.");
    } catch (error) {
        console.error("Fatal error:", error.message);
    }
}

importBooks();
