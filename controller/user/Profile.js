const { handleError } = require('../../handler/handleError')
const Class = require('../../models/admin/class')
const Attendance = require('../../models/teacher/Attendance')
const mongoose = require('mongoose')
const getProfile = async (req, res) => {
    try {
        const userData = req.user;
        const classData = await Class.findById(userData.classId).select('name');
        return res.status(200).json({
            message: 'Profile fetched successfully',
            user: {
                ...userData._doc,
                class: classData?.name
            }
        });
    } catch (error) {
        handleError(error, res);
    }
}

const getAttendance = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        const userData = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {
            // student: userData._id,
            studentId:new mongoose.Types.ObjectId(userData._id),
        }
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        startDate = startDate.setHours(0, 0, 0, 0);
        endDate = endDate.setHours(23, 59, 59, 999);
        if (startDate && endDate) {
            query.date = {
                $gte: startDate,
                $lte: endDate
            }
        } else {
            query.date = {
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date()
            }
        }
        const attendanceData = await Attendance.find(query).select('date status reason').skip(skip).limit(limit);
        const totalAttendance = await Attendance.countDocuments(query);
        return res.status(200).json({ message: 'Attendance fetched successfully', attendanceData, totalPages: Math.ceil(totalAttendance / limit) });
    } catch (error) {
        handleError(error, res);
    }
}

const getClassData = async (req, res) => {
    try {
        const userData = req.user;
        const classData = await Class
            .findById(userData.classId)
            .populate('teacher', 'name image email phone dialCode address experience');

        return res.status(200).json({ message: 'Class data fetched successfully', classData });
    } catch (error) {
        handleError(error, res);
    }
}
module.exports = { getProfile, getAttendance, getClassData }