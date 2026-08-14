const { handleError } = require("../../handler/handleError");
const Class = require("../../models/admin/class");
const Attendance = require("../../models/teacher/Attendance");
const Branch = require("../../models/admin/branch");
const Holiday = require("../../models/admin/Holiday");
const WEEKLY_HOLIDAYS = require("../../handler/holidays");
const mongoose = require("mongoose");
const getProfile = async (req, res) => {
  try {
    const userData = req.user;
    const classData = await Class.findById(userData.classId).select("name");
    const branchData = await Branch.findById(userData?.branch).select("name");
    return res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        ...userData._doc,
        class: classData?.name,
        branch: branchData?.name,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

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
    };
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    startDate = startDate.setHours(0, 0, 0, 0);
    endDate = endDate.setHours(23, 59, 59, 999);
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      query.date = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        $lte: new Date(),
      };
    }
    const attendanceData = await Attendance.find(query)
      .select("date status reason")
      .skip(skip)
      .limit(limit);
    const totalAttendance = await Attendance.countDocuments(query);
    return res.status(200).json({
      message: "Attendance fetched successfully",
      attendanceData,
      totalPages: Math.ceil(totalAttendance / limit),
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getAttendanceByMonth = async (req, res) => {
  try {
    let { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required",
      });
    }

    month = parseInt(month);
    year = parseInt(year);

    if (month < 1 || month > 12) {
      return res.status(400).json({
        message: "Invalid month",
      });
    }

    // --------------------------------
    // Date range
    // --------------------------------

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // --------------------------------
    // Attendance
    // --------------------------------

    const query = {
      studentId: new mongoose.Types.ObjectId(req?.userId),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const attendanceData = await Attendance.find(query)
      .select("date status reason")
      .lean();

    // --------------------------------
    // Get special holidays from DB
    // --------------------------------

    const startDateString = `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const endDateString = `${nextYear}-${String(nextMonth).padStart(
      2,
      "0",
    )}-01`;

    const specialHolidays = await Holiday.find({
      date: {
        $gte: startDateString,
        $lt: endDateString,
      },
      isActive: true,
    })
      .select("date")
      .lean();

    // --------------------------------
    // Create holiday date Set
    // --------------------------------

    const holidayDates = new Set();

    // Special holidays
    specialHolidays.forEach((holiday) => {
      const date = new Date(holiday.date);

      const formattedDate =
        `${date.getFullYear()}-` +
        `${String(date.getMonth() + 1).padStart(2, "0")}-` +
        `${String(date.getDate()).padStart(2, "0")}`;

      holidayDates.add(formattedDate);
    });

    // --------------------------------
    // Weekly holidays
    // --------------------------------

    const current = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    while (current <= lastDay) {
      const day = current.getDay();

      if (WEEKLY_HOLIDAYS.includes(day)) {
        const formattedDate =
          `${current.getFullYear()}-` +
          `${String(current.getMonth() + 1).padStart(2, "0")}-` +
          `${String(current.getDate()).padStart(2, "0")}`;

        holidayDates.add(formattedDate);
      }

      current.setDate(current.getDate() + 1);
    }

    // --------------------------------
    // Remove holiday attendance records
    // --------------------------------

    const workingDayAttendance = attendanceData.filter((item) => {
      if (!item.date) return false;

      const date = new Date(item.date);

      const formattedDate =
        `${date.getFullYear()}-` +
        `${String(date.getMonth() + 1).padStart(2, "0")}-` +
        `${String(date.getDate()).padStart(2, "0")}`;

      return !holidayDates.has(formattedDate);
    });

    // --------------------------------
    // Attendance totals
    // --------------------------------

    const totalPresent = workingDayAttendance.filter(
      (item) => item.status === "present",
    ).length;

    const totalAbsent = workingDayAttendance.filter(
      (item) => item.status === "absent",
    ).length;

    const totalLate = workingDayAttendance.filter(
      (item) => item.status === "late",
    ).length;

    const totalEarlyOut = workingDayAttendance.filter(
      (item) => item.status === "early_out",
    ).length;

    const totalLeave = workingDayAttendance.filter(
      (item) => item.status === "leave",
    ).length;

    // --------------------------------
    // Response
    // --------------------------------

    return res.status(200).json({
      message: "Attendance fetched successfully",

      // Only working-day attendance
      attendanceData: workingDayAttendance,

      totalPresent,
      totalAbsent,
      totalLate,
      totalEarlyOut,
      totalLeave,

      // Optional: useful for frontend
      totalHolidays: holidayDates.size,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getClassData = async (req, res) => {
  try {
    const userData = req.user;
    const classData = await Class.findById(userData.classId).populate(
      "teacher",
      "name image email phone dialCode address experience",
    );

    return res
      .status(200)
      .json({ message: "Class data fetched successfully", classData });
  } catch (error) {
    handleError(error, res);
  }
};
module.exports = {
  getProfile,
  getAttendance,
  getClassData,
  getAttendanceByMonth,
};
