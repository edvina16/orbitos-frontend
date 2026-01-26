import React from "react";
import TaskCard from "./TaskCard";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import "./StateColumn.css";

export default function StateColumn({ state, tasks, dndStateId, onTaskCreated }) {
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const { setNodeRef } = useDroppable({ id: dndStateId });

    function handleCreateTask(e) {
        e.preventDefault();
        fetch(`http://localhost:5000/api/boards/${state.board_id}/states/${state.id}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
        })
            .then(res => res.json())
            .then(() => {
                setTitle("");
                setContent("");
                if (onTaskCreated) onTaskCreated();
            });
    }

    return (
        <div ref={setNodeRef} className="state-column">
            <h3 className="state-column-title">{state.name}</h3>
            <form onSubmit={handleCreateTask} className="state-column-form">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" required className="state-column-input" />
                <input value={content} onChange={e => setContent(e.target.value)} placeholder="Task content" required className="state-column-input" />
                <button type="submit" className="state-column-button">Add Task</button>
            </form>
            <div className="state-column-tasks">
                {tasks.map(task => (
                    <DraggableTaskCard key={task.id} task={task} stateId={state.id} boardId={state.board_id} />
                ))}
            </div>
        </div>
    );
}

function DraggableTaskCard({ task, stateId, boardId }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{
            opacity: isDragging ? 0.5 : 1,
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        }}>
            <TaskCard task={task} stateId={stateId} boardId={boardId} />
        </div>
    );
}
