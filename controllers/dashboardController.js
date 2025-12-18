const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const Medicine = require('../models/Medicine');
const DoctorNote = require('../models/DoctorNote');

// @desc    Get Patient Dashboard
// @route   GET /api/dashboard/patient
// @access  Private/Patient
const getPatientDashboard = async (req, res) => {
    try {
        const patientId = req.user.id;
        
        // Total appointments
        const totalAppointments = await Appointment.countDocuments({ patientId });
        
        // Upcoming appointments (approved, scheduled for future dates)
        const today = new Date().toISOString().split('T')[0];
        const upcomingAppointments = await Appointment.find({
            patientId,
            status: { $in: ['pending', 'approved'] },
            date: { $gte: today }
        })
        .populate('doctorId', 'name')
        .sort({ date: 1, time: 1 })
        .limit(5);
        
        // Notifications
        const notifications = await Notification.find({ userId: patientId })
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Unread notifications count
        const unreadCount = await Notification.countDocuments({ 
            userId: patientId, 
            read: false 
        });
        
        res.json({
            totalAppointments,
            upcomingAppointments,
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Doctor Dashboard
// @route   GET /api/dashboard/doctor
// @access  Private/Doctor
const getDoctorDashboard = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        
        // Total appointments today
        const appointmentsToday = await Appointment.countDocuments({
            doctorId,
            date: today,
            status: { $in: ['approved', 'pending'] }
        });
        
        // Pending approvals
        const pendingAppointments = await Appointment.countDocuments({
            doctorId,
            status: 'pending'
        });
        
        // Total patients (unique patients who have appointments)
        const uniquePatients = await Appointment.distinct('patientId', { doctorId });
        const totalPatients = uniquePatients.length;
        
        // Appointments per day for chart (last 7 days)
        const appointmentsPerDay = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = await Appointment.countDocuments({
                doctorId,
                date: dateStr
            });
            appointmentsPerDay.push({
                date: dateStr,
                count
            });
        }
        
        res.json({
            appointmentsToday,
            pendingAppointments,
            totalPatients,
            appointmentsPerDay
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Dashboard
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
    try {
        // Total doctors
        const totalDoctors = await Doctor.countDocuments();
        
        // Total patients
        const totalPatients = await User.countDocuments({ role: 'patient' });
        
        // Appointments today
        const today = new Date().toISOString().split('T')[0];
        const appointmentsToday = await Appointment.countDocuments({ date: today });
        
        // Analytics chart data
        const appointmentsPerWeek = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = await Appointment.countDocuments({ date: dateStr });
            appointmentsPerWeek.push({
                date: dateStr,
                count
            });
        }
        
        res.json({
            totalDoctors,
            totalPatients,
            appointmentsToday,
            appointmentsPerWeek
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPatientDashboard,
    getDoctorDashboard,
    getAdminDashboard
};

