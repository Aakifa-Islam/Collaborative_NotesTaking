const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes');
const { getNotes } = require('./controllers/noteController');
const Note = require('./models/Note');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your React app's URL
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/collab_notepad')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// API Routes
app.use('/api', noteRoutes);

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async ({ roomId, username }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        const existingUser = rooms[roomId].find(user => user.id === socket.id);
        if (!existingUser) {
            rooms[roomId].push({ id: socket.id, username });
        }

        io.to(roomId).emit('user-joined', { users: rooms[roomId], username });

        const existingNotes = await getNotes(roomId);
        socket.emit('room-notes', existingNotes);

        console.log(`${username} joined room ${roomId}`);
    });

    socket.on('add-note', async ({ roomId, id, creator }) => {
        const newNote = new Note({ _id: id, content: '', creator, roomId });
        try {
            const savedNote = await newNote.save();
            const noteToSend = { id: savedNote._id.toString(), content: savedNote.content, creator: savedNote.creator };
            io.to(roomId).emit('new-note', noteToSend);
            console.log(`Note added by ${creator} in room ${roomId}:`, noteToSend);
        } catch (error) {
            console.error('Error saving new note on add:', error);
            socket.emit('note-add-error', { message: 'Failed to add note.' });
        }
    });

    socket.on('update-note', async ({ roomId, noteId, content }) => {
        try {
            const updatedNote = await Note.findByIdAndUpdate(
                noteId,
                { content: content },
                { new: true }
            );
            if (updatedNote) {
                io.to(roomId).emit('note-updated', { id: updatedNote._id.toString(), content: updatedNote.content, creator: updatedNote.creator });
                console.log(`Note ${noteId} updated in room ${roomId}`);
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    });

    socket.on('delete-note', async ({ roomId, noteId, deleterUsername }) => {
        try {
            const noteToDelete = await Note.findById(noteId);

            if (!noteToDelete) {
                console.log(`Note with ID ${noteId} not found.`);
                socket.emit('deletion-unauthorized', { noteId, message: 'Note not found.' });
                return;
            }

            // --- Changed: More robust creator check for merged notes ---
            const isCreator = noteToDelete.creator === deleterUsername;
            const isMerger = noteToDelete.creator.startsWith('Merged by:') && noteToDelete.creator.includes(deleterUsername);

            if (isCreator || isMerger) {
                const result = await Note.deleteOne({ _id: noteId, roomId: roomId });
                if (result.deletedCount > 0) {
                    io.to(roomId).emit('note-deleted', noteId);
                    console.log(`Note ${noteId} deleted from database by ${deleterUsername} in room ${roomId}`);
                } else {
                    console.log(`Note ${noteId} not deleted (no matching document found after creator check).`);
                }
            } else {
                console.log(`User ${deleterUsername} attempted to delete note ${noteId} but is not the creator or merger.`);
                socket.emit('deletion-unauthorized', { noteId, message: 'You are not authorized to delete this note.' });
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            socket.emit('deletion-unauthorized', { noteId, message: 'Error processing deletion request.' });
        }
    });

    socket.on('merge-notes', async ({ roomId, mergerUsername }) => {
        try {
            const existingNotes = await getNotes(roomId);
            if (existingNotes.length === 0) {
                console.log(`No notes to merge in room ${roomId}`);
                return;
            }
            const mergedContent = existingNotes.map(note => note.content).join('\n\n---\n\n');

            const mergedNoteId = uuidv4();
            const newMergedNote = new Note({
                _id: mergedNoteId,
                content: mergedContent,
                creator: `Merged by: ${mergerUsername}`,
                roomId
            });

            const savedMergedNote = await newMergedNote.save();
            const noteToSend = {
                id: savedMergedNote._id.toString(),
                content: savedMergedNote.content,
                creator: savedMergedNote.creator
            };

            io.to(roomId).emit('notes-merged', noteToSend);
            console.log(`Notes merged in room ${roomId} by ${mergerUsername}:`, noteToSend);
        } catch (error) {
            console.error('Error merging notes:', error);
            socket.emit('merge-error', { message: 'Failed to merge notes.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomId in rooms) {
            const initialLength = rooms[roomId].length;
            rooms[roomId] = rooms[roomId].filter(user => user.id !== socket.id);
            if (rooms[roomId].length < initialLength) {
                const disconnectedUser = Object.values(rooms)
                    .flat()
                    .find(user => user.id === socket.id);

                const usernameLeft = disconnectedUser ? disconnectedUser.username : 'A user';
                io.to(roomId).emit('disconnected', { users: rooms[roomId], username: usernameLeft });
                if (rooms[roomId].length === 0) {
                    delete rooms[roomId];
                    console.log(`Room ${roomId} is now empty and deleted.`);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));