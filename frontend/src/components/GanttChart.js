import React, { useState, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    IconButton,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Grid,
    Menu,
    MenuItem,
    Divider,
    LinearProgress
} from '@mui/material';
import { 
    ExpandMore, 
    ExpandLess, 
    Visibility,
    CalendarToday,
    Timeline,
    CheckCircle,
    RadioButtonUnchecked,
    AccessTime,
    Edit,
    Delete,
    Add,
    MoreVert
} from '@mui/icons-material';
import TaskForm from './TaskForm';
import { deleteTask } from '../services/api';

const GanttChart = ({ tasks, onRefresh = () => {} }) => {
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [selectedTask, setSelectedTask] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [menuTask, setMenuTask] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskFormOpen, setTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [parentTaskForNewTask, setParentTaskForNewTask] = useState(null);

    // Auto-expand all parent tasks when tasks data changes
    React.useEffect(() => {
        if (tasks?.data?.length) {
            const parentTaskIds = new Set();
            tasks.data.forEach(task => {
                // If this task has subtasks, add it to expanded set
                const hasSubtasks = tasks.data.some(t => t.parent === task.id);
                if (hasSubtasks) {
                    parentTaskIds.add(task.id);
                }
            });
            setExpandedTasks(parentTaskIds);
        }
    }, [tasks]);

    // Calculate timeline bounds
    const { startDate, endDate, totalDays } = useMemo(() => {
        if (!tasks?.data?.length) return { startDate: new Date(), endDate: new Date(), totalDays: 30 };
        
        const dates = tasks.data.map(task => new Date(task.start_date));
        const endDates = tasks.data.map(task => {
            const start = new Date(task.start_date);
            return new Date(start.getTime() + (task.duration - 1) * 24 * 60 * 60 * 1000);
        });
        
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...endDates));
        const diffTime = maxDate - minDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return { 
            startDate: minDate, 
            endDate: maxDate, 
            totalDays: Math.max(diffDays, 30) 
        };
    }, [tasks]);

    // Project timeline span for display
    const timelineSpan = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    // Generate timeline header
    const generateTimelineHeader = () => {
        const months = [];
        const currentDate = new Date(startDate);
        
        // Generate months
        let currentMonth = currentDate.getMonth();
        let monthStart = 0;
        let dayCount = 0;
        
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            if (date.getMonth() !== currentMonth || i === 0) {
                if (i > 0) {
                    months.push({
                        name: new Date(currentDate.getFullYear(), currentMonth, 1).toLocaleDateString('en-US', { month: 'long' }),
                        width: dayCount,
                        start: monthStart
                    });
                }
                currentMonth = date.getMonth();
                currentDate.setFullYear(date.getFullYear());
                currentDate.setMonth(date.getMonth());
                monthStart = i;
                dayCount = 1;
            } else {
                dayCount++;
            }
        }
        
        // Add the last month
        months.push({
            name: new Date(currentDate.getFullYear(), currentMonth, 1).toLocaleDateString('en-US', { month: 'long' }),
            width: dayCount,
            start: monthStart
        });

        return { months };
    };

    const { months } = generateTimelineHeader();

    const calculateTaskPosition = (task) => {
        const taskStartDate = new Date(task.start_date);
        const daysFromStart = Math.floor((taskStartDate - startDate) / (1000 * 60 * 60 * 24));
        const left = (daysFromStart / totalDays) * 100;
        const width = (task.duration / totalDays) * 100;
        
        return { left: `${Math.max(0, left)}%`, width: `${Math.min(width, 100 - left)}%` };
    };

    const getTaskColor = (task) => {
        const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06D6A0', '#118AB2', '#073B4C'];
        const mainTasks = tasks.data.filter(t => !t.parent || t.parent === 0);
        const taskIndex = mainTasks.findIndex(t => t.id === (task.parent || task.id));
        return colors[taskIndex % colors.length];
    };

    const toggleExpanded = (taskId) => {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setDialogOpen(true);
    };

    const getSubtasksForTask = (taskId) => {
        return tasks.data.filter(task => task.parent === taskId);
    };

    const mainTasks = tasks.data.filter(task => !task.parent || task.parent === 0);

    const getStatusIcon = (progress) => {
        if (progress === 100) return <CheckCircle sx={{ color: '#4caf50' }} />;
        if (progress > 0) return <AccessTime sx={{ color: '#ff9800' }} />;
        return <RadioButtonUnchecked sx={{ color: '#9e9e9e' }} />;
    };

    // Action menu handlers
    const handleActionClick = (event, task) => {
        event.stopPropagation();
        setActionMenuAnchor(event.currentTarget);
        setMenuTask(task);
    };

    const handleActionClose = () => {
        setActionMenuAnchor(null);
        setMenuTask(null);
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setParentTaskForNewTask(null);
        setTaskFormOpen(true);
        handleActionClose();
    };

    const handleAddSubtask = () => {
        setEditingTask(null);
        setParentTaskForNewTask(menuTask?.id || null);
        setTaskFormOpen(true);
        handleActionClose();
    };

    const handleEditTask = () => {
        setEditingTask(menuTask);
        setTaskFormOpen(true);
        handleActionClose();
    };

    const handleDeleteTask = () => {
        setDeleteDialogOpen(true);
        handleActionClose();
    };

    const confirmDeleteTask = async () => {
        try {
            if (menuTask) {
                await deleteTask(menuTask.id);
                setDeleteDialogOpen(false);
                setMenuTask(null);
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleTaskFormClose = () => {
        setTaskFormOpen(false);
        setEditingTask(null);
        setParentTaskForNewTask(null);
        setMenuTask(null);
        onRefresh(); // Refresh the task data after form close
    };

    if (!tasks || !tasks.data || tasks.data.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No tasks available for Gantt chart
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            bgcolor: '#f5f5f5', 
            color: '#333', 
            p: 2,
            overflow: 'auto'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold' }}>
                        PROJECT MANAGEMENT
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddTask}
                        sx={{
                            bgcolor: '#1976d2',
                            '&:hover': { bgcolor: '#1565c0' }
                        }}
                    >
                        Add Task
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                        label={`${tasks.data.length} Tasks`} 
                        sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        {timelineSpan}
                    </Typography>
                </Box>
            </Box>
            
            <Paper sx={{ 
                bgcolor: 'white', 
                color: '#333', 
                overflow: 'auto',
                width: '100%',
                minWidth: '1200px',
                minHeight: 'calc(100vh - 160px)',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
            }}>
                {/* Timeline Header */}
                <Box sx={{ display: 'flex', borderBottom: '1px solid #334155' }}>
                    {/* Task Names Column */}
                    <Box sx={{ 
                        width: '350px', 
                        minWidth: '350px', 
                        maxWidth: '350px',
                        bgcolor: '#f8f9fa', 
                        p: 1, 
                        borderRight: '1px solid #e0e0e0',
                        flexShrink: 0
                    }}>
                        <Typography variant="subtitle2" sx={{ color: '#333', fontWeight: 'bold' }}>
                            TASKS & STATUS
                        </Typography>
                    </Box>
                    
                    {/* Timeline Header */}
                    <Box sx={{ flex: 1, minWidth: '800px', overflow: 'hidden' }}>
                        {/* Months */}
                        <Box sx={{ display: 'flex', borderBottom: '1px solid #334155' }}>
                            {months.map((month, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        width: `${(month.width / totalDays) * 100}%`,
                                        textAlign: 'center',
                                        p: 1,
                                        borderRight: index < months.length - 1 ? '1px solid #e0e0e0' : 'none',
                                        bgcolor: '#f8f9fa'
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: '#333', fontWeight: 'bold' }}>
                                        {month.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        
                        {/* Days Header */}
                        <Box sx={{ display: 'flex', borderBottom: '1px solid #334155', height: '30px' }}>
                            {Array.from({ length: Math.min(totalDays, 31) }, (_, index) => {
                                const currentDate = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
                                return (
                                    <Box 
                                        key={index}
                                        sx={{ 
                                            width: `${(1 / totalDays) * 100}%`,
                                            textAlign: 'center',
                                            py: 0.5,
                                            borderRight: index < totalDays - 1 ? '1px solid #e0e0e0' : 'none',
                                            bgcolor: '#fafafa',
                                            minWidth: '20px'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>
                                            {currentDate.getDate()}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>

                {/* Task Rows */}
                <Box sx={{ 
                    maxHeight: 'calc(100vh - 200px)', 
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px'
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: '#f5f5f5'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: '#bdbdbd',
                        borderRadius: '4px'
                    }
                }}>
                    {mainTasks.map((task, taskIndex) => {
                        const subtasks = getSubtasksForTask(task.id);
                        const isExpanded = expandedTasks.has(task.id);
                        const taskColor = getTaskColor(task);
                        
                        return (
                            <Box key={task.id}>
                                {/* Main Task Row */}
                                <Box sx={{ display: 'flex', borderBottom: '1px solid #334155', minHeight: '60px' }}>
                                    {/* Task Name */}
                                    <Box sx={{ 
                                        width: '350px', 
                                        minWidth: '350px', 
                                        maxWidth: '350px',
                                        p: 2, 
                                        borderRight: '1px solid #e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        bgcolor: taskIndex % 2 === 0 ? '#fafafa' : '#ffffff',
                                        flexShrink: 0
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            {subtasks.length > 0 && (
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => toggleExpanded(task.id)}
                                                    sx={{ 
                                                        color: '#666',
                                                        bgcolor: 'rgba(0,0,0,0.05)',
                                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                                                    }}
                                                >
                                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            )}
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                        {task.text}
                                                    </Typography>
                                                    {subtasks.length > 0 && (
                                                        <Chip 
                                                            label={`${subtasks.filter(s => s.progress === 100).length}/${subtasks.length} done`}
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: subtasks.filter(s => s.progress === 100).length === subtasks.length 
                                                                    ? 'rgba(76, 175, 80, 0.1)' 
                                                                    : 'rgba(25, 118, 210, 0.1)', 
                                                                color: subtasks.filter(s => s.progress === 100).length === subtasks.length 
                                                                    ? '#4caf50' 
                                                                    : '#1976d2',
                                                                height: '18px',
                                                                fontSize: '0.6rem'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={task.progress}
                                                        sx={{ 
                                                            flex: 1, 
                                                            height: 6, 
                                                            borderRadius: 3,
                                                            bgcolor: 'rgba(255,255,255,0.1)',
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: task.progress === 100 ? '#4caf50' : task.progress > 0 ? '#ff9800' : '#9e9e9e'
                                                            }
                                                        }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: '#666', minWidth: '35px' }}>
                                                        {task.progress}%
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {task.assignee && (
                                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                                            {task.assignee}
                                                        </Typography>
                                                    )}
                                                    <Chip 
                                                        label={`${task.duration}d`}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: 'rgba(59, 130, 246, 0.2)', 
                                                            color: '#60a5fa',
                                                            height: '20px',
                                                            fontSize: '0.65rem'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => openTaskDetails(task)}
                                                    sx={{ color: '#1976d2' }}
                                                    title="View Details"
                                                >
                                                    <Visibility />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => handleActionClick(e, task)}
                                                    sx={{ color: '#666' }}
                                                    title="More Actions"
                                                >
                                                    <MoreVert />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    {/* Timeline Bar */}
                                    <Box sx={{ 
                                        flex: 1, 
                                        position: 'relative', 
                                        minHeight: '60px',
                                        minWidth: '800px',
                                        bgcolor: taskIndex % 2 === 0 ? '#fafafa' : '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {/* Grid Lines */}
                                        {Array.from({ length: Math.min(totalDays, 31) }, (_, index) => (
                                            <Box 
                                                key={index}
                                                sx={{
                                                    position: 'absolute',
                                                    left: `${(index / totalDays) * 100}%`,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '1px',
                                                    bgcolor: index % 7 === 0 ? '#bdbdbd' : '#e0e0e0',
                                                    opacity: index % 7 === 0 ? 1 : 0.7
                                                }}
                                            />
                                        ))}
                                        
                                        {/* Task Bar */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                ...calculateTaskPosition(task),
                                                height: '24px',
                                                bgcolor: taskColor,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                overflow: 'hidden',
                                                minWidth: '60px',
                                                '&:hover': {
                                                    opacity: 0.9,
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                                }
                                            }}
                                            onClick={() => openTaskDetails(task)}
                                        >
                                            {/* Progress Bar */}
                                            <Box
                                                sx={{
                                                    width: `${task.progress}%`,
                                                    height: '100%',
                                                    bgcolor: 'rgba(255,255,255,0.3)',
                                                    borderRadius: '12px 0 0 12px',
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                            {/* Task Progress Text */}
                                            <Box sx={{ 
                                                position: 'absolute',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5
                                            }}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {task.progress}%
                                                </Typography>
                                                {subtasks.length > 0 && (
                                                    <Chip 
                                                        label={subtasks.length}
                                                        size="small"
                                                        sx={{ 
                                                            height: '16px',
                                                            fontSize: '0.6rem',
                                                            bgcolor: 'rgba(255,255,255,0.9)',
                                                            color: taskColor,
                                                            '& .MuiChip-label': { px: 0.5 }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Connection Line for Subtasks */}
                                {subtasks.length > 0 && isExpanded && (
                                    <Box sx={{
                                        display: 'flex',
                                        borderBottom: '1px solid #e0e0e0',
                                        minHeight: '20px'
                                    }}>
                                        {/* Connection area */}
                                        <Box sx={{ 
                                            width: '350px', 
                                            minWidth: '350px', 
                                            maxWidth: '350px',
                                            borderRight: '1px solid #e0e0e0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#f0f4f8',
                                            flexShrink: 0
                                        }}>
                                            <Box sx={{
                                                width: '2px',
                                                height: '20px',
                                                bgcolor: '#1976d2',
                                                position: 'relative',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: '-1px',
                                                    left: '-4px',
                                                    width: '10px',
                                                    height: '2px',
                                                    bgcolor: '#1976d2'
                                                }
                                            }} />
                                        </Box>
                                        {/* Timeline area connection */}
                                        <Box sx={{ 
                                            flex: 1, 
                                            bgcolor: '#f0f4f8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#1976d2', fontSize: '0.7rem' }}>
                                                {subtasks.filter(s => s.progress === 100).length} of {subtasks.length} completed
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Subtask Rows */}
                                <Collapse in={isExpanded}>
                                    {subtasks.map((subtask, subtaskIndex) => (
                                        <Box key={subtask.id} sx={{ display: 'flex', borderBottom: '1px solid #334155', minHeight: '50px' }}>
                                            {/* Subtask Name */}
                                            <Box sx={{ 
                                                width: '350px', 
                                                minWidth: '350px', 
                                                maxWidth: '350px',
                                                p: 2, 
                                                borderRight: '1px solid #e0e0e0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: '#f8f9fa',
                                                pl: 3,
                                                borderLeft: '3px solid #1976d2',
                                                flexShrink: 0
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                    {/* Connection line visual */}
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mr: 1,
                                                        color: '#1976d2'
                                                    }}>
                                                        <Box sx={{ 
                                                            width: '20px', 
                                                            height: '1px', 
                                                            bgcolor: '#1976d2', 
                                                            position: 'relative',
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                left: '-3px',
                                                                top: '-3px',
                                                                width: '7px',
                                                                height: '7px',
                                                                borderRadius: '50%',
                                                                bgcolor: '#1976d2'
                                                            }
                                                        }} />
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                                                                {subtask.text}
                                                            </Typography>
                                                            <Chip 
                                                                label={subtask.status}
                                                                size="small"
                                                                sx={{ 
                                                                    height: '16px',
                                                                    fontSize: '0.55rem',
                                                                    bgcolor: subtask.progress === 100 ? '#e8f5e8' : subtask.progress > 0 ? '#fff3e0' : '#f5f5f5',
                                                                    color: subtask.progress === 100 ? '#2e7d32' : subtask.progress > 0 ? '#f57c00' : '#757575'
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LinearProgress 
                                                                variant="determinate" 
                                                                value={subtask.progress}
                                                                sx={{ 
                                                                    flex: 1, 
                                                                    height: 4, 
                                                                    borderRadius: 2,
                                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: subtask.progress === 100 ? '#4caf50' : subtask.progress > 0 ? '#ff9800' : '#9e9e9e'
                                                                    }
                                                                }}
                                                            />
                                                            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                                                                {subtask.progress}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => openTaskDetails(subtask)}
                                                            sx={{ color: '#60a5fa' }}
                                                            title="View Details"
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={(e) => handleActionClick(e, subtask)}
                                                            sx={{ color: '#94a3b8' }}
                                                            title="More Actions"
                                                        >
                                                            <MoreVert />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            
                                            {/* Subtask Timeline Bar */}
                                            <Box sx={{ 
                                                flex: 1, 
                                                position: 'relative', 
                                                minHeight: '50px',
                                                minWidth: '800px',
                                                bgcolor: '#f8f9fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderTop: '1px solid rgba(25, 118, 210, 0.2)'
                                            }}>
                                                {/* Grid Lines */}
                                                {Array.from({ length: Math.min(totalDays, 31) }, (_, index) => (
                                                    <Box 
                                                        key={index}
                                                        sx={{
                                                            position: 'absolute',
                                                            left: `${(index / totalDays) * 100}%`,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '1px',
                                                            bgcolor: index % 7 === 0 ? '#475569' : '#334155',
                                                            opacity: index % 7 === 0 ? 1 : 0.5
                                                        }}
                                                    />
                                                ))}
                                                
                                                {/* Subtask Bar */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        ...calculateTaskPosition(subtask),
                                                        height: '20px',
                                                        bgcolor: taskColor,
                                                        opacity: 0.7,
                                                        borderRadius: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            opacity: 0.5
                                                        }
                                                    }}
                                                    onClick={() => openTaskDetails(subtask)}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: `${subtask.progress}%`,
                                                            height: '100%',
                                                            bgcolor: 'rgba(0,0,0,0.3)',
                                                            borderRadius: '10px'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Collapse>
                            </Box>
                        );
                    })}
                </Box>
            </Paper>

            {/* Task Details Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedTask && (
                    <>
                        <DialogTitle sx={{ bgcolor: '#1a365d', color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {getStatusIcon(selectedTask.progress)}
                                <Typography variant="h6">{selectedTask.text}</Typography>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CalendarToday />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Start Date" 
                                                secondary={new Date(selectedTask.start_date).toLocaleDateString()} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Timeline />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Duration" 
                                                secondary={`${selectedTask.duration} day${selectedTask.duration !== 1 ? 's' : ''}`} 
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Progress" 
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 100, height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                                                            <Box 
                                                                sx={{ 
                                                                    width: `${selectedTask.progress}%`, 
                                                                    height: '100%', 
                                                                    bgcolor: '#4caf50', 
                                                                    borderRadius: 4 
                                                                }} 
                                                            />
                                                        </Box>
                                                        <Typography variant="body2">
                                                            {selectedTask.progress}%
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                
                                {/* Subtasks Section */}
                                {!selectedTask.parent && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                            Subtasks
                                        </Typography>
                                        <List>
                                            {getSubtasksForTask(selectedTask.id).map((subtask) => (
                                                <ListItem key={subtask.id} sx={{ pl: 0 }}>
                                                    <ListItemIcon>
                                                        {getStatusIcon(subtask.progress)}
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={subtask.text}
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="caption" display="block">
                                                                    {new Date(subtask.start_date).toLocaleDateString()} - {subtask.duration} day{subtask.duration !== 1 ? 's' : ''}
                                                                </Typography>
                                                                <Chip 
                                                                    label={`${subtask.progress}%`}
                                                                    size="small"
                                                                    color={subtask.progress === 100 ? 'success' : subtask.progress > 0 ? 'warning' : 'default'}
                                                                />
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                            {getSubtasksForTask(selectedTask.id).length === 0 && (
                                                <Typography variant="body2" color="text.secondary">
                                                    No subtasks for this task
                                                </Typography>
                                            )}
                                        </List>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleActionClose}
                PaperProps={{
                    sx: {
                        bgcolor: 'white',
                        color: '#333',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <MenuItem onClick={handleEditTask} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <Edit sx={{ mr: 1, fontSize: '1rem' }} />
                    Edit Task
                </MenuItem>
                <MenuItem onClick={handleAddSubtask} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                    <Add sx={{ mr: 1, fontSize: '1rem' }} />
                    Add Subtask
                </MenuItem>
                <Divider sx={{ bgcolor: '#e0e0e0' }} />
                <MenuItem onClick={handleDeleteTask} sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#ffebee' } }}>
                    <Delete sx={{ mr: 1, fontSize: '1rem' }} />
                    Delete Task
                </MenuItem>
            </Menu>

            {/* Task Form Dialog */}
            <TaskForm
                open={taskFormOpen}
                handleClose={handleTaskFormClose}
                task={editingTask}
                parentTaskId={parentTaskForNewTask}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'white',
                        color: '#333'
                    }
                }}
            >
                <DialogTitle sx={{ color: '#d32f2f' }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{menuTask?.text}"? 
                        {getSubtasksForTask(menuTask?.id || 0).length > 0 && (
                            <Box component="span" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                <br />This will also delete all {getSubtasksForTask(menuTask?.id || 0).length} subtask(s).
                            </Box>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDeleteTask}
                        variant="contained"
                        sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#c62828' } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GanttChart;
