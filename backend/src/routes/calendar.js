// Import required modules
const express = require('express');
const router = express.Router();
const Event = require('../models/calendar')

// Route to render the calendar page
router.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/app-calender.html'));
});

// Route to get all events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to add a new event
router.post('/events', async (req, res) => {
    try {
        const newEvent = req.body;
        const createdEvent = await Event.create(newEvent);
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update an existing event
router.put('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const updatedEvent = req.body;
        const result = await Event.findByIdAndUpdate(eventId, updatedEvent, { new: true });
        res.json(result);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete an event
router.delete('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        await Event.findByIdAndDelete(eventId);
        res.send('Event deleted successfully');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router
module.exports = router;
