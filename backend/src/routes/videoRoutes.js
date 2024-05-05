const express = require('express');
const router = express.Router();

// Mock function to fetch videos
const fetchVideos = async () => {
    // Replace this with actual database query or API call
    return [
        { id: 1, title: 'Video 1', url: 'https://example.com/video1' },
        { id: 2, title: 'Video 2', url: 'https://example.com/video2' },
        // Add more videos as needed
    ];
};

router.get('/videos', async (req, res) => {
    try {
        const videos = await fetchVideos();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

module.exports = router;
