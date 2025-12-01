import React, { useState } from 'react';
import EmployeeManager from '../components/admin/EmployeeManager';
import ProjectManager from '../components/admin/ProjectManager';
import TaskManager from '../components/admin/TaskManager';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('employees');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['employees', 'projects', 'tasks'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                ${activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'employees' && <EmployeeManager />}
                {activeTab === 'projects' && <ProjectManager />}
                {activeTab === 'tasks' && <TaskManager />}
            </div>
        </div>
    );
};

export default Admin;
