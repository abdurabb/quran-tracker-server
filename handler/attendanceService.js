// services/attendance/getMonthlyAttendance.js

const mongoose = require("mongoose");
const Attendance = require("../models/teacher/Attendance");

const getMonthlyAttendance = async ({ studentId, year, month }) => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student ID");
  }

  year = Number(year);
  month = Number(month);

  if (!year || !month) {
    throw new Error("Month and year are required");
  }

  if (month < 1 || month > 12) {
    throw new Error("Invalid month");
  }

  // --------------------------------
  // Date range
  // --------------------------------

  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 1);

  // --------------------------------
  // Attendance query
  // --------------------------------

  const query = {
    studentId: new mongoose.Types.ObjectId(studentId),

    date: {
      $gte: startDate,
      $lt: endDate,
    },
  };

  // --------------------------------
  // Attendance
  // --------------------------------

  const attendanceData = await Attendance.find(query)
    .select("date status reason")
    .sort({ date: 1 })
    .lean();

  // --------------------------------
  // Attendance totals
  // --------------------------------
  const totalLate = attendanceData.filter(
    (item) => item.status === "late",
  ).length;

  // Normalize status before counting
  const totalPresent = attendanceData.filter(
    (item) =>
      String(item.status || "")
        .trim()
        .toLowerCase() === "present",
  ).length;

  const totalAbsent = attendanceData.filter(
    (item) =>
      String(item.status || "")
        .trim()
        .toLowerCase() === "absent",
  ).length;

  const totalLeave = attendanceData.filter(
    (item) =>
      String(item.status || "")
        .trim()
        .toLowerCase() === "leave",
  ).length;

  const totalEarlyOut = attendanceData.filter(
    (item) =>
      String(item.status || "")
        .trim()
        .toLowerCase() === "early_out",
  ).length;

  // --------------------------------
  // Response
  // --------------------------------

  return {
    message: "Attendance fetched successfully",

    attendanceData,

    totalPresent,
    totalAbsent,
    totalLate,
    totalEarlyOut,
    totalLeave,
  };
};

module.exports = {
  getMonthlyAttendance,
};
