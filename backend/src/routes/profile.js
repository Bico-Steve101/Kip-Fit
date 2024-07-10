const express = require('express');
const router = express.Router();
const { pool } = require('../config');
const { isAuthenticated } = require('../middleware');
const multer = require('multer');
const upload = multer();

// GET route to render profile page
router.get('/profile', isAuthenticated, async (req, res) => {
    const userId = req.userId;

    try {
        const client = await pool.connect();
        const userQuery = await client.query('SELECT first_name, last_name, email, username, avatar, cover_image FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];

        if (!user) {
            client.release();
            return res.status(404).send('User not found');
        }

        const avatarBase64 = user.avatar ? Buffer.from(user.avatar).toString('base64') : null;
        const coverImageBase64 = user.cover_image ? Buffer.from(user.cover_image).toString('base64') : null;

        const postsQuery = 'SELECT id, title, content, image, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC';
        const postsResult = await pool.query(postsQuery, [userId]);
        const posts = postsResult.rows;

        const highlightsQuery = 'SELECT id, title, content, image, created_at FROM highlights WHERE user_id = $1 ORDER BY created_at DESC';
        const highlightsResult = await pool.query(highlightsQuery, [userId]);
        const highlights = highlightsResult.rows;

        client.release();

        res.render('profile', {
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            username: user.username,
            avatar: avatarBase64,
            coverImage: coverImageBase64,
            message: req.flash('message'),
            posts: posts,
            highlights: highlights
        });
    } catch (err) {
        console.error('Error retrieving user data:', err);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to handle creating a new post
router.post('/profile/post', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, content, socialLinks } = req.body;
        const userId = req.userId;
        let imageBuffer = null;

        if (req.file) {
            imageBuffer = req.file.buffer;
        }

        const postContent = content + (socialLinks ? `\nSocial Links: ${socialLinks.split(',').join(', ')}` : '');

        const postQuery = `
            INSERT INTO posts (user_id, title, content, image, created_at) 
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, title, content, created_at;
        `;

        const result = await pool.query(postQuery, [userId, title, postContent, imageBuffer]);
        let newPost = result.rows[0];

        if (imageBuffer) {
            newPost.image = imageBuffer.toString('base64');
        }

        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error submitting post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/profile/highlight', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.userId;
        let imageBuffer = null;

        if (req.file) {
            imageBuffer = req.file.buffer;
        }

        const highlightQuery = `
            INSERT INTO highlights (user_id, title, content, image, created_at) 
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, title, content, created_at;
        `;

        const result = await pool.query(highlightQuery, [userId, title, content, imageBuffer]);
        let newHighlight = result.rows[0];

        if (imageBuffer) {
            newHighlight.image = imageBuffer.toString('base64');
        }

        res.status(201).json(newHighlight);
    } catch (err) {
        console.error('Error submitting highlight:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST route to handle profile updates
router.post('/profile', isAuthenticated, upload.fields([{ name: 'avatar' }, { name: 'coverImage' }]), async (req, res) => {
    const userId = req.userId;
    const { firstName, lastName, username, email } = req.body;
    const avatar = req.files['avatar'] ? req.files['avatar'][0].buffer : null;
    const coverImage = req.files['coverImage'] ? req.files['coverImage'][0].buffer : null;

    try {
        const client = await pool.connect();
        const userQuery = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const currentUser = userQuery.rows[0];

        // Prepare updated values
        const updatedUser = {
            first_name: firstName || currentUser.first_name,
            last_name: lastName || currentUser.last_name,
            username: username || currentUser.username,
            email: email || currentUser.email,
            avatar: avatar || currentUser.avatar,
            cover_image: coverImage || currentUser.cover_image
        };

        // Update user in the database
        await client.query(
            'UPDATE users SET first_name = $1, last_name = $2, username = $3, email = $4, avatar = $5, cover_image = $6 WHERE id = $7',
            [updatedUser.first_name, updatedUser.last_name, updatedUser.username, updatedUser.email, updatedUser.avatar, updatedUser.cover_image, userId]
        );

        client.release();

        req.flash('message', { type: 'success', text: 'Profile updated successfully' });
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating user data:', err);
        req.flash('message', { type: 'error', text: 'Error updating profile' });
        res.redirect('/profile');
    }
});

module.exports = router;