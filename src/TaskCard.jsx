import React, { useState } from "react";
import TaskModal from "./TaskModal";
import "./StateColumn.css";
import "./TaskModal.css";

export default function TaskCard({ task, stateId, boardId, onEdit, onDelete }) {
    const [modalOpen, setModalOpen] = useState(false);
    function handleSave(updatedTask) {
        console.log('TaskCard: handleSave called', updatedTask);
        onEdit(updatedTask);
        setModalOpen(false);
    }
    function handleDelete(taskId) {
        onDelete(taskId);
        setModalOpen(false);
    }
    return (
        <>
            <div
                className="task-card task-card-relative"
                onDoubleClick={() => setModalOpen(true)}
            >
                <strong className="task-card-title">{task.title}</strong>
                <div className="task-card-content">{task.content}</div>
            </div>
            {modalOpen && (
                <TaskModal
                    task={task}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}