import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { FaPlus, FaTrash, FaCheck, FaLeaf, FaSeedling, FaSun, FaMoon } from 'react-icons/fa';

function TaskList() {
  const { tasks, addTask, deleteTask, toggleTask } = useTasks();
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-zen-primary to-zen-primary/80 bg-clip-text text-transparent">
          Garden of Cultivation
        </h2>
        <div className="flex space-x-2">
          {[
            { type: 'all', icon: FaLeaf, label: 'All Seeds' },
            { type: 'active', icon: FaSun, label: 'Growing' },
            { type: 'completed', icon: FaMoon, label: 'Harvested' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                filter === type
                  ? 'bg-gradient-to-r from-zen-primary to-zen-primary/80 text-white shadow-md'
                  : 'bg-white text-zen-text hover:bg-zen-primary/10 shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Plant a new seed of cultivation..."
            className="flex-1 px-4 py-3 border border-zen-primary/20 rounded-lg focus:ring-2 focus:ring-zen-primary focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-zen-primary hover:bg-zen-primary/90 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2 group"
          >
            <FaPlus className="w-4 h-4 transform group-hover:rotate-90 transition-transform duration-300" />
            <span>Plant</span>
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-emerald-100 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-gray-600 text-lg">
                {filter === 'all'
                  ? 'Your garden awaits cultivation. Sow your first intention to begin your journey.'
                  : filter === 'active'
                  ? 'No intentions are currently blossoming.'
                  : 'No intentions have been harvested yet.'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-zen-primary/10 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task._id)}
                    className="w-5 h-5 rounded border-zen-primary/30 text-zen-primary focus:ring-zen-primary transition-all duration-300"
                  />
                  <span className={`text-zen-text ${task.completed ? 'line-through text-zen-primary/50' : ''}`}>
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-zen-primary/50 hover:text-zen-primary p-2 rounded-full hover:bg-zen-primary/10 transition-all duration-300"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskList; 