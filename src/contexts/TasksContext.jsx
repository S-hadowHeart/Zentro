import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error("Error parsing tasks from localStorage:", error);
      return [];
    }
  });

  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const fetchTasksRef = useRef(null);
  const hasFetchedInitialTasksRef = useRef(false); // Ref to ensure fetch is only triggered once per session

  // Overall loading state: true if auth is loading OR (API is loading AND no tasks are yet displayed)
  const loading = authLoading || (isLoadingApi && tasks.length === 0);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }, [tasks]);

  const fetchTasks = useCallback(async (currentUserId) => {
    if (!currentUserId) {
      setTasks([]);
      setIsLoadingApi(false); // No user, so not loading from API
      return;
    }

    setIsLoadingApi(true); // Start API loading

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
        setTasks(data); // This will also save to localStorage via the useEffect above
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoadingApi(false); // API fetch completed
    }
  }, []);

  // Store the latest fetchTasks function in a ref
  useEffect(() => {
    fetchTasksRef.current = fetchTasks;
  }, [fetchTasks]);

  const updateTasks = useCallback((updatedTaskData) => {
    setTasks(updatedTaskData);
  }, []);

  useEffect(() => {
    if (!authLoading) { // Once auth loading is complete
      if (user) {
        // Trigger initial fetch of tasks only if not already fetched for this session
        if (!hasFetchedInitialTasksRef.current) {
          // Call fetchTasks and ensure hasFetchedInitialTasksRef is set after it completes
          fetchTasksRef.current?.(user._id).finally(() => {
            hasFetchedInitialTasksRef.current = true;
          });
        }
      } else {
        // If no user (e.g., logged out or failed auth), clear tasks and reset fetch flag
        setTasks([]);
        setIsLoadingApi(false);
        hasFetchedInitialTasksRef.current = false; // Reset for next login
      }
    }
  }, [authLoading, user]); // Re-run when auth status or user changes

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

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
} 