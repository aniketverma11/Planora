import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    MoreVert,
    Edit,
    Delete,
    CalendarToday,
    Timeline,
    Warning,
    ErrorOutline
} from '@mui/icons-material';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { patchTask } from '../services/api';

const TaskCard = ({ task, onMenuOpen, onTaskClick, getSubtaskCount, getCompletedSubtasks }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id.toString() });

    // Helper function to strip HTML and decode entities
    const getPlainTextFromHTML = (html) => {
        if (!html) return '';
        // Create a temporary div to decode HTML entities
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const text = temp.textContent || temp.innerText || '';
        return text;
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    const subtaskCount = getSubtaskCount(task.id);
    const completedSubtasks = getCompletedSubtasks(task.id);
    const validStatuses = ['To Do', 'In Progress', 'Done'];
    const hasInvalidStatus = !task.status || !validStatuses.includes(task.status);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            sx={{
                mb: 2,
                bgcolor: 'white',
                boxShadow: isDragging 
                    ? '0 12px 24px rgba(0,0,0,0.25)' 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: isDragging ? 'none' : 'auto', // Prevent text selection when dragging
                WebkitUserSelect: isDragging ? 'none' : 'auto',
                '&:hover': {
                    boxShadow: isDragging 
                        ? '0 12px 24px rgba(0,0,0,0.25)' 
                        : '0 4px 12px rgba(0,0,0,0.15)',
                    transform: isDragging ? 'none' : 'translateY(-2px)'
                },
                transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                border: hasInvalidStatus ? '2px solid #dc2626' : '1px solid #e2e8f0',
                transform: isDragging ? 'rotate(3deg) scale(1.02)' : 'none',
            }}
            onClick={() => onTaskClick(task)}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Invalid Status Warning */}
                {hasInvalidStatus && (
                    <Box 
                        sx={{ 
                            mb: 2, 
                            p: 1.5, 
                            bgcolor: '#fef2f2', 
                            border: '1px solid #fecaca',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Warning sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: '#dc2626', fontWeight: 600, mb: 0.5 }}>
                                Invalid Status
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#7f1d1d' }}>
                                Current status: "{task.status || 'None'}" - Please edit this task and set a valid status (To Do, In Progress, or Done)
                            </Typography>
                        </Box>
                    </Box>
                )}
                
                <Box 
                    {...listeners}
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        mb: 1.5,
                        userSelect: 'none', // Prevent text selection
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        cursor: 'grab',
                        '&:active': {
                            cursor: 'grabbing'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1 }}>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: 600, 
                                color: '#1e293b',
                                flex: 1,
                                pr: 1
                            }}
                        >
                            {task.text}
                        </Typography>
                        {/* Critical Path Indicators */}
                        {task.is_critical && (
                            <Tooltip 
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            🔴 Critical Task
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            This task is on the critical path with <strong>0 days</strong> of float time.
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Why:</strong> Any delay will directly impact the project completion date.
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                            ES: Day {task.early_start_day} | LS: Day {task.late_start_day}
                                        </Typography>
                                    </Box>
                                }
                                arrow
                                placement="top"
                            >
                                <ErrorOutline 
                                    sx={{ 
                                        color: '#dc2626', 
                                        fontSize: '1.2rem',
                                        cursor: 'help',
                                        animation: 'pulse 2s infinite'
                                    }} 
                                />
                            </Tooltip>
                        )}
                        {!task.is_critical && task.total_float !== null && task.total_float > 0 && task.total_float <= 2 && (
                            <Tooltip 
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            🟠 Near-Critical Task
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            This task has only <strong>{task.total_float} day{task.total_float > 1 ? 's' : ''}</strong> of float time.
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Why:</strong> Monitor closely - small delays could make this critical.
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                            ES: Day {task.early_start_day} | LS: Day {task.late_start_day} | Float: {task.total_float}d
                                        </Typography>
                                    </Box>
                                }
                                arrow
                                placement="top"
                            >
                                <Warning 
                                    sx={{ 
                                        color: '#f59e0b', 
                                        fontSize: '1.2rem',
                                        cursor: 'help'
                                    }} 
                                />
                            </Tooltip>
                        )}
                    </Box>
                    <IconButton 
                        size="small" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMenuOpen(e, task);
                        }}
                        sx={{ color: '#64748b' }}
                    >
                        <MoreVert fontSize="small" />
                    </IconButton>
                </Box>

                {task.description && (
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#64748b', 
                            mb: 1.5,
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {(() => {
                            const plainText = getPlainTextFromHTML(task.description);
                            return plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '');
                        })()}
                    </Typography>
                )}

                <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                            {task.progress}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={task.progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: task.progress === 100 ? '#10b981' : task.progress > 0 ? '#f59e0b' : '#64748b',
                                borderRadius: 3
                            }
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                    <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                            bgcolor: task.priority === 'High' ? '#fee2e2' : task.priority === 'Medium' ? '#fef3c7' : '#dbeafe',
                            color: task.priority === 'High' ? '#991b1b' : task.priority === 'Medium' ? '#92400e' : '#1e40af',
                            fontSize: '0.75rem',
                            height: '24px',
                            fontWeight: 600
                        }}
                    />
                    <Chip
                        icon={<CalendarToday sx={{ fontSize: '0.875rem' }} />}
                        label={new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        size="small"
                        sx={{
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.75rem',
                            height: '24px'
                        }}
                    />
                    <Chip
                        icon={<Timeline sx={{ fontSize: '0.875rem' }} />}
                        label={`${task.duration}d`}
                        size="small"
                        sx={{
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.75rem',
                            height: '24px'
                        }}
                    />
                    {subtaskCount > 0 && (
                        <Chip
                            label={`${completedSubtasks}/${subtaskCount} subtasks`}
                            size="small"
                            sx={{
                                bgcolor: completedSubtasks === subtaskCount ? '#d1fae5' : '#fef3c7',
                                color: completedSubtasks === subtaskCount ? '#065f46' : '#92400e',
                                fontSize: '0.75rem',
                                height: '24px'
                            }}
                        />
                    )}
                </Box>

                {task.assignee_username && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                            sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: '#3b82f6',
                                fontSize: '0.75rem'
                            }}
                        >
                            {task.assignee_username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {task.assignee_username}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const DroppableColumn = ({ children, id }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <Box
            ref={setNodeRef}
            sx={{
                minHeight: '500px',
                borderRadius: 2,
                p: 1,
                transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                bgcolor: isOver ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.02)',
                border: isOver ? '2px dashed rgba(0, 0, 0, 0.3)' : '2px dashed transparent',
                touchAction: 'none', // Prevent browser touch gestures
            }}
        >
            {children}
        </Box>
    );
};

