import React, { useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { FaPlus, FaTrash, FaCheck, FaSeedling, FaSun, FaMoon, FaSpinner, FaLeaf } from 'react-icons/fa';

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
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30 dark:border-gray-700/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">My Cultivations</h2>
        <div className="flex space-x-2 bg-gray-200/80 dark:bg-gray-900/60 p-1.5 rounded-xl">
          {[
            { type: 'all', icon: FaLeaf, label: 'All' },
            { type: 'active', icon: FaSun, label: 'Flourishing' },
            { type: 'completed', icon: FaMoon, label: 'Harvested' }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${filter === type ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-light shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
              <Icon className={`w-4 h-4 ${filter === type ? 'text-primary dark:text-primary-light' : 'text-gray-500'}`} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Plant a new seed of intention..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark shadow-sm transition-all duration-300 ease-in-out dark:text-white dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2">
          <FaPlus />
          <span className="hidden sm:inline">Plant</span>
        </button>
      </form>

      <div className="space-y-3 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-full pt-10">
            <FaSpinner className="w-8 h-8 animate-spin text-primary dark:text-primary-light" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLeaf className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {filter === 'all' ? 'Your garden is ready for new seeds.' : filter === 'active' ? 'No seeds are currently growing.' : 'No crops have been harvested yet.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="group flex items-center justify-between p-3.5 bg-white/70 dark:bg-gray-700/60 rounded-xl shadow-sm hover:shadow-md border border-transparent hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleTask(task._id)}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-primary border-primary text-white' : 'border-gray-400 dark:border-gray-500 hover:border-primary'}`}>
                  {task.completed && <FaCheck className="w-3.5 h-3.5" />}
                </button>
                <span className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-danger dark:hover:text-danger-light opacity-0 group-hover:opacity-100 rounded-full hover:bg-danger/10 dark:hover:bg-danger-dark/20 transition-all duration-300">
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;
