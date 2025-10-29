import React from "react";
import "./StateColumn.css";

export default function TaskCard({ task, stateId, boardId, onMoveTask }) {
    return (
        <div className="task-card">
            <strong className="task-card-title">{task.title}</strong>
            <div className="task-card-content">{task.content}</div>
        </div>
    );
}