const express = require("express");
const router = express.Router();
const {
  getProfile,
  getAttendance,
  getClassData,
  getAttendanceByMonth,
} = require("../controller/user/Profile");
const { protectUser } = require("../middleware/auth");
const { getReports, getToppers } = require("../controller/user/report");
const {
  getEducationLevel,
  getEducationLevelGraph,
} = require("../controller/user/educationLevel");
const { getHolidaysByMonth } = require("../handler/getHolidayByMonth");

router.get("/get-profile", protectUser, getProfile);
router.get("/get-attendance", protectUser, getAttendance);
router.get("/get-attendance-by-month", protectUser, getAttendanceByMonth);
router.get("/get-classData", protectUser, getClassData);
router.get("/get-reports", protectUser, getReports);
router.get("/get-toppers", protectUser, getToppers);
router.get("/get-educaiton-level", protectUser, getEducationLevel);
router.get("/get-educaiton-level-graph", protectUser, getEducationLevelGraph);

router.get("/get-holiday", protectUser, getHolidaysByMonth);

module.exports = router;
