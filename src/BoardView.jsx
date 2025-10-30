import React, { useEffect, useState } from "react";
import StateColumn from "./StateColumn";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import "./BoardView.css";

export default function BoardView({ board, goBack }) {
    const [states, setStates] = useState([]);
    const [stateTasks, setStateTasks] = useState({});
    const [stateName, setStateName] = useState("");
    const [draggedTask, setDraggedTask] = useState(null);
    const [editStateId, setEditStateId] = useState(null);
    const [editStateName, setEditStateName] = useState("");

    function fetchStatesAndTasks() {
        console.log('BoardView: fetchStatesAndTasks called');
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
                console.log('BoardView: tasksByState after update', tasksByState);
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

    function handleColumnDragEnd(event) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = states.findIndex(s => s.id === active.id);
            const newIndex = states.findIndex(s => s.id === over.id);
            const newOrder = arrayMove(states, oldIndex, newIndex);
            setStates(newOrder);
            // Persist new order to backend
            fetch(`http://localhost:5000/api/boards/${board.id}/states/order`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: newOrder.map(s => s.id) })
            }).then(() => fetchStatesAndTasks());
        }
    }

    function handleTaskDragStart(event) {
        setDraggedTask(event.active.id);
    }

    function handleTaskDragEnd(event) {
        const { active, over } = event;
        console.log('BoardView: handleTaskDragEnd', { active, over });
        if (active && over && active.id !== undefined && over.id !== undefined) {
            const taskId = active.id;
            const newStateId = over.id;
            const boardId = board.id;
            // Find the full task object
            let movedTask = null;
            for (const tasks of Object.values(stateTasks)) {
                const found = tasks.find(t => t.id === taskId);
                if (found) {
                    movedTask = found;
                    break;
                }
            }
            if (!movedTask) {
                console.error('BoardView: moved task not found', taskId);
                return;
            }
            // Send all task data plus newStateId
            fetch(`http://localhost:5000/api/boards/${boardId}/states/${newStateId}/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...movedTask,
                    state_id: newStateId,
                    board_id: boardId
                }),
            })
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => {
                        console.error('BoardView: move task failed', res.status, text);
                    });
                }
                return res;
            })
            .then(() => {
                fetchStatesAndTasks();
            });
        }
        setDraggedTask(null);
    }

    function onTaskCreated() {
        fetchStatesAndTasks();
    }

    function onTasksChanged() {
        fetchStatesAndTasks();
    }

    function handleEditState(state) {
        setEditStateId(state.id);
        setEditStateName(state.name);
    }

    function handleUpdateState(e) {
        e.preventDefault();
        fetch(`http://localhost:5000/api/boards/${board.id}/states/${editStateId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editStateName })
        }).then(res => res.json()).then(() => {
            setEditStateId(null);
            setEditStateName("");
            fetchStatesAndTasks();
        });
    }

    function handleDeleteState(stateId) {
        fetch(`http://localhost:5000/api/boards/${board.id}/states/${stateId}`, {
            method: "DELETE"
        }).then(() => {
            fetchStatesAndTasks();
        });
    }

    function handleCancelEditState() {
        setEditStateId(null);
        setEditStateName("");
    }

    // Find the dragged task object for overlay
    const draggedTaskObj = draggedTask
        ? Object.values(stateTasks).flat().find(t => t.id === draggedTask)
        : null;

    // Gather all task IDs for SortableContext
    const allTaskIds = Object.values(stateTasks).flat().map(task => task.id);

    // No-op fallback for handlers
    const noop = () => {};

    return (
        <div className="board-view-page">
            <div className="board-view-container">
                <button onClick={goBack} className="board-view-back-btn">Back to boards</button>
                <h2 className="board-view-title">{board.name}</h2>
                <form onSubmit={handleCreateState} className="board-view-form">
                    <input value={stateName} onChange={e => setStateName(e.target.value)} placeholder="State name" required className="board-view-input" />
                    <button type="submit" className="board-view-add-btn">Add Column</button>
                </form>
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleTaskDragEnd || noop}
                    onDragStart={handleTaskDragStart || noop}
                >
                    <SortableContext items={allTaskIds}>
                        <div className="board-view-columns-row">
                            <div className="board-view-columns">
                                {states.map(state => (
                                    <SortableStateColumn
                                        key={state.id}
                                        id={state.id}
                                        state={state}
                                        tasks={stateTasks[state.id] || []}
                                        dndStateId={state.id}
                                        onTasksChanged={(action, payload) => {
                                            if (action === 'editState') handleEditState(payload);
                                            else if (action === 'deleteState') handleDeleteState(payload);
                                            else onTasksChanged();
                                        }}
                                        editStateId={editStateId}
                                        editStateName={editStateName}
                                        onUpdateState={handleUpdateState}
                                        setEditStateName={setEditStateName}
                                        handleCancelEditState={handleCancelEditState}
                                        handleTaskDragEnd={handleTaskDragEnd}
                                    />
                                ))}
                            </div>
                        </div>
                    </SortableContext>
                    <DragOverlay>
                        {draggedTaskObj ? (
                            <div style={{ zIndex: 9999 }}>
                                <div className="task-card task-card-relative" style={{ pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', background: '#fff', borderRadius: 8 }}>
                                    <strong className="task-card-title">{draggedTaskObj.title}</strong>
                                    <div className="task-card-content">{draggedTaskObj.content}</div>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}

function SortableStateColumn(props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
    return (
        <div ref={setNodeRef} style={{
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            transition,
            opacity: isDragging ? 0.5 : 1,
            position: 'relative',
        }}>
            <div
                {...attributes}
                {...listeners}
                className="state-column-drag-bar"
                style={{
                    width: '100%',
                    height: 32,
                    background: 'transparent',
                    cursor: 'grab',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    userSelect: 'none',
                    zIndex: 3,
                }}
                aria-label="Drag column"
            />
            <StateColumn {...props} />
        </div>
    );
}
