import axios from 'axios';

const CHAPTER_API = 'https://sv1.otruyencdn.com/v1/api/chapter/6912cb6ba2ca9f8cba598a48';

async function debug() {
    try {
        console.log(`Fetching ${CHAPTER_API}...`);
        const res = await axios.get(CHAPTER_API);
        console.log("Response Status:", res.status);
        console.log("Response Data Keys:", Object.keys(res.data));
        if (res.data.data) {
            console.log("Data Keys:", Object.keys(res.data.data));
            if (res.data.data.item) {
                console.log("Item Keys:", Object.keys(res.data.data.item));
                console.log("Chapter Image Path:", res.data.data.item.chapter_path);
                console.log("Chapter Images (first 2):", res.data.data.item.chapter_image?.slice(0, 2));
                console.log("Domain CDN:", res.data.data.domain_cdn);
            }
        }
        console.log("Full Response Structure (depth 2):", JSON.stringify(res.data, (key, value) => {
            if (key === 'chapter_image' && Array.isArray(value)) return `[Array of ${value.length} items]`;
            return value;
        }, 2));

    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

debug();
