// Import required modules
const express = require('express');
const router = express.Router();

// Sample data to simulate events
let events = [];

// Route to render the calendar page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/app-calender.html'));
});

// Route to get all events
router.get('/events', (req, res) => {
    res.json(events);
});

// Route to add a new event
router.post('/events', (req, res) => {
    const newEvent = req.body;
    events.push(newEvent);
    res.status(201).send('Event added successfully');
});

// Route to update an existing event
router.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const updatedEvent = req.body;
    events = events.map(event => {
        if (event.id === eventId) {
            return updatedEvent;
        } else {
            return event;
        }
    });
    res.send('Event updated successfully');
});

// Route to delete an event
router.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;
    events = events.filter(event => event.id !== eventId);
    res.send('Event deleted successfully');
});

// Export the router
module.exports = router;
