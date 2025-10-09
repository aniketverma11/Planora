// Test data to verify hierarchy logic
const testTasks = {
    data: [
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
        }
    ],
    links: []
};

console.log('=== Testing Hierarchy Logic ===');

// Test the filtering logic from GanttChart component
const mainTasks = testTasks.data.filter(task => !task.parent || task.parent === 0);
console.log('Main tasks:', mainTasks.map(t => `${t.text} (ID: ${t.id})`));

const getSubtasksForTask = (taskId) => {
    return testTasks.data.filter(task => task.parent === taskId);
};

mainTasks.forEach(mainTask => {
    const subtasks = getSubtasksForTask(mainTask.id);
    console.log(`\n📋 ${mainTask.text} (ID: ${mainTask.id})`);
    console.log(`   Progress: ${mainTask.progress}%`);
    console.log(`   Subtasks: ${subtasks.length}`);
    
    subtasks.forEach(subtask => {
        console.log(`   └─ ${subtask.text} (ID: ${subtask.id}) - ${subtask.progress}%`);
    });
});

console.log('\n=== Expected Result ===');
console.log('Should show:');
console.log('📋 Project Setup (expandable)');
console.log('   └─ Environment Setup (100%)');
console.log('   └─ Database Configuration (50%)');

module.exports = { testTasks };