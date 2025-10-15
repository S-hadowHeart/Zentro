import React, { useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { FaPlus, FaTrash, FaCheck, FaSpinner, FaLeaf } from 'react-icons/fa';

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
    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-2xl rounded-[48px] shadow-2xl p-6 sm:p-10 border border-white/50 dark:border-black/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-light text-zen-charcoal dark:text-zen-sand tracking-wider">Task Garden</h2>
        <div className="flex space-x-2 bg-white/50 dark:bg-black/20 p-1.5 rounded-full shadow-inner">
          {[
            { type: 'all', label: 'All' },
            { type: 'active', label: 'Growing' },
            { type: 'completed', label: 'Harvested' }
          ].map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${filter === type ? 'bg-white dark:bg-black/40 shadow-md text-zen-charcoal dark:text-zen-sand' : 'text-zen-charcoal/60 dark:text-zen-sand/60 hover:bg-white/70 dark:hover:bg-black/30'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Plant a new seed of intention..."
          className="flex-1 px-5 py-3 rounded-full border border-white/60 dark:border-black/30 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-zen-green dark:focus:ring-zen-green-dark shadow-inner transition-all duration-300 ease-in-out text-zen-charcoal dark:text-zen-sand placeholder-zen-charcoal/50 dark:placeholder-zen-sand/50"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-br from-zen-green to-zen-green-dark text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2">
          <FaPlus />
          <span className="hidden sm:inline">Plant</span>
        </button>
      </form>

      <div className="space-y-4 min-h-[250px]">
        {loading ? (
          <div className="flex items-center justify-center h-full pt-12">
            <FaSpinner className="w-10 h-10 animate-spin text-zen-green dark:text-zen-green-dark" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/30 dark:bg-black/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaLeaf className="w-10 h-10 text-zen-charcoal/30 dark:text-zen-sand/30" />
            </div>
            <p className="text-zen-charcoal/70 dark:text-zen-sand/70 text-lg font-light tracking-wider">
              {filter === 'all' ? 'Your garden is ready for new seeds.' : filter === 'active' ? 'No seeds are currently growing.' : 'No crops have been harvested yet.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="group flex items-center justify-between p-4 bg-white/40 dark:bg-black/20 rounded-2xl shadow-md hover:shadow-lg border border-transparent hover:border-zen-green/50 dark:hover:border-zen-green-dark/50 transition-all duration-300 transform hover:scale-[1.03]"
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleTask(task._id)}
                  className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-zen-green border-zen-green text-white' : 'border-zen-charcoal/40 dark:border-zen-sand/40 hover:border-zen-green'}`}>
                  {task.completed && <FaCheck className="w-4 h-4" />}
                </button>
                <span className={`font-medium tracking-wide ${task.completed ? 'line-through text-zen-charcoal/50 dark:text-zen-sand/50' : 'text-zen-charcoal dark:text-zen-sand'}`}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="p-2.5 text-zen-charcoal/40 dark:text-zen-sand/40 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 rounded-full hover:bg-red-500/10 dark:hover:bg-red-400/10 transition-all duration-300">
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;
