const DoctorNote = require('../models/DoctorNote');


const getDoctorNotes = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'doctor') {
            query.doctorId = req.user.id;
        }

        const notes = await DoctorNote.find(query)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addDoctorNote = async (req, res) => {
    
    try {
        const note = await DoctorNote.create({
            doctorId: req.user.id,
            ...req.body
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const updateDoctorNote = async (req, res) => {
    try {
        const note = await DoctorNote.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        if (note.doctorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedNote = await DoctorNote.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPatientNotes = async (req, res) => {
    try {
        const { patientId } = req.params;
        const notes = await DoctorNote.find({ 
            patientId,
            doctorId: req.user.id 
        })
        .populate('patientId', 'name')
        .sort({ createdAt: -1 });
        
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDoctorNotes, addDoctorNote, updateDoctorNote, getPatientNotes };
