import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, User } from 'lucide-react';

const EmployeeManager = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({ name: '', hourly_rate: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const [editingId, setEditingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEmployee.name || !newEmployee.hourly_rate) return;

        try {
            if (editingId) {
                await api.put(`/api/employees/${editingId}`, newEmployee);
                setEditingId(null);
            } else {
                await api.post('/api/employees', newEmployee);
            }
            setNewEmployee({ name: '', hourly_rate: '' });
            fetchEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
        }
    };

    const handleEdit = (emp) => {
        setNewEmployee({ name: emp.name, hourly_rate: emp.hourly_rate });
        setEditingId(emp.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`/api/employees/${id}`);
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleCancel = () => {
        setNewEmployee({ name: '', hourly_rate: '' });
        setEditingId(null);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Manage Employees
            </h3>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>
                <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                    <input
                        type="number"
                        value={newEmployee.hourly_rate}
                        onChange={(e) => setNewEmployee({ ...newEmployee, hourly_rate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0.00"
                    />
                </div>
                <div className="flex gap-2">
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className={`px-4 py-2 ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg transition-colors flex items-center gap-2 font-medium`}
                    >
                        {editingId ? 'Update' : <><Plus className="w-4 h-4" /> Add</>}
                    </button>
                </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hourly Rate</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                        ) : employees.length === 0 ? (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No employees found</td></tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{emp.hourly_rate}/hr</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="text-red-600 hover:text-red-900 font-medium"
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

export default EmployeeManager;
