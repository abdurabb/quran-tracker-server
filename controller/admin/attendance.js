const { handleError } = require('../../handler/handleError')
const Attendance = require('../../models/teacher/Attendance')
const Student = require('../../models/admin/student')

const getAttendance = async (req, res) => {
    try {
        const { classId, date } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!classId) return res.status(400).json({ message: 'Class ID is required' });
        if (!date) return res.status(400).json({ message: 'Date is required' });
        const studentIds = await Student.distinct("_id", { classId });
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const attendance = await Attendance.find({ studentId: { $in: studentIds }, date: { $gte: startDate, $lte: endDate } }).populate('studentId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Attendance.countDocuments({ studentId: { $in: studentIds }, date: { $gte: startDate, $lte: endDate } });
        return res.status(200).json({ message: 'Attendance fetched successfully', attendance, totalPages: Math.ceil(total / limit), total });
    } catch (error) {
        handleError(error, res);
    }
}

module.exports = { getAttendance }