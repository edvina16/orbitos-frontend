import React from "react";
import "./StateColumn.css";

export default function TaskCard({ task, onDoubleClick }) {
    return (
        <div
            className="task-card task-card-relative"
            onDoubleClick={onDoubleClick}
            style={{ userSelect: "none" }}
        >
            <strong className="task-card-title">{task.title}</strong>
            <div className="task-card-content">{task.content}</div>
        </div>
    );
}