const { generateToken } = require("../../handler/jwtGenerate");
const { handleError } = require('../../handler/handleError')
const Admin = require('../../models/admin/adminSchema')
const bcrypt = require('bcryptjs');

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req?.body
        if (!email) { return res.status(400).json({ success: false, message: 'Email is required.' }) }
        let isExist = await Admin.findOne({ email })
        if (!isExist) { return res.status(400).json({ success: false, message: 'Email is not registered.' }) }
        if (isExist?.password !== password) { return res.status(400).json({ success: false, message: 'Incorrect Password.' }) }
        // const isMatch = await bcrypt.compare(password, isExist?.password);
        // if (!isMatch) {
        //     return res.status(401).json({ message: 'Invalid email or password' });
        // }
        const token = generateToken(isExist._id, "90d");
        return res.status(200).json({ success: true, message: "Logged Successfully", token, role: 'admin', admin: isExist, })
    } catch (error) {
        handleError(error, res)
    }
}

module.exports = {
    adminLogin
}