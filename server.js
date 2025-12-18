const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin'); // Import seeder

dotenv.config();

// Connect DB and then Seed Admin
connectDB().then(() => {
    seedAdmin();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/admin/users', require('./routes/userRoutes'));
app.use('/api/doctors/patients', require('./routes/doctorPatientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes')); // Public/Admin mixed
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/doctor_notes', require('./routes/doctorNoteRoutes'));
app.use('/api/health-insights', require('./routes/healthInsightRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/agora', require('./routes/agoraRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket.IO connection handling
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Store active users: userId -> socketId
const activeUsers = new Map();

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userName})`);
    
    // Store user's socket connection
    activeUsers.set(socket.userId, socket.id);

    // Handle incoming call from patient to doctor
    socket.on('call:initiate', async ({ doctorId, patientId, channelName, callerName }) => {
        console.log(`Call initiated: Patient ${patientId} calling Doctor ${doctorId}`);
        
        // Find doctor's socket
        const doctorSocketId = activeUsers.get(doctorId);
        if (doctorSocketId) {
            io.to(doctorSocketId).emit('call:incoming', {
                from: patientId,
                fromName: callerName,
                channelName,
                type: 'patient-to-doctor'
            });
        }
    });

    // Handle incoming call from doctor to patient
    socket.on('call:initiate-doctor', async ({ patientId, doctorId, channelName, callerName }) => {
        console.log(`Call initiated: Doctor ${doctorId} calling Patient ${patientId}`);
        
        // Find patient's socket
        const patientSocketId = activeUsers.get(patientId);
        if (patientSocketId) {
            io.to(patientSocketId).emit('call:incoming', {
                from: doctorId,
                fromName: callerName,
                channelName,
                type: 'doctor-to-patient'
            });
        }
    });

    // Handle call acceptance
    socket.on('call:accept', ({ channelName, toUserId }) => {
        const toSocketId = activeUsers.get(toUserId);
        if (toSocketId) {
            io.to(toSocketId).emit('call:accepted', {
                channelName,
                acceptedBy: socket.userId
            });
        }
    });

    // Handle call rejection
    socket.on('call:reject', ({ toUserId }) => {
        const toSocketId = activeUsers.get(toUserId);
        if (toSocketId) {
            io.to(toSocketId).emit('call:rejected', {
                rejectedBy: socket.userId
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        activeUsers.delete(socket.userId);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server initialized`);
});
