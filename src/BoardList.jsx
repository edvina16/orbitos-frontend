import React, { useState } from "react";
import "./BoardList.css";

export default function BoardList({ boards, onSelect, onBoardCreated, onBoardUpdated, onBoardDeleted }) {
    const [name, setName] = useState("");
    const [editBoardId, setEditBoardId] = useState(null);
    const [editBoardName, setEditBoardName] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        fetch("http://localhost:5000/api/boards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
            .then(res => res.json())
            .then(board => {
                onBoardCreated(board);
                setName("");
            });
    }

    function handleEditBoard(board) {
        setEditBoardId(board.id);
        setEditBoardName(board.name);
    }

    function handleUpdateBoard(e) {
        e.preventDefault();
        fetch(`http://localhost:5000/api/boards/${editBoardId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editBoardName })
        }).then(res => res.json()).then(updated => {
            setEditBoardId(null);
            setEditBoardName("");
            if (onBoardUpdated) onBoardUpdated(updated);
        });
    }

    function handleDeleteBoard(boardId) {
        fetch(`http://localhost:5000/api/boards/${boardId}`, {
            method: "DELETE"
        }).then(() => {
            if (onBoardDeleted) onBoardDeleted(boardId);
        });
    }

    function handleCancelEdit() {
        setEditBoardId(null);
        setEditBoardName("");
    }

    return (
        <div className="board-list-container">
            <h2 className="board-list-title">Boards</h2>
            <form onSubmit={handleSubmit} className="board-list-form">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Board name" required className="board-list-input" />
                <button type="submit" className="board-list-create-btn">Create Board</button>
            </form>
            <ul className="board-list-ul">
                {boards.length === 0 ? (
                    <li className="board-list-empty">No boards yet. Create one above!</li>
                ) : (
                    boards.map(board => (
                        <li key={board.id} className="board-list-li">
                            {editBoardId === board.id ? (
                                <form onSubmit={handleUpdateBoard} className="board-list-edit-form">
                                    <input value={editBoardName} onChange={e => setEditBoardName(e.target.value)} required className="board-list-edit-input" />
                                    <button type="submit" className="board-list-save-btn">Save</button>
                                    <button type="button" onClick={handleCancelEdit} className="board-list-cancel-btn">Cancel</button>
                                </form>
                            ) : (
                                <div className="board-list-card-row">
                                    <button onClick={() => onSelect(board)} className="board-list-card-btn">{board.name}</button>
                                    <button onClick={() => handleEditBoard(board)} title="Edit board" className="board-list-icon-btn">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3 17h2.5l9.1-9.1a1.5 1.5 0 0 0-2.1-2.1L3.4 14.9V17z" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                                            <path d="M13.5 6.5l2 2" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                                        </svg>
                                    </button>
                                    <button onClick={() => handleDeleteBoard(board.id)} title="Delete board" className="board-list-icon-btn">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <line x1="5" y1="5" x2="15" y2="15" stroke="var(--heading)" strokeWidth="2"/>
                                            <line x1="15" y1="5" x2="5" y2="15" stroke="var(--heading)" strokeWidth="2"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}