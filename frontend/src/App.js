import './App.css';
import Login from './components/Login';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Management</h1>
      </header>
      <main>
        <Login />
        <TaskList />
        <TaskForm />
      </main>
    </div>
  );
}

export default App;
