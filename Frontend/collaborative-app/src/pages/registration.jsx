import React, { useState } from 'react';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import './registration.css';

const Registration = () => {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roomId || !username) {
            toast.error("Both fields are required");
            return;
        }

        // Redirect to editor with state
        navigate(`/collabenv/${roomId}`, {
            state: {
                username,
            },
        });
        toast.success("Room is created");
    };

    const handleToGenerateId = (e) => {
        e.preventDefault();
        const id = uuid();
        setRoomId(id);
        toast.success("Room ID is generated");
    };

    // Handle Enter key to trigger join
    const handleInputEnter = (e) => {
        if (e.code === "Enter") {
            handleSubmit(e);
        }
    };

    return (
        <div className="registration-container">
            <form className="registration-form" onSubmit={handleSubmit}>
                <h1 className="form-title">Collaborative Notepad</h1>

                <div className="form-group">
                    <label htmlFor="roomId">Room ID</label>
                    <div className="id-field-group">
                        <input
                            type="text"
                            id="roomId"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            onKeyUp={handleInputEnter}
                            required
                        />
                        <button type="button" className="generate-btn" onClick={handleToGenerateId}>
                            Generate
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyUp={handleInputEnter}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Join
                </button>
            </form>
        </div>
    );
};

export default Registration;