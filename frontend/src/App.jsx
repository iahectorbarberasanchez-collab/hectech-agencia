import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks';
import LoginForm from './components/LoginForm';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('tm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTasks(status || undefined, search);
      setTasks(data);
      setError('');
    } catch (err) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('token')) {
        handleLogout();
      } else {
        setError('Error cargando tareas');
      }
    }
  }, [user, status, search]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleLogin = (u) => {
    localStorage.setItem('tm_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    setUser(null);
    setTasks([]);
  };

  const handleAdd = async (title) => {
    await createTask(title);
    loadTasks();
  };

  const handleToggle = async (id, completed) => {
    await updateTask(id, { completed });
    loadTasks();
  };

  const handleEdit = async (id, title) => {
    await updateTask(id, { title });
    loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">TaskMaster</h1>
            <p className="text-sm text-gray-500">Hola, <strong>{user.username}</strong></p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{tasks.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{pending}</p>
            <p className="text-xs text-gray-500">Pendientes</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{completed}</p>
            <p className="text-xs text-gray-500">Completadas</p>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <TaskForm onAdd={handleAdd} />
          <FilterBar
            status={status}
            search={search}
            onStatusChange={setStatus}
            onSearchChange={setSearch}
          />

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}

          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Doble clic en una tarea para editarla
        </p>
      </div>
    </div>
  );
}
