const Appointment = require('../models/Appointment');
const { createNotification } = require('./notificationController');

const getAppointments = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'doctor') {
            query.doctorId = req.user.id;
        }

        const appointments = await Appointment.find(query)
            .populate('doctorId', 'name')
            .populate('patientId', 'name');
console.log(appointments);

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const bookAppointment = async (req, res) => {
    
    const { doctorId, date, time, type, reason } = req.body;

    try {
        
        const Doctor = require('../models/Doctor');

       
        let targetUserId = doctorId;

        
        const doctorDoc = await Doctor.findById(doctorId);

        if (doctorDoc) {
            targetUserId = doctorDoc.userId;
        } else {
           
            const User = require('../models/User');
            const userDoc = await User.findById(doctorId);
            if (userDoc && userDoc.role === 'doctor') {
                targetUserId = userDoc._id;
            } else {
                return res.status(404).json({ message: 'Doctor not found' });
            }
        }

        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId: targetUserId,
            date,
            time,
            type,
            reason,
            status: 'pending'
        });
        
       
        await createNotification(
            targetUserId,
            'New Appointment Request',
            `You have a new appointment request from ${req.user.name} on ${date} at ${time}`,
            'appointment',
            appointment._id
        );
        
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Not found' });

        
        if (appointment.patientId.toString() !== req.user.id && appointment.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('doctorId', 'name')
            .populate('patientId', 'name');
        
        
        if (req.body.status === 'approved') {
            await createNotification(
                appointment.patientId,
                'Appointment Approved',
                `Your appointment on ${appointment.date} at ${appointment.time} has been approved`,
                'appointment',
                appointment._id
            );
        } else if (req.body.status === 'rejected') {
            await createNotification(
                appointment.patientId,
                'Appointment Rejected',
                `Your appointment on ${appointment.date} at ${appointment.time} has been rejected`,
                'appointment',
                appointment._id
            );
        }
        
        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const approveAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        appointment.status = 'approved';
        await appointment.save();

        await createNotification(
            appointment.patientId,
            'Appointment Approved',
            `Your appointment on ${appointment.date} at ${appointment.time} has been approved`,
            'appointment',
            appointment._id
        );

        const updatedAppointment = await Appointment.findById(req.params.id)
            .populate('doctorId', 'name')
            .populate('patientId', 'name');

        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const rejectAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        appointment.status = 'rejected';
        await appointment.save();

        await createNotification(
            appointment.patientId,
            'Appointment Rejected',
            `Your appointment on ${appointment.date} at ${appointment.time} has been rejected`,
            'appointment',
            appointment._id
        );

        const updatedAppointment = await Appointment.findById(req.params.id)
            .populate('doctorId', 'name')
            .populate('patientId', 'name');

        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAppointments, bookAppointment, updateAppointment, approveAppointment, rejectAppointment };
