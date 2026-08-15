const { handleError } = require("../../handler/handleError");
const Attendance = require("../../models/teacher/Attendance");
const Student = require("../../models/admin/student");
const WEEKLY_HOLIDAYS = require("../../handler/holidays");
const Holiday = require("../../models/admin/Holiday");
const { getMonthlyAttendance } = require("../../handler/attendanceService");

const addAttendance = async (req, res) => {
  try {
    const students = req.body.students;
    const date = req.body.date;

    // =====================================================
    // Validate students
    // =====================================================

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "Students are required",
      });
    }

    // =====================================================
    // Format date
    // =====================================================

    const formattedDate = date ? new Date(date) : new Date();
    if (formattedDate > new Date()) {
      return res.status(400).json({
        message: "You cannot add attendance for a future date.",
      });
    }

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    if (formattedDate < fiveDaysAgo) {
      return res.status(400).json({
        message:
          "Attendance can only be added for today or the previous 5 days.",
      });
    }

    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    // =====================================================
    // Get YYYY-MM-DD
    // =====================================================

    const year = formattedDate.getFullYear();

    const month = String(formattedDate.getMonth() + 1).padStart(2, "0");

    const day = String(formattedDate.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    // =====================================================
    // Check weekly holiday
    // =====================================================

    const dayOfWeek = formattedDate.getDay();

    if (WEEKLY_HOLIDAYS.includes(dayOfWeek)) {
      return res.status(400).json({
        message: "Attendance cannot be added. This is a weekly holiday.",
        isHoliday: true,
        holiday: {
          date: dateString,
          name: "Weekly Holiday",
          type: "weekly",
        },
      });
    }

    // =====================================================
    // Check holiday from database
    // =====================================================

    const holiday = await Holiday.findOne({
      date: dateString,
      isActive: true,
    });

    if (holiday) {
      return res.status(400).json({
        message: `Attendance cannot be added. ${holiday.name} is a holiday.`,
        isHoliday: true,
        holiday,
      });
    }

    // =====================================================
    // Start / End of attendance date
    // =====================================================

    const startOfDay = new Date(formattedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(formattedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // =====================================================
    // Add / Update attendance
    // =====================================================

    for (const student of students) {
      const { studentId, status, reason } = student;

      // -------------------------------------------------
      // Student ID
      // -------------------------------------------------

      if (!studentId) {
        return res.status(400).json({
          message: "Student ID is required",
        });
      }

      // -------------------------------------------------
      // Status
      // -------------------------------------------------

      if (!status) {
        return res.status(400).json({
          message: "Status is required",
        });
      }

      const statusEnum = ["present", "absent", "late", "early_out", "leave"];

      if (!statusEnum.includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      // -------------------------------------------------
      // Leave reason
      // -------------------------------------------------

      if (status === "leave" && !reason) {
        return res.status(400).json({
          message: "Reason is required",
        });
      }

      // -------------------------------------------------
      // Check existing attendance
      // -------------------------------------------------

      const isExist = await Attendance.findOne({
        studentId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      // -------------------------------------------------
      // Create attendance
      // -------------------------------------------------

      if (!isExist) {
        await Attendance.create({
          studentId,
          date: formattedDate,
          status,
          reason,
        });
      }

      // -------------------------------------------------
      // Update attendance
      // -------------------------------------------------
      else {
        isExist.status = status;
        isExist.reason = reason;

        await isExist.save();
      }
    }

    // =====================================================
    // Success
    // =====================================================

    return res.status(200).json({
      message: "Attendance added successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    if (!classId)
      return res.status(400).json({ message: "Class ID is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });
    const studentIds = await Student.distinct("_id", { classId });
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const attendance = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("studentId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Attendance.countDocuments({
      studentId: { $in: studentIds },
      date: { $gte: startDate, $lte: endDate },
    });
    return res.status(200).json({
      message: "Attendance fetched successfully",
      attendance,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { attendanceId, status, reason } = req.body;
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance)
      return res.status(400).json({ message: "Attendance not found" });
    if (status == "leave" && !reason)
      return res.status(400).json({ message: "Reason is required" });
    if (status) attendance.status = status;
    if (reason) attendance.reason = reason;
    await attendance.save();
    return res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { _id } = req.body;
    const attendance = await Attendance.findById(_id);
    if (!attendance)
      return res.status(400).json({ message: "Attendance not found" });
    await attendance.deleteOne();
    return res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const getStudentAttendanceByMonth = async (req, res) => {
  try {
    const { studentId, month, year } = req.query;

    const data = await getMonthlyAttendance({
      studentId,
      month,
      year,
    });

    return res.status(200).json({
      message: "Student attendance fetched successfully",
      ...data,
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getStudentAttendanceByMonth,
  addAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};
