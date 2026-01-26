import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./TaskModal.css";

export default function TaskModal({ task, onClose, onSave, onDelete }) {
    console.log('TaskModal: render', task.id);

    const [title, setTitle] = useState(task.title);
    const [content, setContent] = useState(task.content);
    const [menuOpen, setMenuOpen] = useState(false);

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

    return (
        <>
            {ReactDOM.createPortal(
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
        </>
    );
}
