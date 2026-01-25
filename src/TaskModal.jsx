import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./TaskModal.css";
import ReminderModal from "./ReminderModal";

export default function TaskModal({ task, onClose, onSave, onDelete }) {
    console.log('TaskModal: render', task.id);

    const [title, setTitle] = useState(task.title);
    const [content, setContent] = useState(task.content);
    const [menuOpen, setMenuOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);

    function handleSave(e) {
        e.preventDefault();
        console.log('TaskModal: handleSave called', { title, content });
        if (typeof onSave !== 'function') {
            console.error('TaskModal: onSave prop is missing or not a function. No request will be made.');
            alert('Error: Task changes will not be saved. Please check TaskModal usage.');
            return;
        }
        console.log('TaskModal: calling onSave');
        onSave({ ...task, title, content });
    }

    function handleDelete() {
        setMenuOpen(false);
        console.log('TaskModal: handleDelete called', { id: task.id });
        onDelete(task.id);
    }

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            e.stopPropagation(); // Prevent bubbling to parent
            onClose();
        }
    }

    function handleCancelClick(e) {
        e.preventDefault(); // Prevent default button behavior
        e.stopPropagation(); // Prevent bubbling to parent (drag-and-drop)
        onClose();
    }

    // Bell icon click handler
    function handleBellClick(e) {
        e.stopPropagation();
        setReminderOpen(true);
    }

    // Reminder create handler
    async function handleCreateReminder(reminderData) {
        try {
            // Ensure remind_at is RFC3339 with seconds and timezone (Z for UTC)
            let remindAt = reminderData.remind_at;
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(remindAt)) {
                remindAt += ':00Z';
            } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(remindAt)) {
                remindAt += 'Z';
            } else if (!remindAt.endsWith('Z') && !remindAt.match(/[+-]\d{2}:\d{2}$/)) {
                remindAt += 'Z';
            }
            // Convert frequency to string, send empty string if 0
            const frequency = reminderData.frequency === 0 ? "" : String(reminderData.frequency);
            const payload = {
                message: reminderData.message,
                remind_at: remindAt,
                frequency: frequency,
            };
            console.log('Submitting reminder:', payload);
            // Get JWT token from localStorage (should use 'jwt' for consistency)
            const token = localStorage.getItem('jwt');
            const response = await fetch(`http://localhost:5000/api/tasks/${task.id}/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
                credentials: 'include', // Send cookies/session for authentication
            });
            const text = await response.text();
            console.log('Raw response:', text);
            if (!response.ok) {
                try {
                    const error = JSON.parse(text);
                    alert(error.error || 'Failed to create reminder');
                } catch {
                    alert(text || 'Failed to create reminder');
                }
            } else {
                try {
                    const result = JSON.parse(text);
                    console.log('Reminder created:', result);
                } catch {
                    console.log('Reminder created, but response not JSON:', text);
                }
                setReminderOpen(false);
            }
        } catch (err) {
            alert('Network error: ' + err.message);
        }
    }

    // Bell icon style
    const bellStyle = {
        position: 'absolute',
        top: 16,
        right: 24,
        zIndex: 10001,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.7em',
        padding: 0,
        margin: 0,
    };

    // Only render TaskModal overlay if reminder modal is not open
    return (
        <>
            {!reminderOpen && ReactDOM.createPortal(
                <div
                    className="task-modal-overlay"
                    onClick={handleOverlayClick}
                    style={{
                        userSelect: 'none',
                        pointerEvents: 'all',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999,
                        background: 'rgba(0,0,0,0.2)'
                    }}
                >
                    <div
                        className="task-modal"
                        onClick={e => e.stopPropagation()}
                        style={{ pointerEvents: 'all', zIndex: 10000, position: 'relative' }}
                    >
                        {/* Bell icon in top right, not overlapping title */}
                        <button
                            type="button"
                            aria-label="Set Reminder"
                            style={bellStyle}
                            onClick={handleBellClick}
                        >
                            {/* Use emoji bell since bell.svg does not exist */}
                            <span role="img" aria-label="bell">🔔</span>
                        </button>
                        <form onSubmit={handleSave} className="task-modal-form" style={{ paddingTop: 32 }}>
                            <input
                                className="task-modal-title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="Task title"
                            />
                            <textarea
                                className="task-modal-content"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                                placeholder="Task content"
                            />
                            <div className="task-modal-actions">
                                <button type="submit" className="task-modal-save">Save</button>
                                <button
                                    type="button"
                                    className="task-modal-cancel"
                                    onClick={handleCancelClick}
                                    onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseUp={e => { e.preventDefault(); e.stopPropagation(); }}
                                    onPointerDown={e => { e.preventDefault(); e.stopPropagation(); }}
                                    onPointerUp={e => { e.preventDefault(); e.stopPropagation(); }}
                                >
                                    Cancel
                                </button>
                                <div className="task-modal-menu-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                    <button
                                        type="button"
                                        className="task-modal-menu-btn"
                                        onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
                                        title="Task actions"
                                        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                                        onMouseUp={e => { e.preventDefault(); e.stopPropagation(); }}
                                        onPointerDown={e => { e.preventDefault(); e.stopPropagation(); }}
                                        onPointerUp={e => { e.preventDefault(); e.stopPropagation(); }}
                                    >
                                        <span style={{ fontSize: '1.5em', verticalAlign: 'middle' }}>⋮</span>
                                    </button>
                                    {menuOpen && (
                                        <div
                                            className="task-modal-menu"
                                            aria-hidden={!menuOpen}
                                            style={{ display: menuOpen ? 'block' : 'none' }}
                                        >
                                            <button type="button" className="task-modal-menu-item" onClick={handleDelete}>Delete</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            {reminderOpen && (
                <ReminderModal
                    onClose={() => setReminderOpen(false)}
                    onCreate={handleCreateReminder}
                />
            )}
        </>
    );
}
