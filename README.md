## Collaborative Notepad App

This is a real-time collaborative notepad built with **React**, **Node.js (Express)**, and **Socket.IO**. Users can join shared rooms to collaboratively create, edit, delete, and merge notes, with all changes persisting in a **MongoDB** database.

---

### Features

* **Real-time Sync**: Instant updates across all connected users.
* **Room-Based Collaboration**: Work in isolated or shared rooms.
* **User Tracking**: See who's in your room.
* **Note Management**: Create, edit, and delete notes (creator/merger only).
* **Merge Notes**: Combine multiple notes into one new entry.
* **Data Persistence**: All notes are saved to MongoDB.

---


## Screenshots

Here are some screenshots showcasing the application's interface and functionality.

### 1. Registration / Room Join Page

This is where users enter their username and a room ID to start collaborating.

![Registration Page Screenshot](https://github.com/Aakifa-Islam/Collaborative_NotesTaking/blob/bba5baf882363389f7a6710ccc4dc0551422609f/output%20images/1.png)

### 2. Collaborative Environment

This shows the main notepad interface with multiple notes, the user list, and action buttons.
![Collaborative Environment Screenshot](https://github.com/Aakifa-Islam/Collaborative_NotesTaking/blob/bba5baf882363389f7a6710ccc4dc0551422609f/output%20images/2.png)


### 3. Merge functionality

![Merge Screenshot](https://github.com/Aakifa-Islam/Collaborative_NotesTaking/blob/bba5baf882363389f7a6710ccc4dc0551422609f/output%20images/3.png)

---

## Technologies Used

* **Frontend**: React, Socket.IO Client, UUID, React Hot Toast, React Router DOM
* **Backend**: Node.js, Express, Socket.IO, Mongoose, MongoDB, Cors



### Setup & Run

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd collaborative-notepad
    ```
2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    npm start
    ```
    (Ensure MongoDB is running locally update `backend/server.js`.)
3.  **Frontend Setup**:
    ```bash
    cd ../frontend/collaborative-app
    npm install
    npm run dev
    ```
4.  Open your browser to `http://localhost:5173`

---
