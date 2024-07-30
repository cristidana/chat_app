const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for styles.css and scripts.js)
app.use(express.static(path.join(__dirname, 'src')));

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Use the session secret from .env.example
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Change to true if using HTTPS
}));

// Configure MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Use database host from .env.example
    user: process.env.DB_USER, // Use database user from .env.example
    password: process.env.DB_PASSWORD, // Use database password from .env.example
    database: process.env.DB_NAME // Use database name from .env.example
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Route to serve the pages

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'register.html'));
});

app.get('/admin', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'admin.html'));
});

app.get('/chat', authenticateUser, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'chat.html'));
});


// Route for user registration
app.post('/register', (req, res) => {
    const { username, password, confirm_password } = req.body;
    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)';
    db.query(query, [username, hashedPassword, 'USER_ROLE'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username already exists.' });
            }
            return res.status(500).json({ message: 'Error during registration.' });
        }

        req.session.isAuthenticated = true;
        req.session.username = username;
        req.session.userId = result.insertId;
        

        res.status(201).json({ message: 'User registered successfully.' });
    });
});

const fs = require('fs');

// Route for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error during login.' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid username or password.' });

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
        if (!passwordIsValid) return res.status(401).json({ message: 'Invalid username or password.' });

        req.session.isAuthenticated = true;
        req.session.username = username;
        req.session.userId = user.id;
        req.session.role = user.role; // Store user role in session

        if (user.role === 'ADMIN_ROLE') {
            req.session.isAdmin = true;
        } else {
            req.session.isAdmin = false;
        }

        res.status(200).json({ message: 'Login successful.', role : user.role});
    });
});


// Authentication middleware to restrict access to /chat
function authenticateUser(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

function authenticateAdmin(req, res, next) {
    if (req.session.isAuthenticated && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


// Route to fetch messages
app.get('/messages', authenticateUser, (req, res) => {
    const userId = req.session.userId;
    const query = `
        SELECT messages.*, users.username 
        FROM messages 
        JOIN users ON messages.user_id = users.id
        WHERE messages.user_id = ? 
        ORDER BY messages.created_at ASC`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching messages.' });
        }
        res.json({ userId, messages: results });
    });
});

// Route for sending a message
app.post('/message', authenticateUser, (req, res) => {
    const { message } = req.body;
    const userId = req.session.userId;
    const sender = req.session.role === 'ADMIN_ROLE' ? 'admin' : 'user'; // Determine sender based on session role

    const query = 'INSERT INTO messages (user_id, message, sender) VALUES (?, ?, ?)';
    db.query(query, [userId, message, sender], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error sending message.' });

        // Fetch and return updated messages
        const selectQuery = `
            SELECT messages.*, users.username 
            FROM messages 
            JOIN users ON messages.user_id = users.id
            WHERE messages.user_id = ? 
            ORDER BY messages.created_at ASC`;
        db.query(selectQuery, [userId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching messages.' });
            }
            res.status(201).json({ userId, messages: results });
        });
    });
});



app.get('/admin/users-with-messages', authenticateAdmin, async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT users.id, users.username 
            FROM users 
            JOIN messages ON users.id = messages.user_id 
            WHERE users.role = 'USER_ROLE'
        `;
        db.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching users with messages.' });
            }
            res.status(200).json({ users: results });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Route for admin to fetch messages for a specific user
app.get('/admin/messages/:userId', authenticateAdmin, (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT messages.*, users.username, users.role 
        FROM messages 
        JOIN users ON messages.user_id = users.id
        WHERE messages.user_id = ? 
        ORDER BY messages.created_at ASC`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching messages.' });
        }
        res.json({ userId, messages: results });
    });
});

// Route for admin to send a message to a specific user
app.post('/admin/message/:userId', authenticateAdmin, (req, res) => {
    const { message } = req.body;
    const { userId } = req.params;
    const adminId = req.session.userId; // Assuming admin's ID is stored in the session

    const query = 'INSERT INTO messages (user_id, message, sender) VALUES (?, ?, "admin")';
    db.query(query, [userId, message], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error sending message.' });

        // Fetch and return updated messages
        const selectQuery = `
            SELECT messages.*, users.username, users.role 
            FROM messages 
            JOIN users ON messages.user_id = users.id
            WHERE messages.user_id = ? 
            ORDER BY messages.created_at ASC`;
        db.query(selectQuery, [userId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error fetching messages.' });
            }
            res.status(201).json({ userId, messages: results });
        });
    });
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
