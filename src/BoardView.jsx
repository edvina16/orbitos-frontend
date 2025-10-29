import React, { useEffect, useState } from "react";
import StateColumn from "./StateColumn";
import { DndContext } from "@dnd-kit/core";

export default function BoardView({ board, goBack }) {
    const [states, setStates] = useState([]);
    const [stateTasks, setStateTasks] = useState({});
    const [stateName, setStateName] = useState("");
    const [draggedTask, setDraggedTask] = useState(null);

    function fetchStatesAndTasks() {
        fetch(`http://localhost:5000/api/boards/${board.id}/states`)
            .then(res => res.json())
            .then(async data => {
                setStates(Array.isArray(data) ? data : []);
                // Fetch tasks for each state in parallel
                const tasksByState = {};
                await Promise.all(
                    (Array.isArray(data) ? data : []).map(async state => {
                        const res = await fetch(`http://localhost:5000/api/boards/${board.id}/states/${state.id}/tasks`);
                        const tasks = await res.json();
                        tasksByState[state.id] = Array.isArray(tasks) ? tasks : [];
                    })
                );
                setStateTasks(tasksByState);
            })
            .catch(console.error);
    }

    useEffect(() => {
        fetchStatesAndTasks();
    }, [board.id]);

    function handleCreateState(e) {
        e.preventDefault();
        fetch(`http://localhost:5000/api/boards/${board.id}/states`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: stateName }),
        })
            .then(res => res.json())
            .then(() => {
                setStateName("");
                fetchStatesAndTasks(); // Always refresh from backend
            });
    }

    function handleDragStart(event) {
        setDraggedTask(event.active.id);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (active && over && active.id !== undefined && over.id !== undefined) {
            const taskId = active.id;
            const newStateId = over.id;
            const boardId = board.id;
            fetch(`http://localhost:5000/api/boards/${boardId}/states/${newStateId}/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            }).then(() => {
                fetchStatesAndTasks();
            });
        }
        setDraggedTask(null);
    }

    function onTaskCreated() {
        fetchStatesAndTasks();
    }

    return (
        <div style={{ padding: "32px", background: "#f4f6fa", minHeight: "100vh" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", padding: "40px 32px" }}>
                <button onClick={goBack} style={{ marginBottom: "16px", padding: "10px 20px", borderRadius: "8px", border: "none", background: "#e0e7ef", color: "#2563eb", fontWeight: "600", cursor: "pointer" }}>Back to boards</button>
                <h2 style={{ marginBottom: "24px", fontSize: "2rem", fontWeight: "700", color: "#1e293b" }}>{board.name}</h2>
                <form onSubmit={handleCreateState} style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                    <input value={stateName} onChange={e => setStateName(e.target.value)} placeholder="State name" required style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "1rem", color: "#334155" }} />
                    <button type="submit" style={{ padding: "12px 24px", borderRadius: "8px", border: "none", background: "linear-gradient(90deg,#22c55e 0%,#16a34a 100%)", color: "#fff", fontWeight: "600", fontSize: "1rem", boxShadow: "0 2px 8px rgba(34,197,94,0.08)", cursor: "pointer", transition: "background 0.2s" }}>Add Column</button>
                </form>
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", overflowX: "auto" }}>
                        {states.map(state => (
                            <StateColumn key={state.id} state={state} tasks={stateTasks[state.id] || []} dndStateId={state.id} onTaskCreated={onTaskCreated} />
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
}