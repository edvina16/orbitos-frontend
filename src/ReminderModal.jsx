import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./TaskModal.css";

export default function ReminderModal({ onClose, onCreate }) {
    const [remindAt, setRemindAt] = useState("");
    const [remindTime, setRemindTime] = useState("");
    const [frequency, setFrequency] = useState(0);
    const [message, setMessage] = useState("");

    function handleCreate(e) {
        e.preventDefault();
        if (!remindAt || !remindTime) {
            alert("Please select date and time.");
            return;
        }
        onCreate({
            remind_at: `${remindAt}T${remindTime}`,
            frequency,
            message
        });
    }

    function handleCancel(e) {
        e.preventDefault();
        onClose();
    }

    const modalContent = (
        <div className="task-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="task-modal" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleCreate} className="task-modal-form">
                    <input
                        type="date"
                        value={remindAt}
                        onChange={e => setRemindAt(e.target.value)}
                        required
                        className="task-modal-title"
                        style={{ marginBottom: 0 }}
                    />
                    <input
                        type="time"
                        value={remindTime}
                        onChange={e => setRemindTime(e.target.value)}
                        required
                        className="task-modal-title"
                        style={{ marginBottom: 0 }}
                    />
                    <select
                        value={frequency}
                        onChange={e => setFrequency(Number(e.target.value))}
                        className="task-modal-title"
                        style={{ marginBottom: 0 }}
                    >
                        <option value={0}>Do not repeat</option>
                        <option value={1}>Daily</option>
                        <option value={7}>Weekly</option>
                        <option value={30}>Monthly</option>
                    </select>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Reminder message"
                        className="task-modal-content"
                        style={{ marginBottom: 0 }}
                    />
                    <div className="task-modal-actions">
                        <button type="submit" className="task-modal-save">Create Reminder</button>
                        <button type="button" className="task-modal-cancel" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}
