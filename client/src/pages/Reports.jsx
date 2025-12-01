import React, { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, BarChart2, Download } from 'lucide-react';

const Reports = () => {
    const [employees, setEmployees] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empRes, logRes] = await Promise.all([
                api.get('/api/employees'),
                api.get('/api/time_logs')
            ]);
            setEmployees(empRes.data);
            setTimeLogs(logRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateHours = (start, end) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const diff = (endH * 60 + endM) - (startH * 60 + startM);
        return diff > 0 ? diff / 60 : 0;
    };

    const getReportData = () => {
        const reportData = employees.map(emp => {
            const empLogs = timeLogs.filter(log =>
                log.employee_id === emp.id &&
                log.date.startsWith(selectedMonth)
            );

            const totalHours = empLogs.reduce((sum, log) => sum + calculateHours(log.start_time, log.end_time), 0);
            const totalPay = totalHours * emp.hourly_rate;

            return {
                id: emp.id,
                name: emp.name,
                hourlyRate: emp.hourly_rate,
                totalHours: parseFloat(totalHours.toFixed(2)),
                totalPay: parseFloat(totalPay.toFixed(2))
            };
        });
        return reportData;
    };

    const data = getReportData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 className="w-8 h-8 text-indigo-600" />
                    Reports & Payments
                </h2>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Month:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Sheet */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Payment Sheet
                        </h3>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pay</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">₹{row.hourlyRate}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{row.totalHours}h</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600 text-right">₹{row.totalPay}</td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No data for this month</td></tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right text-gray-900">Total Payout:</td>
                                    <td className="px-4 py-3 text-right text-green-600">
                                        ₹{data.reduce((sum, row) => sum + row.totalPay, 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Comparison Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        Hours Comparison
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [`${value}h`, 'Hours Worked']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="totalHours" name="Hours Worked" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
