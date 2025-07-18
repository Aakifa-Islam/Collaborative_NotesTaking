import { useEffect, useRef, useState } from 'react';
import toast from "react-hot-toast";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import './collabenv.css';

const CollabEnv = () => {
    const { id: roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { username } = location.state || {};

    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);
    const socket = useRef(null);
    const notesAreaRef = useRef(null);

    useEffect(() => {
        if (!username) {
            toast.error("Please enter a username to join the room.");
            navigate('/');
            return;
        }

        socket.current = io('http://localhost:5000');

        socket.current.emit('join-room', { roomId, username });

        socket.current.on('user-joined', ({ users: updatedUsers, username: joinedUsername }) => {
            setUsers(updatedUsers);
            if (joinedUsername !== username) {
                toast.success(`${joinedUsername} joined the room.`);
            }
        });

        socket.current.on('disconnected', ({ users: updatedUsers, username: leftUsername }) => {
            setUsers(updatedUsers);
            toast.error(`${leftUsername} left the room.`);
        });

        socket.current.on('room-notes', (serverNotes) => {
            setNotes(serverNotes);
            scrollToBottom();
        });

        socket.current.on('new-note', (newNote) => {
            setNotes((prevNotes) => [...prevNotes, newNote]);
            scrollToBottom();
        });

        socket.current.on('note-updated', (updatedNote) => {
            setNotes((prevNotes) =>
                prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
            );
        });

        socket.current.on('note-deleted', (deletedNoteId) => {
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== deletedNoteId));
            toast.success("Note deleted successfully.");
        });

        socket.current.on('notes-merged', (mergedNote) => {
            setNotes((prevNotes) => [...prevNotes, mergedNote]);
            scrollToBottom();
            toast.success("Notes merged successfully!");
        });

        socket.current.on('deletion-unauthorized', ({ noteId, message }) => {
            toast.error(message || "You are not authorized to delete this note.");
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socket.current.off('user-joined');
                socket.current.off('disconnected');
                socket.current.off('room-notes');
                socket.current.off('new-note');
                socket.current.off('note-updated');
                socket.current.off('note-deleted');
                socket.current.off('notes-merged');
                socket.current.off('deletion-unauthorized');
            }
        };
    }, [roomId, username, navigate]);

    const scrollToBottom = () => {
        if (notesAreaRef.current) {
            notesAreaRef.current.scrollTop = notesAreaRef.current.scrollHeight;
        }
    };

    const handleAddNote = () => {
        const newNoteId = uuidv4();
        socket.current.emit('add-note', { roomId, id: newNoteId, creator: username });
    };

    const handleNoteChange = (id, content) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === id ? { ...note, content } : note))
        );
        socket.current.emit('update-note', { roomId, noteId: id, content });
    };

    const handleSaveNotes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId, notes }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message || "Notes saved in the database.");
            } else {
                toast.error(data.message || "Failed to save notes.");
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error("Error saving notes to the database.");
        }
    };

    // --- Changed: Use window.confirm() for merge confirmation ---
    const handleMergeNotes = () => {
        if (notes.length === 0) {
            toast.error("No notes to merge.");
            return;
        }
        if (window.confirm("Are you sure you want to merge all notes into one new note?")) {
            socket.current.emit('merge-notes', { roomId, mergerUsername: username });
        }
    };

    // --- Changed: Use window.confirm() for delete confirmation ---
    const handleDeleteNote = (noteId) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            socket.current.emit('delete-note', { roomId, noteId: noteId, deleterUsername: username });
        }
    };

    return (
        <div className="collab-env-container">
            <header className="collab-header">
                <h1>Collaborative Notepad App</h1>
                <div className="current-user-display">
                    Logged in as: **{username}**
                </div>
                <div className="header-buttons">
                    <button onClick={handleSaveNotes}>Save All</button>
                    <button onClick={handleMergeNotes}>Merge Notes</button>
                </div>
            </header>
            <div className="collab-body">
                <aside className="user-list">
                    <h3>Users in Room</h3>
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>{user.username}</li>
                        ))}
                    </ul>
                </aside>
                <main className="notes-area" ref={notesAreaRef}>
                    <div className="notes-container">
                        {notes.map((note) => (
                            <div key={note.id} className="note-item">
                                <div className="note-header">
                                    Created by: **{note.creator || 'Unknown'}**
                                    {/* Delete button always visible to the creator, including merged notes */}
                                    {note.creator === username || note.creator.includes(`Merged by: ${username}`) ? (
                                        <button
                                            className="delete-note-button"
                                            onClick={() => handleDeleteNote(note.id)}
                                        >
                                            Delete
                                        </button>
                                    ) : null}
                                </div>
                                <textarea
                                    value={note.content}
                                    placeholder="Enter your note here..."
                                    onChange={(e) => handleNoteChange(note.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="vertical-buttons">
                        <button
                            className="add-note-button"
                            onClick={handleAddNote}
                            title="Add Note"
                        >
                            +
                        </button>
                    </div>
                </main>
            </div>
            {/* --- Removed: Custom confirmation modals --- */}
        </div>
    );
};

export default CollabEnv;