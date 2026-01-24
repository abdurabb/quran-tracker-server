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
            studentId: new mongoose.Types.ObjectId(userData._id),
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

const getAttendanceByMonth = async (req, res) => {
    try {
        let { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: 'Month and year are required' });
        month = parseInt(month);
        year = parseInt(year);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        let query = {
            studentId: new mongoose.Types.ObjectId(req?.userId),
            date: { $gte: startDate, $lte: endDate }
        }
        const attendanceData = await Attendance.find(query).select('date status');
        const totalPresent = attendanceData.filter(item => item.status === 'present').length;
        const totalAbsent = attendanceData.filter(item => item.status === 'absent').length;
        const totalLate = attendanceData.filter(item => item.status === 'late').length;
        const totalEarlyOut = attendanceData.filter(item => item.status === 'early_out').length;
        const totalLeave = attendanceData.filter(item => item.status === 'leave').length;
        return res.status(200).json({ message: 'Attendance fetched successfully', attendanceData, totalPresent, totalAbsent, totalLate, totalEarlyOut, totalLeave });
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
module.exports = { getProfile, getAttendance, getClassData, getAttendanceByMonth }