const { verifyToken } = require('../handler/jwtGenerate');
const Admin = require('../models/admin/adminSchema')




const protectAdmin = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (token) {
                const decoded = verifyToken(token);
                const admin = await Admin.findById(decoded.id).select('-password');
                if (!admin) {
                    return res.status(404).json({ status: false, message: 'Admin not found' });
                }
                req.admin = admin;
                req.adminId = admin?._id
                next();
            }
        } catch (error) {
            if (error.message == 'jwt expired') {
                return res.status(399).json({ status: false, message: 'Token expired' });
            } else {
                return res.status(403).json({ status: false, message: 'Invalid token' });
            }
        }
    }
    if (!token) {
        return res.status(401).json({ status: false, message: 'Token not found' });
    }
}



module.exports = {
    protectAdmin,
}

