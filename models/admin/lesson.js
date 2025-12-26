const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is Required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    mark:{
        type: Number,
        required: [true, 'Mark is required']
    },
    lessonType: {
        // juzu/ line/  page
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonType',
        // required: [true, 'Lesson Type is required']
    },
    criteriaNumber:{
        // 1/ 2/ 3 - 2 line 4 pages etc.
        type: Number,
        // required: [true, 'Criteria Number is required']
    },
    isFixedMarks:{
        type: Boolean,
        default: false
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
    
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson