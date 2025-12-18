const Medicine = require('../models/Medicine');

// @desc    Get medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.user.id });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add medicine
// @route   POST /api/medicines
// @access  Private
const addMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.create({
            userId: req.user.id,
            ...req.body
        });
        res.status(201).json(medicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        if (medicine.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedMedicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMedicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        if (medicine.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await medicine.deleteOne();
        res.json({ message: 'Medicine deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMedicines, addMedicine, updateMedicine, deleteMedicine };
