const Doctor = require('../models/Doctor');
const User = require('../models/User');
const bcrypt = require('bcrypt');


const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'name email');
        
        const formattedDoctors = doctors.map(doc => ({
            id: doc._id,
            userId: doc.userId._id || doc.userId,
            name: doc.userId.name,
            specialty: doc.specialty,
            experience: doc.experience,
            user:doc.userId
            
        }));
        res.json(formattedDoctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addDoctor = async (req, res) => {
    try {
        console.log('Adding Doctor Request:', req.body);
        const { name, email, password, specialty, experience } = req.body;

        if (!name || !email || !specialty) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const doctorPassword = password || "password123"; 

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doctorPassword, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'doctor'
        });

        
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


const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) {
            await User.findByIdAndDelete(doctor.userId); 
            await doctor.deleteOne();
            res.json({ message: 'Doctor removed' });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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
