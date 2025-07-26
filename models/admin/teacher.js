const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    image: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: [true, 'Email is required']

    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    qualification: {
        type: String,
        required: [true, 'Qualification is required']
    },
    dob: {
        type: Date,
        required: [true, 'Date of Birth is required']
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining Date is required']
    },
    dialCode: {
        type: String,
        required: [true, 'Dial Code is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Gender is required']
    },
    experience: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher
