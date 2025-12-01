import React, { useState, useEffect } from 'react';
import api from '../api';
import { Clock, Save, Calendar } from 'lucide-react';

const TimeLog = () => {
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [todaysLogs, setTodaysLogs] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [logEntry, setLogEntry] = useState({
        project_id: '',
        task_id: '',
        start_time: '',
        end_time: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchTodaysLogs();
        }
    }, [selectedEmployee]);

    const fetchData = async () => {
        try {
            const [empRes, projRes, taskRes] = await Promise.all([
                api.get('/api/employees'),
                api.get('/api/projects'),
                api.get('/api/tasks')
            ]);
            setEmployees(empRes.data);
            setProjects(projRes.data);
            setTasks(taskRes.data);

            if (empRes.data.length > 0) {
                setSelectedEmployee(empRes.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchTodaysLogs = async () => {
        try {
            const res = await api.get('/api/time_logs');
            // Filter for selected employee and today (or just show all for now)
            // Ideally backend should filter, but for prototype we filter here
            const filtered = res.data.filter(log =>
                log.employee_id === parseInt(selectedEmployee) &&
                log.date === logEntry.date
            );
            setTodaysLogs(filtered);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const getFilteredTasks = () => {
        if (!logEntry.project_id) return [];
        return tasks.filter(t => t.project_id === parseInt(logEntry.project_id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            await api.post('/api/time_logs', {
                ...logEntry,
                employee_id: selectedEmployee
            });
            fetchTodaysLogs();
            // Reset times but keep project/task
            setLogEntry(prev => ({ ...prev, start_time: '', end_time: '' }));
        } catch (error) {
            console.error('Error logging time:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-8 h-8 text-indigo-600" />
                    Daily Time Log
                </h2>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Acting as:</label>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={logEntry.date}
                                onChange={(e) => setLogEntry({ ...logEntry, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                            <select
                                value={logEntry.project_id}
                                onChange={(e) => setLogEntry({ ...logEntry, project_id: e.target.value, task_id: '' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                            <select
                                value={logEntry.task_id}
                                onChange={(e) => setLogEntry({ ...logEntry, task_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                disabled={!logEntry.project_id}
                            >
                                <option value="">Select Task</option>
                                {getFilteredTasks().map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={logEntry.start_time}
                                    onChange={(e) => setLogEntry({ ...logEntry, start_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={logEntry.end_time}
                                    onChange={(e) => setLogEntry({ ...logEntry, end_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save Log
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    Today's Logs
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {todaysLogs.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No logs for this date</td></tr>
                            ) : (
                                todaysLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.project_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.task_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                            {log.start_time} - {log.end_time}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TimeLog;
