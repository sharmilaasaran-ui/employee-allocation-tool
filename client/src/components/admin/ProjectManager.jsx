import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Folder } from 'lucide-react';

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({ name: '' });
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/api/projects');
            setProjects(res.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newProject.name) return;

        try {
            if (editingId) {
                await api.updateProject(editingId, newProject);
                setEditingId(null);
            } else {
                await api.post('/api/projects', newProject);
            }
            setNewProject({ name: '' });
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    const handleEdit = (project) => {
        setNewProject({ name: project.name });
        setEditingId(project.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This might affect existing tasks and allocations.')) return;
        try {
            await api.deleteProject(id);
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. It might be in use.');
        }
    };

    const handleCancel = () => {
        setNewProject({ name: '' });
        setEditingId(null);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                Manage Projects
            </h3>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {editingId ? 'Edit Project Name' : 'Project Name'}
                    </label>
                    <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Project Name"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                >
                    {editingId ? 'Update' : <><Plus className="w-4 h-4" /> Add</>}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : projects.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No projects found</td></tr>
                        ) : (
                            projects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proj.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">#{proj.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <button
                                            onClick={() => handleEdit(proj)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(proj.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectManager;
