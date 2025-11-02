// This file sets up React Router for your frontend, matching your Go backend API routes.
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import BoardList from "./BoardList";
import BoardView from "./BoardView";
import Login from "./Login";
import SignUp from "./SignUp";
import { signOut } from "./auth";

function BoardListPage() {
    const [boards, setBoards] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchBoards();
    }, []);

    function fetchBoards() {
        const token = localStorage.getItem("jwt");
        fetch("http://localhost:5000/api/boards", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
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
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
            return;
        }
        fetch(`http://localhost:5000/api/boards/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
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
            <AppContent theme={theme} toggleTheme={toggleTheme} />
        </Router>
    );
}

function AppContent({ theme, toggleTheme }) {
    const navigate = useNavigate();
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", margin: "32px 0 0 0" }}>
                <h1 className="app-title">orbitos</h1>
                <button onClick={toggleTheme} style={{ marginLeft: "auto", padding: "8px 16px", fontSize: "1rem" }}>
                    {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
                <button onClick={() => signOut(navigate)} style={{ marginLeft: "16px", padding: "8px 16px", fontSize: "1rem" }}>
                    Sign Out
                </button>
            </div>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/boards" element={<BoardListPage />} />
                <Route path="/boards/:id" element={<BoardViewPage />} />
                <Route path="*" element={<BoardListPage />} />
            </Routes>
        </div>
    );
}
