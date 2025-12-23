import axios from 'axios';

const CHAPTER_API = 'https://sv1.otruyencdn.com/v1/api/chapter/6912cb6ba2ca9f8cba598a48';

async function debug() {
    try {
        const res = await axios.get(CHAPTER_API);
        const item = res.data.data.item;
        console.log("Chapter Path:", item.chapter_path);
        console.log("First Image Item:", JSON.stringify(item.chapter_image[0], null, 2));
        console.log("Type of First Image:", typeof item.chapter_image[0]);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

debug();
