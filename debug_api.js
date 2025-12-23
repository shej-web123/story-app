import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function debug() {
    try {
        console.log("Checking Story 1...");
        const s1 = await axios.get(`${API_URL}/stories/1`);
        console.log("Story 1:", JSON.stringify(s1.data, null, 2));

        console.log("\nQuerying by slug 'wind-breaker'...");
        const res = await axios.get(`${API_URL}/stories?slug=wind-breaker`);
        console.log("Result count:", res.data.length);
        if (res.data.length > 0) {
            console.log("First match:", JSON.stringify(res.data[0], null, 2));
        }

        console.log("\nQuerying by non-existent slug 'xyz-123'...");
        const res2 = await axios.get(`${API_URL}/stories?slug=xyz-123`);
        console.log("Result count:", res2.data.length);
        if (res2.data.length > 0) {
            console.log("First match:", JSON.stringify(res2.data[0], null, 2));
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

debug();
