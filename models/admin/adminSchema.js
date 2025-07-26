const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is Required']
    },
    email: {
        type: String,
        required: [true, 'Email is Required']
    },
    password:{
        type:String,
        required:[true,'Password is Required']
    },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
