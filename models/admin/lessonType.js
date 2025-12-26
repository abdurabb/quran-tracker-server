const mongoose = require('mongoose');

const lessonTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is Required']
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
})

const LessonType = mongoose.model('LessonType', lessonTypeSchema);

module.exports = LessonType