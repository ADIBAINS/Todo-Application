import React, { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, Check } from 'lucide-react';

export default function TaskApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [signinForm, setSigninForm] = useState({ email: '', password: '' });

  const API_BASE = 'https://todo-application-hztr.onrender.com';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ email: 'user' });
        setTasks(data.tasks || []);
        setPage('tasks');
      } else if (response.status === 401) {
        // 401 is expected on first load - user not logged in yet
        setPage('home');
      }
    } catch (err) {
      console.log('Connection error during auth check:', err.message);
      setPage('home');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else if (response.status === 401) {
        setPage('home');
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(signupForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Signup successful! Redirecting to tasks...');
        setCurrentUser({ email: signupForm.email });
        setSignupForm({ name: '', email: '', password: '' });
        setTimeout(() => {
          setPage('tasks');
          fetchTasks();
        }, 1500);
      } else {
        setError(data.msg || 'Signup failed');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signinForm.email || !signinForm.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(signinForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        setCurrentUser({ email: signinForm.email });
        setSigninForm({ email: '', password: '' });
        setTimeout(() => {
          setPage('tasks');
          fetchTasks();
        }, 1500);
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (err) {
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newTaskTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTaskTitle, status: false }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Task created!');
        setNewTaskTitle('');
        setTasks([...tasks, data.task]);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(data.msg || 'Failed to create task');
      }
    } catch (err) {
      console.error('Create task error:', err);
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (response.ok) {
        const updatedTasks = tasks.map(task =>
          task._id === id ? { ...task, status: !currentStatus } : task
        );
        setTasks(updatedTasks);
        setSuccess('Task updated!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to update task');
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError('Failed to update task');
    }
  };

  const handleUpdateTaskTitle = async (id) => {
    if (!editingTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editingTitle }),
      });

      if (response.ok) {
        const updatedTasks = tasks.map(task =>
          task._id === id ? { ...task, title: editingTitle } : task
        );
        setTasks(updatedTasks);
        setEditingId(null);
        setEditingTitle('');
        setSuccess('Task updated!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to update task');
      }
    } catch (err) {
      console.error('Update title error:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== id));
        setSuccess('Task deleted!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/signout`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      setCurrentUser(null);
      setTasks([]);
      setPage('home');
      setSuccess('Logged out successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Logout failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TaskMaster</h1>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {page === 'home' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to TaskMaster</h2>
            <p className="text-gray-600 mb-8 text-lg">Manage your tasks efficiently</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPage('signin')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Sign In
              </button>
              <button
                onClick={() => setPage('signup')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {page === 'signup' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Sign Up'}
              </button>
            </div>
            <p className="text-center mt-4 text-gray-600">
              Already have an account?{' '}
              <button onClick={() => setPage('signin')} className="text-indigo-600 hover:underline">
                Sign In
              </button>
            </p>
          </div>
        )}

        {page === 'signin' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={signinForm.email}
                onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={signinForm.password}
                onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSignin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            <p className="text-center mt-4 text-gray-600">
              Don't have an account?{' '}
              <button onClick={() => setPage('signup')} className="text-green-600 hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        )}

        {page === 'tasks' && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">My Tasks</h2>

            <div className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCreateTask}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
              >
                <Plus size={20} />
                Add
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No tasks yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center gap-3"
                  >
                    <button
                      onClick={() => handleUpdateTaskStatus(task._id, task.status)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        task.status
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.status && <Check size={16} className="text-white" />}
                    </button>

                    {editingId === task._id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleUpdateTaskTitle(task._id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateTaskTitle(task._id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 border border-indigo-500 rounded focus:outline-none"
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingId(task._id);
                          setEditingTitle(task.title);
                        }}
                        className={`flex-1 cursor-pointer hover:text-indigo-600 ${
                          task.status ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="flex-shrink-0 text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}