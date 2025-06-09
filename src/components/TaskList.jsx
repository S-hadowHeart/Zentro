import { useState } from 'react';
import { useTasks } from '../contexts/TasksContext';

function TaskList() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await addTask(newTask);
      setNewTask('');
    } catch (error) {
      setError('Failed to add task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zen-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-zen-green mb-6">Cultivations</h2>
        
        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Plant a new seed..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zen-green focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-zen-green text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Plant
            </button>
          </div>
        </form>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md ${
              filter === 'all'
                ? 'bg-zen-green text-white'
                : 'bg-zen-gray text-zen-green hover:bg-opacity-90'
            }`}
          >
            All Cultivations
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-md ${
              filter === 'active'
                ? 'bg-zen-green text-white'
                : 'bg-zen-gray text-zen-green hover:bg-opacity-90'
            }`}
          >
            Flourishing
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md ${
              filter === 'completed'
                ? 'bg-zen-green text-white'
                : 'bg-zen-gray text-zen-green hover:bg-opacity-90'
            }`}
          >
            Harvested
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className="flex items-center justify-between p-3 bg-zen-gray rounded-md"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task._id)}
                  className="w-5 h-5 text-zen-green rounded focus:ring-zen-green"
                />
                <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task._id)}
                className="text-red-500 hover:text-red-700"
              >
                Prune
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filter === 'all'
              ? 'No cultivations yet. Plant a new seed above!'
              : filter === 'active'
              ? 'No flourishing cultivations'
              : 'No harvested cultivations'}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList; 