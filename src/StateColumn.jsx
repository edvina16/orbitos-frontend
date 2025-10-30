import React, { useState } from "react";
import TaskCard from "./TaskCard";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import "./StateColumn.css";

export default function StateColumn({ state, tasks, dndStateId, onTasksChanged, editStateId, editStateName, onUpdateState, setEditStateName, handleCancelEditState }) {
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [showAddTaskForm, setShowAddTaskForm] = React.useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
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
                setShowAddTaskForm(false);
                if (onTasksChanged) onTasksChanged();
            });
    }

    function handleEditTask(updatedTask) {
        console.log('StateColumn: handleEditTask called', updatedTask);
        fetch(`http://localhost:5000/api/boards/${state.board_id}/states/${state.id}/tasks/${updatedTask.id}`, {
            method: "PUT", // Changed from POST to PUT for REST convention and backend compatibility
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: updatedTask.title, content: updatedTask.content })
        })
        .then(res => {
            console.log('StateColumn: handleEditTask response', res);
            if (!res.ok) {
                res.text().then(text => {
                    console.error('StateColumn: update failed', res.status, text);
                });
                throw new Error('Failed to update task');
            }
            return res.json();
        })
        .then(data => {
            console.log('StateColumn: handleEditTask data', data);
            if (onTasksChanged) onTasksChanged();
        })
        .catch(err => {
            console.error('StateColumn: handleEditTask error', err);
        });
    }

    function handleDeleteTask(taskId) {
        console.log('StateColumn: handleDeleteTask called', taskId);
        fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: "DELETE"
        })
        .then(res => {
            console.log('StateColumn: handleDeleteTask response', res);
            if (!res.ok) throw new Error('Failed to delete task');
            return res.json();
        })
        .then(data => {
            console.log('StateColumn: handleDeleteTask data', data);
            if (onTasksChanged) onTasksChanged();
        })
        .catch(err => {
            console.error('StateColumn: handleDeleteTask error', err);
        });
    }

    function handleShowAddTaskForm() {
        setShowAddTaskForm(true);
    }
    function handleCancelAddTask() {
        setShowAddTaskForm(false);
        setTitle("");
        setContent("");
    }

    return (
        <div ref={setNodeRef} className="state-column">
            <div className="state-column-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editStateId === state.id ? (
                    <form onSubmit={onUpdateState} className="state-column-form" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <input
                            value={editStateName}
                            onChange={e => setEditStateName(e.target.value)}
                            required
                            className="state-column-input"
                            style={{ flex: 1, minWidth: 0 }}
                        />
                        <div className="state-column-form-row">
                            <button type="submit" className="state-column-form-btn-save">Save</button>
                            <button type="button" onClick={handleCancelEditState} className="state-column-form-btn-cancel">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <span className="state-column-title-text">{state.name}</span>
                        <button
                            className="state-column-menu-btn"
                            onClick={() => setMenuOpen(m => !m)}
                            title="State actions"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4 }}
                        >
                            <span style={{ fontSize: '1.5em', verticalAlign: 'middle' }}>⋮</span>
                        </button>
                        {menuOpen && (
                            <div className="state-column-menu" style={{ position: 'absolute', right: 0, top: '2.2em', background: 'var(--button-bg)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 2px 8px var(--border)', zIndex: 10 }}>
                                <button className="state-column-menu-item" onClick={() => { setMenuOpen(false); onTasksChanged('editState', state); }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '8px 16px', textAlign: 'left', cursor: 'pointer', color: 'var(--text)' }}>Edit State</button>
                                <button className="state-column-menu-item" onClick={() => { setMenuOpen(false); onTasksChanged('deleteState', state.id); }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '8px 16px', textAlign: 'left', cursor: 'pointer', color: 'var(--accent)' }}>Delete State</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="state-column-tasks">
                {tasks.map(task => (
                    <DraggableTaskCard
                        key={task.id}
                        task={task}
                        stateId={state.id}
                        boardId={state.board_id}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                ))}
            </div>
            {showAddTaskForm ? (
                <form onSubmit={handleCreateTask} className="state-column-form">
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" required className="state-column-input" />
                    <input value={content} onChange={e => setContent(e.target.value)} placeholder="Task content" required className="state-column-input" />
                    <div className="state-column-form-row">
                        <button type="submit" className="state-column-form-btn-save">Save</button>
                        <button type="button" onClick={handleCancelAddTask} className="state-column-form-btn-cancel">Cancel</button>
                    </div>
                </form>
            ) : (
                <button onClick={handleShowAddTaskForm} className="state-column-add-btn">Add Task</button>
            )}
        </div>
    );
}

function DraggableTaskCard({ task, stateId, boardId, onDelete, onEdit }) {
    const { setNodeRef, transform, isDragging, listeners, attributes } = useDraggable({ id: task.id });
    const [modalOpen, setModalOpen] = useState(false);
    React.useEffect(() => {}, [modalOpen]); // Force re-render on modalOpen change
    function handleSave(updatedTask) {
        console.log('DraggableTaskCard: handleSave called', updatedTask);
        onEdit(updatedTask);
        setModalOpen(false);
    }
    function handleDelete(taskId) {
        console.log('DraggableTaskCard: handleDelete called', taskId);
        onDelete(taskId);
        setModalOpen(false);
    }
    return (
        <>
            {!modalOpen && (
                <div
                    ref={setNodeRef}
                    style={{
                        opacity: isDragging ? 0.5 : 1,
                        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                        pointerEvents: modalOpen ? 'none' : 'auto',
                        background: 'var(--bg)', // Ensure background matches theme
                        borderRadius: '8px', // match TaskCard style
                    }}
                    {...listeners}
                    {...attributes}
                    onClick={e => {
                        if (!isDragging) {
                            e.stopPropagation();
                            setModalOpen(true);
                        }
                    }}
                >
                    <TaskCard task={task} stateId={stateId} boardId={boardId} onEdit={onEdit} onDelete={onDelete} />
                </div>
            )}
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
