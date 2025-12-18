const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        let profile = user.toObject();
        
        // If doctor, get doctor details
        if (user.role === 'doctor') {
            const doctorDetails = await Doctor.findOne({ userId: user._id });
            profile.doctorDetails = doctorDetails;
        }
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dateOfBirth, gender, contact, password } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (contact) user.contact = contact;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        
        await user.save();
        
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update doctor profile
// @route   PUT /api/profile/doctor
// @access  Private/Doctor
const updateDoctorProfile = async (req, res) => {
    try {
        const { specialty, experience, contact, schedule } = req.body;
        
        const doctor = await Doctor.findOne({ userId: req.user.id });
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        
        if (specialty) doctor.specialty = specialty;
        if (experience !== undefined) doctor.experience = experience;
        if (contact) doctor.contact = contact;
        if (schedule) doctor.schedule = schedule;
        
        await doctor.save();
        
        const updatedDoctor = await Doctor.findById(doctor._id).populate('userId', 'name email');
        res.json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateDoctorProfile
};

