const Appointment = require('../models/Appointment');
const { createNotification } = require('./notificationController');

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
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

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private/Patient
const bookAppointment = async (req, res) => {
    // req.body: { doctorId, date, time, type, reason }
    // doctorId passed might be Doctor table ID or User ID? 
    // Frontend likely passes Doctor ID (from getAllDoctors).
    // If Doctor ID, I need to find the User ID associated, or store Doctor ID.
    // My model stores 'doctorId' with ref 'User'.
    // So if frontend sends Doctor ID (from Doctor collection), I need to lookup.

    // Let's assume frontend sends Doctor user ID or I fetch it.
    // If I used getAllDoctors which returns { pk: doctor._id, ... }, it's Doctor ID.
    const { doctorId, date, time, type, reason } = req.body;

    try {
        // Check if doctorId is Doctor model ID
        const Doctor = require('../models/Doctor');

        // Find the Doctor document to get the associated User ID
        let targetUserId = doctorId;

        // Try to find if the provided ID is a Doctor Table ID
        // If the frontend sends the User ID directly, this query might fail or return null, which is fine.
        // But usually frontend displays doctors from Doctor collection.
        const doctorDoc = await Doctor.findById(doctorId);

        if (doctorDoc) {
            targetUserId = doctorDoc.userId;
        } else {
            // It might be that doctorId passed IS the User ID already.
            // Let's verify if a User exists with this ID and has role 'doctor'
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
        
        // Create notification for doctor
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

// @desc    Cancel/Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Not found' });

        // Check ownership
        if (appointment.patientId.toString() !== req.user.id && appointment.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('doctorId', 'name')
            .populate('patientId', 'name');
        
        // Create notifications for status changes
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

// @desc    Approve appointment
// @route   PUT /api/appointments/:id/approve
// @access  Private/Doctor
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

// @desc    Reject appointment
// @route   PUT /api/appointments/:id/reject
// @access  Private/Doctor
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
