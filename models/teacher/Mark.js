const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required']
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: [true,'Lesson ID is required']
    },
    lessonTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonType',
        default: null
    },
    lessonName:{
        type: String,
        required: [true, 'Lesson Name is required']
    },
    initialCount:{
        type: Number,
        default: 0
    },
    typeName:{
        type: String,
        required: [true, 'Type Name is required']
    },
    initialMark:{
        type: Number,
        default: 0
    },
    obtainedCount:{
        type: Number,
        default: 0
    },
    obtainedMark: {
        type: Number,
        required: true
    },
}, { timestamps: true });

/* ----------------------------
   🔥 Indexes for Fast Queries
----------------------------- */
markSchema.index({ studentId: 1 });
markSchema.index({ lessonId: 1 });
markSchema.index({ lessonTypeId: 1 });
markSchema.index({ studentId: 1, lessonId: 1 });
markSchema.index({ studentId: 1, lessonTypeId: 1 });

const Mark = mongoose.model("Mark", markSchema);
module.exports = Mark;
