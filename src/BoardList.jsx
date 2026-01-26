import React, { useState } from "react";

export default function BoardList({ boards, onSelect, onBoardCreated }) {
    const [name, setName] = useState("");

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

    return (
        <div style={{ maxWidth: "500px", margin: "48px auto", background: "#f3f4f6", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", padding: "40px 32px" }}>
            <h2 style={{ marginBottom: "28px", fontSize: "2rem", fontWeight: "700", color: "#1e293b", letterSpacing: "-1px" }}>Boards</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Board name" required style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "1rem", color: "#334155" }} />
                <button type="submit" style={{ padding: "12px 24px", borderRadius: "8px", border: "none", background: "linear-gradient(90deg,#2563eb 0%,#1d4ed8 100%)", color: "#fff", fontWeight: "600", fontSize: "1rem", boxShadow: "0 2px 8px rgba(37,99,235,0.08)", cursor: "pointer", transition: "background 0.2s" }}>Create Board</button>
            </form>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {boards.length === 0 ? (
                    <li style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>No boards yet. Create one above!</li>
                ) : (
                    boards.map(board => (
                        <li key={board.id} style={{ marginBottom: "16px" }}>
                            <button onClick={() => onSelect(board)} style={{ width: "100%", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: "600", fontSize: "1.1rem", cursor: "pointer", color: "#2563eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "background 0.2s" }}>{board.name}</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}