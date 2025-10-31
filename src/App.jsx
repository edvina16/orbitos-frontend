// This file sets up React Router for your frontend, matching your Go backend API routes.
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import BoardList from "./BoardList";
import BoardView from "./BoardView";

function BoardListPage() {
    const [boards, setBoards] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        fetchBoards();
    }, []);

    function fetchBoards() {
        fetch("http://localhost:5000/api/boards")
            .then(res => res.json())
            .then(data => setBoards(Array.isArray(data) ? data : []))
            .catch(console.error);
    }

    function handleSelectBoard(board) {
        navigate(`/boards/${board.id}`);
    }

    function handleBoardCreated(newBoard) {
        fetchBoards();
    }

    function handleBoardUpdated() {
        fetchBoards();
    }

    function handleBoardDeleted() {
        fetchBoards();
    }

    return (
        <BoardList
            boards={boards}
            onSelect={handleSelectBoard}
            onBoardCreated={handleBoardCreated}
            onBoardUpdated={handleBoardUpdated}
            onBoardDeleted={handleBoardDeleted}
        />
    );
}

function BoardViewPage() {
    const { id } = useParams();
    const [board, setBoard] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        fetch(`http://localhost:5000/api/boards/${id}`)
            .then(res => res.json())
            .then(data => setBoard(data))
            .catch(console.error);
    }, [id]);

    if (!board) return <div>Loading...</div>;
    return <BoardView board={board} goBack={() => navigate("/boards")} />;
}

export default function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme(t => (t === "dark" ? "light" : "dark"));
    }

    return (
        <Router>
            <div>
                <div style={{ display: "flex", alignItems: "center", margin: "32px 0 0 0" }}>
                    <h1 className="app-title">atmon</h1>
                    <button onClick={toggleTheme} style={{ marginLeft: "auto", padding: "8px 16px", fontSize: "1rem" }}>
                        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                    </button>
                </div>
                <Routes>
                    <Route path="/boards" element={<BoardListPage />} />
                    <Route path="/boards/:id" element={<BoardViewPage />} />
                    <Route path="*" element={<BoardListPage />} />
                </Routes>
            </div>
        </Router>
    );
}
