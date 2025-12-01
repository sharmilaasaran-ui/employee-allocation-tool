import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Settings, Users, Briefcase, Building2 } from 'lucide-react';

const Layout = ({ children, onLogout, user }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Allocations', icon: LayoutDashboard },
        { path: '/timelog', label: 'Time Log', icon: Calendar },
        { path: '/reports', label: 'Reports', icon: FileText },
        { path: '/admin', label: 'Admin', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white shadow-xl flex flex-col transition-all duration-300">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-wide">GeoDataar</h1>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Allocation Tool</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                <Users className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-500">Logged In</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50/50">
                <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
