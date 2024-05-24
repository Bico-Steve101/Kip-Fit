const mongoose = require ('mongoose');
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    description: {
        type: String
    }
});

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

// Export the Event model
module.exports = Event;