const HealthInsight = require('../models/HealthInsight');
const Appointment = require('../models/Appointment');

// @desc    Get health insights
// @route   GET /api/health-insights
// @access  Private/Patient
const getHealthInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query; // Optional filter by type
        
        let query = { userId };
        if (type) {
            query.type = type;
        }
        
        const insights = await HealthInsight.find(query)
            .sort({ date: -1 });
        
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add health insight
// @route   POST /api/health-insights
// @access  Private/Patient
const addHealthInsight = async (req, res) => {
    try {
        const { type, value, additionalData, date, notes } = req.body;
        
        // Calculate BMI if weight and height are provided
        if (type === 'bmi' && additionalData && additionalData.weight && additionalData.height) {
            const heightInMeters = additionalData.height / 100; // Assuming height in cm
            const bmi = additionalData.weight / (heightInMeters * heightInMeters);
            req.body.value = parseFloat(bmi.toFixed(2));
        }
        
        const insight = await HealthInsight.create({
            userId: req.user.id,
            type,
            value,
            additionalData,
            date: date || new Date().toISOString().split('T')[0],
            notes
        });
        
        res.status(201).json(insight);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get BMI tracker data
// @route   GET /api/health-insights/bmi
// @access  Private/Patient
const getBMITracker = async (req, res) => {
    try {
        const userId = req.user.id;
        const bmiData = await HealthInsight.find({ 
            userId, 
            type: 'bmi' 
        })
        .sort({ date: 1 });
        
        res.json(bmiData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get blood pressure trends
// @route   GET /api/health-insights/blood-pressure
// @access  Private/Patient
const getBloodPressureTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const bpData = await HealthInsight.find({ 
            userId, 
            type: 'blood_pressure' 
        })
        .sort({ date: 1 });
        
        res.json(bpData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get appointment stats
// @route   GET /api/health-insights/appointment-stats
// @access  Private/Patient
const getAppointmentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const total = await Appointment.countDocuments({ patientId: userId });
        const pending = await Appointment.countDocuments({ 
            patientId: userId, 
            status: 'pending' 
        });
        const approved = await Appointment.countDocuments({ 
            patientId: userId, 
            status: 'approved' 
        });
        const completed = await Appointment.countDocuments({ 
            patientId: userId, 
            status: 'completed' 
        });
        const rejected = await Appointment.countDocuments({ 
            patientId: userId, 
            status: 'rejected' 
        });
        
        // Appointments per month (last 6 months)
        const monthlyStats = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
            
            const count = await Appointment.countDocuments({
                patientId: userId,
                date: { $gte: startDate, $lte: endDate }
            });
            
            monthlyStats.push({
                month: `${year}-${String(month).padStart(2, '0')}`,
                count
            });
        }
        
        res.json({
            total,
            pending,
            approved,
            completed,
            rejected,
            monthlyStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHealthInsights,
    addHealthInsight,
    getBMITracker,
    getBloodPressureTrends,
    getAppointmentStats
};

