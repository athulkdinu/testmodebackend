const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all users (for admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'patient' }); // Frontend mostly displays patients in user management? or all?
        // MockData 'adminUsers' has role: 'Patient'.
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a user (by admin)
// @route   POST /api/admin/users
// @access  Private/Admin
const addUser = async (req, res) => {
    const { name, email, role } = req.body;
    // Password default? Or generated.
    const password = "password123"; // Default password for admin created users
    // In real app, email invite.

    try {
        // Hash logic... handled in a helper or repeated. I'll import bcrypt.
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'patient'
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor's patients (patients who have appointments with this doctor)
// @route   GET /api/doctors/patients
// @access  Private/Doctor
const getDoctorPatients = async (req, res) => {
    try {
        // Get unique patient IDs who have appointments with this doctor
        const patientIds = await Appointment.distinct('patientId', { doctorId: req.user.id });
        
        // Get patient details
        const patients = await User.find({ 
            _id: { $in: patientIds },
            role: 'patient' 
        }).select('-password');
        
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsers, addUser, deleteUser, getDoctorPatients };
