// This file sets up React Router for your frontend, matching your Go backend API routes.
import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import BoardList from "./BoardList";
import BoardView from "./BoardView";

function BoardListPage() {
    const [boards, setBoards] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        fetch("http://localhost:5000/api/boards")
            .then(res => res.json())
            .then(data => setBoards(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    function handleSelectBoard(board) {
        navigate(`/boards/${board.id}`);
    }

    function handleBoardCreated(newBoard) {
        setBoards(prev => [...prev, newBoard]);
    }

    return (
        <BoardList boards={boards} onSelect={handleSelectBoard} onBoardCreated={handleBoardCreated} />
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
    return (
        <Router>
            <div>
                <h1 style={{ textAlign: "center", margin: "32px 0", fontSize: "2.5rem", color: "#2563eb" }}>ICpal</h1>
                <Routes>
                    <Route path="/boards" element={<BoardListPage />} />
                    <Route path="/boards/:id" element={<BoardViewPage />} />
                    <Route path="*" element={<BoardListPage />} />
                </Routes>
            </div>
        </Router>
    );
}

