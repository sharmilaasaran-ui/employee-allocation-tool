const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initDatabase } = require('./database');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize Database
initDatabase();

// Create default admin
const createDefaultAdmin = async () => {
    try {
        const result = await pool.query('SELECT count(*) as count FROM admins');
        if (parseInt(result.rows[0].count) === 0) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await pool.query('INSERT INTO admins (email, password) VALUES ($1, $2)', ['admin@geodataar.com', hashedPassword]);
            console.log('Default admin created: admin@geodataar.com / admin123');
        }
    } catch (err) {
        console.error('Error creating default admin:', err);
    }
};
createDefaultAdmin();

// --- API Endpoints ---

// Auth
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    try {
        // Check Admin
        const adminResult = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        const admin = adminResult.rows[0];

        if (admin) {
            const validPassword = bcrypt.compareSync(password, admin.password);
            if (validPassword) {
                console.log('Admin login successful');
                return res.json({ id: admin.id, email: admin.email, name: 'Admin', role: 'admin' });
            }
        }

        // Check Employee
        const empResult = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
        const employee = empResult.rows[0];

        if (employee) {
            const validPassword = bcrypt.compareSync(password, employee.password);
            if (validPassword) {
                console.log('Employee login successful');
                return res.json({ id: employee.id, email: employee.email, name: employee.name, role: 'employee' });
            }
        }

        console.log('Invalid credentials');
        res.status(401).json({ error: 'Invalid credentials' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Employees
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/employees', async (req, res) => {
    const { name, hourly_rate, email, password } = req.body;
    try {
        const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
        const result = await pool.query(
            'INSERT INTO employees (name, hourly_rate, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, hourly_rate, email, hashedPassword]
        );
        res.json({ id: result.rows[0].id, name, hourly_rate, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, hourly_rate, email, password } = req.body;
    try {
        let query = 'UPDATE employees SET name = $1, hourly_rate = $2, email = $3';
        let params = [name, hourly_rate, email];

        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            query += ', password = $4 WHERE id = $5';
            params.push(hashedPassword, id);
        } else {
            query += ' WHERE id = $4';
            params.push(id);
        }

        await pool.query(query, params);
        res.json({ id, name, hourly_rate, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM employees WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO projects (name) VALUES ($1) RETURNING id',
            [name]
        );
        res.json({ id: result.rows[0].id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await pool.query(
            'UPDATE projects SET name = $1 WHERE id = $2',
            [name, id]
        );
        res.json({ id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tasks
app.get('/api/tasks', async (req, res) => {
    const { project_id } = req.query;
    try {
        let query = 'SELECT * FROM tasks';
        let params = [];
        if (project_id) {
            query += ' WHERE project_id = $1';
            params.push(project_id);
        }
        query += ' ORDER BY id';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { project_id, name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (project_id, name) VALUES ($1, $2) RETURNING id',
            [project_id, name]
        );
        res.json({ id: result.rows[0].id, project_id, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Allocations
app.get('/api/allocations', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, e.name as employee_name, p.name as project_name, t.name as task_name 
            FROM allocations a
            JOIN employees e ON a.employee_id = e.id
            JOIN projects p ON a.project_id = p.id
            JOIN tasks t ON a.task_id = t.id
            ORDER BY a.date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/allocations', async (req, res) => {
    const { employee_id, project_id, task_id, allocated_hours, date, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO allocations (employee_id, project_id, task_id, allocated_hours, date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [employee_id, project_id, task_id, allocated_hours, date, status || 'Not Yet Started']
        );
        res.json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/allocations/:id', async (req, res) => {
    const { id } = req.params;
    const { employee_id, project_id, task_id, allocated_hours, date, status } = req.body;
    try {
        await pool.query(
            'UPDATE allocations SET employee_id = $1, project_id = $2, task_id = $3, allocated_hours = $4, date = $5, status = $6 WHERE id = $7',
            [employee_id, project_id, task_id, allocated_hours, date, status, id]
        );
        res.json({ id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/allocations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM allocations WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Time Logs
app.get('/api/time_logs', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT tl.*, e.name as employee_name, p.name as project_name, t.name as task_name, e.hourly_rate
            FROM time_logs tl
            JOIN employees e ON tl.employee_id = e.id
            JOIN projects p ON tl.project_id = p.id
            JOIN tasks t ON tl.task_id = t.id
            ORDER BY tl.date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/time_logs', async (req, res) => {
    const { employee_id, project_id, task_id, start_time, end_time, date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO time_logs (employee_id, project_id, task_id, start_time, end_time, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [employee_id, project_id, task_id, start_time, end_time, date]
        );
        res.json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
