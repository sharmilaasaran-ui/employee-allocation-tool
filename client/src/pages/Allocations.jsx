import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Calendar, User, Briefcase, Clock } from 'lucide-react';

const Allocations = () => {
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [newAllocation, setNewAllocation] = useState({
        employee_id: '',
        project_id: '',
        task_id: '',
        allocated_hours: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, projRes, taskRes, allocRes] = await Promise.all([
                api.get('/api/employees'),
                api.get('/api/projects'),
                api.get('/api/tasks'),
                api.get('/api/allocations')
            ]);
            setEmployees(empRes.data);
            setProjects(projRes.data);
            setTasks(taskRes.data);
            setAllocations(allocRes.data);

            if (empRes.data.length > 0) {
                setNewAllocation(prev => ({ ...prev, employee_id: empRes.data[0].id }));
            }
            if (projRes.data.length > 0) {
                setNewAllocation(prev => ({ ...prev, project_id: projRes.data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (projectId) => {
        setNewAllocation(prev => ({ ...prev, project_id: projectId, task_id: '' }));
    };

    const getFilteredTasks = () => {
        if (!newAllocation.project_id) return [];
        return tasks.filter(t => t.project_id === parseInt(newAllocation.project_id));
    };

    const [editingId, setEditingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/api/allocations/${editingId}`, newAllocation);
                setEditingId(null);
            } else {
                await api.post('/api/allocations', newAllocation);
            }
            setShowForm(false);
            setNewAllocation({
                employee_id: employees[0]?.id || '',
                project_id: projects[0]?.id || '',
                task_id: '',
                allocated_hours: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (error) {
            console.error('Error saving allocation:', error);
        }
    };

    const handleEdit = (alloc) => {
        setNewAllocation({
            employee_id: alloc.employee_id,
            project_id: alloc.project_id,
            task_id: alloc.task_id,
            allocated_hours: alloc.allocated_hours,
            date: alloc.date
        });
        setEditingId(alloc.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this allocation?')) return;
        try {
            await api.delete(`/api/allocations/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting allocation:', error);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setNewAllocation({
            employee_id: employees[0]?.id || '',
            project_id: projects[0]?.id || '',
            task_id: '',
            allocated_hours: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    // Group allocations by employee
    const allocationsByEmployee = employees.map(emp => {
        const empAllocations = allocations.filter(a => a.employee_id === emp.id);
        return { ...emp, allocations: empAllocations };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Task Allocations</h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    New Allocation
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingId ? 'Edit Allocation' : 'Assign Task'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                            <select
                                value={newAllocation.employee_id}
                                onChange={(e) => setNewAllocation({ ...newAllocation, employee_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                            <select
                                value={newAllocation.project_id}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                            <select
                                value={newAllocation.task_id}
                                onChange={(e) => setNewAllocation({ ...newAllocation, task_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="">Select Task</option>
                                {getFilteredTasks().map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                            <input
                                type="number"
                                value={newAllocation.allocated_hours}
                                onChange={(e) => setNewAllocation({ ...newAllocation, allocated_hours: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="8"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={newAllocation.date}
                                onChange={(e) => setNewAllocation({ ...newAllocation, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-5 flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {editingId ? 'Update' : 'Assign'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {allocationsByEmployee.map(emp => (
                    <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                    {emp.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{emp.name}</h3>

                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {emp.allocations.length} Active Tasks
                            </div>
                        </div>

                        {emp.allocations.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {emp.allocations.map(alloc => (
                                    <div key={alloc.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{alloc.task_name}</p>
                                                <p className="text-sm text-gray-500">{alloc.project_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{alloc.allocated_hours}h</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{alloc.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(alloc)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(alloc.id)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                No tasks assigned yet.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Allocations;
