import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Folder } from 'lucide-react';

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({ name: '' });
    const [loading, setLoading] = useState(true);

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
            await api.post('/api/projects', newProject);
            setNewProject({ name: '' });
            fetchProjects();
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                Manage Projects
            </h3>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="New Project Name"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="2" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : projects.length === 0 ? (
                            <tr><td colSpan="2" className="px-6 py-4 text-center text-gray-500">No projects found</td></tr>
                        ) : (
                            projects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proj.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">#{proj.id}</td>
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
