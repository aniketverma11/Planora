import React, { useState } from 'react';
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
    LinearProgress
} from '@mui/material';
import {
    MoreVert,
    Edit,
    Delete,
    CalendarToday,
    Timeline
} from '@mui/icons-material';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

const TaskCard = ({ task, onMenuOpen, onTaskClick, getSubtaskCount, getCompletedSubtasks }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const subtaskCount = getSubtaskCount(task.id);
    const completedSubtasks = getCompletedSubtasks(task.id);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            sx={{
                mb: 2,
                bgcolor: 'white',
                boxShadow: isDragging 
                    ? '0 8px 16px rgba(0,0,0,0.2)' 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'box-shadow 0.2s',
                border: '1px solid #e2e8f0'
            }}
            onClick={() => onTaskClick(task)}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box 
                    {...listeners}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}
                >
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
                            fontSize: '0.875rem'
                        }}
                    >
                        {task.description}
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

                {task.assignee && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                            sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: '#3b82f6',
                                fontSize: '0.75rem'
                            }}
                        >
                            {task.assignee.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {task.assignee}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const KanbanBoard = ({ tasks, onRefresh, onTaskClick, onEditTask, onDeleteTask }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columns = {
        'To Do': { status: 'To Do', color: '#64748b' },
        'In Progress': { status: 'In Progress', color: '#f59e0b' },
        'Done': { status: 'Done', color: '#10b981' }
    };

    const getTasksByStatus = (status) => {
        if (!tasks?.data) return [];
        return tasks.data.filter(task => task.status === status && (!task.parent || task.parent === 0));
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = parseInt(active.id);
        const newStatus = over.id;
        const task = tasks.data.find(t => t.id === taskId);

        if (task && task.status !== newStatus) {
            try {
                const token = localStorage.getItem('access_token');
                await axios.patch(
                    `http://localhost:8001/api/tasks/${taskId}/`,
                    { status: newStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                onRefresh();
            } catch (error) {
                console.error('Error updating task status:', error);
            }
        }
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
        <Box sx={{ height: '100%', bgcolor: '#f8fafc', p: 3 }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 160px)', overflow: 'auto' }}>
                    {Object.entries(columns).map(([columnName, columnData]) => {
                        const columnTasks = getTasksByStatus(columnData.status);
                        
                        return (
                            <Box key={columnName} sx={{ flex: 1, minWidth: '320px' }}>
                                <Paper sx={{ 
                                    bgcolor: '#f1f5f9', 
                                    p: 2, 
                                    mb: 2, 
                                    borderTop: `4px solid ${columnData.color}`,
                                    boxShadow: 'none'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                                            {columnName}
                                        </Typography>
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
                                </Paper>

                                <SortableContext
                                    id={columnData.status}
                                    items={columnTasks.map(t => t.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Box
                                        id={columnData.status}
                                        sx={{
                                            minHeight: '500px',
                                            borderRadius: 2,
                                            p: 1,
                                        }}
                                    >
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
                                    </Box>
                                </SortableContext>
                            </Box>
                        );
                    })}
                </Box>
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
