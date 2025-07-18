const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    _id: { // Explicitly define _id as String to match client-generated UUIDs
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        default: '',
    },
    creator: {
        type: String,
        required: true, // Make creator required to ensure it's always set
        default: 'Unknown', // Fallback, though it should always be provided by frontend
    },
});

module.exports = mongoose.model('Note', NoteSchema);