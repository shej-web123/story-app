import axios from 'axios';

const api = axios.create({ baseURL: 'http://127.0.0.1:3000' });

async function createAdmin() {
    try {
        // 1. Login as super admin to get permissions
        console.log('Logging in as admin@example.com...');
        const loginRes = await api.post('/login', {
            email: 'admin@example.com',
            password: '123456'
        });
        const token = loginRes.data.accessToken;
        console.log('Logged in successfully.');

        // 2. Create new admin
        const newAdmin = {
            email: 'storyapp@admin.com',
            password: 'storyapp',
            name: 'Story App Admin',
            role: 'admin',
            avatar: 'https://i.pravatar.cc/150?u=storyapp',
            bio: 'Admin account',
            joinDate: new Date().toISOString(),
            status: 'active'
        };

        console.log('Creating new admin user...');
        const createRes = await api.post('/users', newAdmin, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('User created successfully:', createRes.data);
    } catch (error) {
        console.error('Error creating user:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data === 'Email already exists') {
            console.log('User already exists, checking valid login...');
            // Optional: verify login works if user exists
        }
    }
}

createAdmin();
