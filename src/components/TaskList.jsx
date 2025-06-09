import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { FaPlus, FaTrash, FaCheck, FaLeaf } from 'react-icons/fa';

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
          Cultivations
        </h2>
        <div className="flex space-x-2">
          {['all', 'active', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                filter === filterType
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-emerald-50 shadow-sm'
              }`}
            >
              {filterType === 'all' ? 'All Cultivations' : 
               filterType === 'active' ? 'Flourishing' : 'Harvested'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Plant a new seed..."
          className="flex-1 px-4 py-2 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-300 ease-in-out"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Plant</span>
        </button>
      </form>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 bg-white/50 rounded-lg border border-emerald-100">
            <FaLeaf className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-gray-600">
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
              className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-emerald-100 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTask(task._id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-in-out ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-emerald-300 hover:border-emerald-500'
                    }`}
                  >
                    {task.completed && <FaCheck className="w-3 h-3" />}
                  </button>
                  <span
                    className={`text-gray-700 transition-all duration-300 ease-in-out ${
                      task.completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
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