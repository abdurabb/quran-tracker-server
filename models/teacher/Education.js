const mongoose = require('mongoose');

const educationLevelSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required']
    },
    juzuCompleted: {
        type: Boolean,
        required: [true, 'Juzu Completed is required']
    },
    juzuCount: {
        type: Number,
        default: 0
    },
    lineCount: {
        type: Number,
        default: 0
    },
    month: {
        type: Number,
        required: [true, 'Month is required']
    },
    pageCount: {
        type: Number,
        required: [true, 'Page Count is required']
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    juzuDetails: [
        {
            juzNumber: {
                type: Number,
                default: 0
            },
            juzName: {
                type: String,
                default: ''
            },
            howManyDays: {
                type: Number,
                default: 0
            },
        }
    ]

}, { timestamps: true })

const EducationLevel = mongoose.model('EducationLevel', educationLevelSchema);
module.exports = EducationLevel