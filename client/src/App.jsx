import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Allocations from './pages/Allocations';
import TimeLog from './pages/TimeLog';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/*" element={
          user ? (
            <Layout onLogout={handleLogout} user={user}>
              <Routes>
                <Route path="/" element={<Allocations />} />
                <Route path="/timelog" element={<TimeLog />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
