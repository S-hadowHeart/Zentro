import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const TasksContext = createContext(null);

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const loading = authLoading || (isLoadingApi && tasks.length === 0);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }

    setIsLoadingApi(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTasks([]);
        setIsLoadingApi(false);
        return;
      }

      const response = await fetch('/api/tasks', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTasks();
    }
  }, [authLoading, user, fetchTasks]);

  const updateTasks = useCallback((updatedTaskData) => {
    setTasks(updatedTaskData);
  }, []);

  const addTask = useCallback(async (title) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prevTasks => [...prevTasks, newTask]);
        return newTask;
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, []);

  const incrementPomodorosForTask = useCallback(async (taskId, duration) => {
    if (!taskId) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}/pomodoro`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ duration })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, []);

  const toggleTask = useCallback(async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? { ...task, completed: !task.completed } : task
          )
        );
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  const value = useMemo(() => ({
    tasks,
    loading,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTasks,
    incrementPomodorosForTask
  }), [tasks, loading, fetchTasks, addTask, toggleTask, deleteTask, updateTasks, incrementPomodorosForTask]);

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}
