const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is Required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null
    }
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class
