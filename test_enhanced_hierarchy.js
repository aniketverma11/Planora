// Test the enhanced Gantt Chart hierarchy logic
const testTasks = {
    data: [
        // Main task 1 with subtasks
        {
            id: 13,
            text: 'Project Setup',
            start_date: '2025-10-09',
            duration: 10,
            progress: 30,
            parent: 0,
            status: 'In Progress',
            priority: 'High'
        },
        {
            id: 14,
            text: 'Environment Setup',
            start_date: '2025-10-09',
            duration: 2,
            progress: 100,
            parent: 13,
            status: 'Done',
            priority: 'High'
        },
        {
            id: 15,
            text: 'Database Configuration',
            start_date: '2025-10-12',
            duration: 3,
            progress: 50,
            parent: 13,
            status: 'In Progress',
            priority: 'Medium'
        },
        // Main task 2 with subtasks
        {
            id: 16,
            text: 'Feature Development',
            start_date: '2025-10-24',
            duration: 15,
            progress: 0,
            parent: 0,
            status: 'To Do',
            priority: 'Medium'
        },
        {
            id: 17,
            text: 'UI Design',
            start_date: '2025-10-24',
            duration: 5,
            progress: 25,
            parent: 16,
            status: 'In Progress',
            priority: 'High'
        },
        {
            id: 18,
            text: 'Backend API',
            start_date: '2025-10-29',
            duration: 8,
            progress: 0,
            parent: 16,
            status: 'To Do',
            priority: 'High'
        },
        // Standalone task
        {
            id: 19,
            text: 'Documentation Update',
            start_date: '2025-10-04',
            duration: 4,
            progress: 100,
            parent: 0,
            status: 'Done',
            priority: 'Low'
        }
    ]
};

console.log('=== Testing Enhanced Gantt Chart Logic ===');

// Test main task filtering
const mainTasks = testTasks.data.filter(task => !task.parent || task.parent === 0);
console.log(`\nMain Tasks (${mainTasks.length}):`);

mainTasks.forEach(task => {
    // Test subtask finding
    const subtasks = testTasks.data.filter(t => t.parent === task.id);
    console.log(`\n📋 ${task.text} (${task.progress}%)`);
    console.log(`   Subtasks: ${subtasks.length}`);
    
    if (subtasks.length > 0) {
        console.log(`   ✅ Should show expand/collapse button`);
        console.log(`   ✅ Should show "${subtasks.length} subtasks" badge`);
        console.log(`   ✅ Should show connection line when expanded`);
        
        subtasks.forEach(subtask => {
            console.log(`     └─ ${subtask.text} (${subtask.progress}%)`);
            console.log(`        ✅ Should have blue border and connection dot`);
            console.log(`        ✅ Should show on timeline with reduced opacity`);
        });
    } else {
        console.log(`   ✅ Should show as standalone task`);
    }
});

// Test auto-expand logic
const parentTaskIds = new Set();
testTasks.data.forEach(task => {
    const hasSubtasks = testTasks.data.some(t => t.parent === task.id);
    if (hasSubtasks) {
        parentTaskIds.add(task.id);
    }
});

console.log(`\n=== Auto-Expand Test ===`);
console.log(`Parent tasks to auto-expand: [${Array.from(parentTaskIds).join(', ')}]`);

console.log(`\n=== Expected Visual Result ===`);
console.log('📋 Project Setup (30%) [2 subtasks] [↓]');
console.log('   ↳ Connection line');
console.log('   └─ ● Environment Setup (100%)');
console.log('   └─ ● Database Configuration (50%)');
console.log('');
console.log('📋 Feature Development (0%) [2 subtasks] [↓]');
console.log('   ↳ Connection line');
console.log('   └─ ● UI Design (25%)');
console.log('   └─ ● Backend API (0%)');
console.log('');
console.log('📋 Documentation Update (100%) [standalone]');

module.exports = { testTasks };