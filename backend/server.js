require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(cookieParser());

// Instagram OAuth endpoints
app.get('/auth/instagram', (req, res) => {
    const url = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.BASE_URL}/auth/instagram/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    res.redirect(url);

});

app.get('/auth/instagram/callback', async (req, res) => {
    try {
        const { code } = req.query;
        console.log("🚀 ~ app.get ~ code:", code);

        // Use FormData to match Instagram's API expectations
        const FormData = require('form-data');
        const form = new FormData();
        form.append('client_id', process.env.INSTAGRAM_CLIENT_ID);
        form.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET);        
        form.append('grant_type', 'authorization_code');
        form.append('redirect_uri', `https://b677-117-96-40-3.ngrok-free.app/auth/instagram/callback`);
        form.append('code', code);

        const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', form, {
            headers: form.getHeaders(),
        });

        const { access_token, user_id } = tokenResponse.data;

        // Optional: Get long-lived token
        const longLivedToken = await axios.get(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=5054684f30d2eeeb766f1df200f61080&access_token=${access_token}`);

        // Fetch user profile
        const userResponse = await axios.get(`https://graph.instagram.com/${user_id}?fields=id,username&access_token=${access_token}`);

        // Redirect back to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${longLivedToken.data.access_token}&user=${encodeURIComponent(JSON.stringify(userResponse.data))}`);

    } catch (error) {
        console.error('Instagram auth error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}/login-error`);
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));