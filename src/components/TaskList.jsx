import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { FaPlus, FaTrash, FaCheck, FaLeaf, FaSeedling, FaSun, FaMoon, FaSpinner } from 'react-icons/fa';

function TaskList() {
  const { tasks, addTask, deleteTask, toggleTask, loading } = useTasks();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary-light">
            <FaSeedling className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cultivations
          </h2>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:space-x-2">
          {[
            { type: 'all', icon: FaLeaf, label: 'All Cultivations' },
            { type: 'active', icon: FaSun, label: 'Flourishing' },
            { type: 'completed', icon: FaMoon, label: 'Harvested' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                filter === type
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'bg-white text-text-light hover:bg-primary-light shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="   Plant a new seed..."
            className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-12 rounded-lg border border-secondary focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-300 ease-in-out bg-white/50 backdrop-blur-sm"
          />
          <FaSeedling className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
        </div>
        <button
          type="submit"
          className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2 group"
        >
          <FaPlus className="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
          <span>Plant</span>
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-primary-light shadow-sm flex items-center justify-center space-x-2">
            <FaSpinner className="w-6 h-6 animate-spin text-primary" />
            <p className="text-text-light text-lg">Cultivating tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-primary-light shadow-sm">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLeaf className="w-8 h-8 text-primary" />
            </div>
            <p className="text-text-light text-lg">
              {filter === 'all'
                ? 'Your garden is empty. Plant your first seed of growth.'
                : filter === 'active'
                ? 'No cultivations are currently flourishing.'
                : 'No cultivations have been harvested yet.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md border border-primary-light transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleTask(task._id)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-in-out ${task.completed
                        ? 'bg-gradient-to-r from-primary to-secondary border-transparent text-white shadow-md'
                        : 'bg-white ring-2 ring-primary-light text-text-light hover:ring-primary shadow-sm hover:scale-105'
                    }`}
                  >
                    {task.completed && <FaCheck className="w-4 h-4" />}
                  </button>
                  <span
                    className={`text-text-color transition-all duration-300 ease-in-out ${
                      task.completed ? 'line-through text-text-light' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out rounded-lg hover:bg-danger-light"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;
