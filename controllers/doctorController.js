const Doctor = require('../models/Doctor');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public (or Private)
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email');
        // Transform for frontend if needed?
        // Frontend expects: { id, name, specialty, ... }
        const formattedDoctors = doctors.map(doc => ({
            id: doc._id,
            userId: doc.userId._id || doc.userId,
            name: doc.userId.name,
            specialty: doc.specialty,
            experience: doc.experience,
            // ... other fields
        }));
        res.json(formattedDoctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a doctor (Admin)
// @route   POST /api/admin/doctors
// @access  Private/Admin
const addDoctor = async (req, res) => {
    try {
        console.log('Adding Doctor Request:', req.body);
        const { name, email, password, specialty, experience } = req.body;

        if (!name || !email || !specialty) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const doctorPassword = password || "password123"; // Use provided or default

        // Create User first
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doctorPassword, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'doctor'
        });

        // Create Doctor Details
        const doctor = await Doctor.create({
            userId: user._id,
            specialty,
            experience
        });

        res.status(201).json({
            id: doctor._id,
            name: user.name,
            specialty: doctor.specialty
        });

    } catch (error) {
        console.error("Add Doctor Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) {
            await User.findByIdAndDelete(doctor.userId); // Delete associated user
            await doctor.deleteOne();
            res.json({ message: 'Doctor removed' });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
const updateDoctor = async (req, res) => {
    try {
        const { name, email, specialty, experience, contact } = req.body;
        const doctor = await Doctor.findById(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        const user = await User.findById(doctor.userId);
        
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();
        
        if (specialty) doctor.specialty = specialty;
        if (experience !== undefined) doctor.experience = experience;
        if (contact) doctor.contact = contact;
        await doctor.save();
        
        const updatedDoctor = await Doctor.findById(req.params.id).populate('userId', 'name email');
        res.json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllDoctors, addDoctor, deleteDoctor, updateDoctor };
