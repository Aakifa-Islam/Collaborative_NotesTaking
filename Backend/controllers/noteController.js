const Note = require('../models/Note');

exports.saveNotes = async (req, res) => {
    try {
        const { roomId, notes } = req.body;
        // Delete all existing notes for the given roomId to ensure a clean save
        await Note.deleteMany({ roomId });

        // Prepare notes for insertion, using the client-provided 'id' as '_id'
        const notesToInsert = notes.map(note => ({
            _id: note.id, // Use the client-generated ID as Mongoose _id
            roomId: roomId,
            content: note.content,
            creator: note.creator // Ensure creator is passed and saved
        }));

        const savedNotes = await Note.insertMany(notesToInsert);

        res.status(200).json({
            message: 'Notes saved successfully',
            // Return notes with their original client-side IDs and creators
            data: savedNotes.map(note => ({ id: note._id.toString(), content: note.content, creator: note.creator }))
        });
    } catch (error) {
        console.error('Error saving notes:', error);
        res.status(500).json({ message: 'Failed to save notes', error: error.message });
    }
};

exports.getNotes = async (roomId) => {
    try {
        const notes = await Note.find({ roomId });
        // Map Mongoose _id to 'id' for frontend consistency, and include creator
        return notes.map(note => ({ id: note._id.toString(), content: note.content, creator: note.creator }));
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
};

// This function is still here but delete logic is primarily handled via Socket.io for real-time
exports.deleteNote = async (noteId) => { // Removed roomId as _id is unique
    try {
        const result = await Note.deleteOne({ _id: noteId });
        return result;
    } catch (error) {
        console.error('Error deleting note:', error);
        return { deletedCount: 0 };
    }
};