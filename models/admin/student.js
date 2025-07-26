const mongoose = require('mongoose');

const studentsSchema = new mongoose.Schema({
    image: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        required: [true, 'name is Required']
    },
    email: {
        type: String,
        required: [true, 'email is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    dialCode: {
        type: String,
        required: [true, 'Dial Code is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    dob: {
        type: Date,
        required: [true, 'Dob is required']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male', 'female'],
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        default: null
    },
    admissionDate: {
        type: Date,
        required: [true, 'Admission Date is required']
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentsSchema);
module.exports = Student



