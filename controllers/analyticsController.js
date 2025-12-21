const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');


const getSystemAnalytics = async (req, res) => {
    try {
        // Doctors count
        const doctorsCount = await Doctor.countDocuments();
        
        // Patients count
        const patientsCount = await User.countDocuments({ role: 'patient' });
        
        // Appointments per week 
        const appointmentsPerWeek = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            const count = await Appointment.countDocuments({
                createdAt: { $gte: weekStart, $lte: weekEnd }
            });
            
            appointmentsPerWeek.push({
                week: `Week ${4 - i}`,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                count
            });
        }
        
        // Appointments by status
        const appointmentsByStatus = {
            pending: await Appointment.countDocuments({ status: 'pending' }),
            approved: await Appointment.countDocuments({ status: 'approved' }),
            rejected: await Appointment.countDocuments({ status: 'rejected' }),
            completed: await Appointment.countDocuments({ status: 'completed' }),
            cancelled: await Appointment.countDocuments({ status: 'cancelled' })
        };
        
        // Appointments per day 
        const appointmentsPerDay = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = await Appointment.countDocuments({ date: dateStr });
            appointmentsPerDay.push({
                date: dateStr,
                count
            });
        }
        
        // Top doctors by appointments
        const topDoctors = await Appointment.aggregate([
            {
                $group: {
                    _id: '$doctorId',
                    appointmentCount: { $sum: 1 }
                }
            },
            { $sort: { appointmentCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: '$doctor' },
            {
                $project: {
                    doctorId: '$_id',
                    doctorName: '$doctor.name',
                    appointmentCount: 1
                }
            }
        ]);
        
        res.json({
            doctorsCount,
            patientsCount,
            appointmentsPerWeek,
            appointmentsByStatus,
            appointmentsPerDay,
            topDoctors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemAnalytics
};

