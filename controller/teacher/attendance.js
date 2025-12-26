const { handleError } = require('../../handler/handleError')
const Attendance = require('../../models/teacher/Attendance')
const Student = require('../../models/admin/student')

const addAttendance = async (req, res) => {
    try {
        const students = req.body.students;
        const date = req.body.date;
        if (!students) return res.status(400).json({ message: 'Students are required' });
        for (const student of students) {
            const { studentId, status, reason } = student;
            if (!studentId) return res.status(400).json({ message: 'Student ID is required' });
            if (!status) return res.status(400).json({ message: 'Status is required' });
            const statusEnum = ['present', 'absent', 'late', 'early_out', 'leave'];
            if (!statusEnum.includes(status)) return res.status(400).json({ message: 'Invalid status' });
            if (status == 'leave' && !reason) return res.status(400).json({ message: 'Reason is required' });

            const formattedDate = date ? new Date(date) : new Date();

            const startOfDay = new Date(formattedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(formattedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const isExist = await Attendance.findOne({
                studentId,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            if (!isExist) {
                console.log('date', date ? new Date(date) : new Date())
                const attendance = await Attendance.create({ studentId, date: formattedDate, status, reason });
            } else {
                console.log('else')
                if (status == 'leave' && !reason) return res.status(400).json({ message: 'Reason is required' });
                isExist.status = status;
                isExist.reason = reason;
                await isExist.save();
            }
        }
        return res.status(200).json({ message: 'Attendance added successfully' });
    } catch (error) {
        handleError(error, res)
    }
}

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
        handleError(error, res)
    }
}

const updateAttendance = async (req, res) => {
    try {
        const { attendanceId, status, reason } = req.body;
        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return res.status(400).json({ message: 'Attendance not found' });
        if (status == 'leave' && !reason) return res.status(400).json({ message: 'Reason is required' });
        if (status) attendance.status = status;
        if (reason) attendance.reason = reason;
        await attendance.save();
        return res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (error) {
        handleError(error, res)
    }
}

const deleteAttendance = async (req, res) => {
    try {
        const { _id } = req.body;
        const attendance = await Attendance.findById(_id);
        if (!attendance) return res.status(400).json({ message: 'Attendance not found' });
        await attendance.deleteOne();
        return res.status(200).json({ message: 'Attendance deleted successfully' });
    } catch (error) {
        handleError(error, res)
    }
}

module.exports = {
    addAttendance, getAttendance, updateAttendance, deleteAttendance
}