const KanbanBoard = ({ tasks, onRefresh, onTaskClick, onEditTask, onDeleteTask }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeId, setActiveId] = useState(null);

    // Debug logging
    useEffect(() => {
        console.log('🎯 KanbanBoard: Received tasks prop:', tasks);
        console.log('🎯 KanbanBoard: tasks.data length:', tasks?.data?.length);
        console.log('🎯 KanbanBoard: Sample tasks:', tasks?.data?.slice(0, 3));
        if (tasks?.data?.length > 0) {
            console.log('🎯 KanbanBoard: Task statuses:', tasks.data.map(t => ({ id: t.id, text: t.text, status: t.status })));
        }
    }, [tasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Optimal distance to prevent text selection
            },
        })
    );

    const validStatuses = ['To Do', 'In Progress', 'Done'];

    const columns = {
        'To Do': { status: 'To Do', color: '#64748b' },
        'In Progress': { status: 'In Progress', color: '#f59e0b' },
        'Done': { status: 'Done', color: '#10b981' },
        'Invalid Status': { status: 'Invalid Status', color: '#dc2626' }
    };

    const getTasksByStatus = (status) => {
        if (!tasks?.data) {
            console.log(`⚠️ KanbanBoard: No tasks.data for status ${status}`);
            return [];
        }
        
        let filtered;
        if (status === 'Invalid Status') {
            // Get tasks with invalid, missing, or incorrect status values
            filtered = tasks.data.filter(task => 
                (!task.parent || task.parent === 0) && 
                (!task.status || !validStatuses.includes(task.status))
            );
        } else {
            filtered = tasks.data.filter(task => 
                task.status === status && 
                (!task.parent || task.parent === 0)
            );
        }
        console.log(`📊 KanbanBoard: Status "${status}" has ${filtered.length} tasks:`, filtered.map(t => ({ id: t.id, text: t.text })));
        return filtered;
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        setActiveId(null);

        if (!over) return;

        const taskId = parseInt(active.id);
        const task = tasks.data.find(t => t.id === taskId);
        
        console.log('🎯 Drag Details:', {
            taskId,
            taskCurrentStatus: task?.status,
            overId: over.id,
            overType: typeof over.id
        });
        
        // Determine the new status
        // If over.id is a valid status, use it; otherwise find the status of the task being dropped on
        const validStatuses = ['To Do', 'In Progress', 'Done'];
        let newStatus;
        
        if (validStatuses.includes(over.id)) {
            // Dropped in empty column space
            newStatus = over.id;
            console.log('✅ Dropped in column:', newStatus);
        } else {
            // Dropped on another task - find that task's status
            const targetTask = tasks.data.find(t => t.id.toString() === over.id);
            if (targetTask) {
                newStatus = targetTask.status;
                console.log('✅ Dropped on task:', { targetTaskId: targetTask.id, targetTaskStatus: newStatus });
            } else {
                console.log('⚠️ Could not determine target status');
                return;
            }
        }

        // Prevent dropping tasks into "Invalid Status" column
        if (newStatus === 'Invalid Status' || !validStatuses.includes(newStatus)) {
            console.log('⚠️ Cannot drop tasks into Invalid Status column');
            return;
        }

        console.log('📋 Status Change:', {
            from: task.status,
            to: newStatus,
            direction: getStatusDirection(task.status, newStatus)
        });

        if (task && task.status !== newStatus) {
            try {
                console.log('🔄 Updating task status:', { taskId, oldStatus: task.status, newStatus });
                const token = localStorage.getItem('token');
                console.log('🔑 Token exists:', !!token);
                
                await patchTask(taskId, { status: newStatus });
                console.log('✅ Task status updated successfully');
                onRefresh();
            } catch (error) {
                console.error('❌ Error updating task status:', error);
                console.error('Response:', error.response?.data);
                console.error('Status:', error.response?.status);
            }
        }
    };
    
    const getStatusDirection = (fromStatus, toStatus) => {
        const statusOrder = { 'To Do': 0, 'In Progress': 1, 'Done': 2 };
        const fromIndex = statusOrder[fromStatus] || -1;
        const toIndex = statusOrder[toStatus] || -1;
        
        if (fromIndex === -1 || toIndex === -1) return 'unknown';
        if (fromIndex < toIndex) return 'forward ➡️';
        if (fromIndex > toIndex) return 'backward ⬅️';
        return 'same';
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const handleMenuOpen = (event, task) => {
        setMenuAnchor(event.currentTarget);
        setSelectedTask(task);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedTask(null);
    };

    const handleEdit = () => {
        onEditTask(selectedTask);
        handleMenuClose();
    };

    const handleDelete = () => {
        onDeleteTask(selectedTask);
        handleMenuClose();
    };

    const getSubtaskCount = (taskId) => {
        if (!tasks?.data) return 0;
        return tasks.data.filter(t => t.parent === taskId).length;
    };

    const getCompletedSubtasks = (taskId) => {
        if (!tasks?.data) return 0;
        return tasks.data.filter(t => t.parent === taskId && t.progress === 100).length;
    };

    return (
        <Box sx={{ 
            height: '100%', 
            bgcolor: '#f8fafc', 
            p: 3,
            userSelect: activeId ? 'none' : 'auto', // Disable text selection globally during drag
            WebkitUserSelect: activeId ? 'none' : 'auto',
            MozUserSelect: activeId ? 'none' : 'auto',
            msUserSelect: activeId ? 'none' : 'auto',
        }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 160px)', overflow: 'auto' }}>
                    {Object.entries(columns).map(([columnName, columnData]) => {
                        const columnTasks = getTasksByStatus(columnData.status);
                        const isInvalidColumn = columnName === 'Invalid Status';
                        
                        return (
                            <Box key={columnName} sx={{ flex: 1, minWidth: '320px' }}>
                                <Paper sx={{ 
                                    bgcolor: isInvalidColumn ? '#fef2f2' : '#f1f5f9', 
                                    p: 2, 
                                    mb: 2, 
                                    borderTop: `4px solid ${columnData.color}`,
                                    boxShadow: 'none',
                                    border: isInvalidColumn ? '1px dashed #dc2626' : 'none'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {isInvalidColumn && <Warning sx={{ color: '#dc2626', fontSize: '1.2rem' }} />}
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: isInvalidColumn ? '#dc2626' : '#334155' }}>
                                                {columnName}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={columnTasks.length} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: columnData.color, 
                                                color: 'white',
                                                fontWeight: 600
                                            }} 
                                        />
                                    </Box>
                                    {isInvalidColumn && columnTasks.length > 0 && (
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                display: 'block', 
                                                mt: 1, 
                                                color: '#7f1d1d',
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            ⚠️ These tasks have invalid status values. <strong>Drag them to a valid column (To Do, In Progress, or Done)</strong> or click to edit.
                                        </Typography>
                                    )}
                                </Paper>

                                <SortableContext
                                    id={columnData.status}
                                    items={columnTasks.map(t => t.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <DroppableColumn id={columnData.status}>
                                        {columnTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onTaskClick={onTaskClick}
                                                onMenuOpen={handleMenuOpen}
                                                getSubtaskCount={getSubtaskCount}
                                                getCompletedSubtasks={getCompletedSubtasks}
                                            />
                                        ))}
                                    </DroppableColumn>
                                </SortableContext>
                            </Box>
                        );
                    })}
                </Box>
                
                <DragOverlay 
                    dropAnimation={{
                        duration: 200,
                        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                >
                    {activeId ? (
                        <Card sx={{ 
                            opacity: 0.9,
                            transform: 'rotate(3deg) scale(1.05)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                            cursor: 'grabbing',
                            bgcolor: 'white'
                        }}>
                            <CardContent>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {tasks.data.find(t => t.id.toString() === activeId)?.text}
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>
                    <Edit sx={{ mr: 1, fontSize: '1.2rem' }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: '#dc2626' }}>
                    <Delete sx={{ mr: 1, fontSize: '1.2rem' }} />
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default KanbanBoard;
