const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'early_out', 'leave'],
        required: [true, 'Status is required']
    },
    reason: {
        type: String,
    },

}, { timestamps: true })

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance