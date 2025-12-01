import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, CheckSquare } from 'lucide-react';

const TaskManager = () => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ project_id: '', name: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
        fetchTasks();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/api/projects');
            setProjects(res.data);
            if (res.data.length > 0 && !newTask.project_id) {
                setNewTask(prev => ({ ...prev, project_id: res.data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await api.get('/api/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTask.name || !newTask.project_id) return;

        try {
            await api.post('/api/tasks', newTask);
            setNewTask(prev => ({ ...prev, name: '' }));
            fetchTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const getProjectName = (id) => {
        const proj = projects.find(p => p.id === id);
        return proj ? proj.name : 'Unknown Project';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                Manage Tasks
            </h3>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-6 items-end">
                <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                        value={newTask.project_id}
                        onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        {projects.length === 0 && <option value="">No Projects Available</option>}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                    <input
                        type="text"
                        value={newTask.name}
                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="New Task Name"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                    disabled={projects.length === 0}
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : tasks.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No tasks found</td></tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getProjectName(task.project_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">#{task.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskManager;
