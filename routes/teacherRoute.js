const express = require('express')
const router = express.Router()
const { getClasses, getStudents, getStudentDetails, getLessonsAndMarks, addLessonMarks } = require('../controller/teacher/classManagement')
const { getReports,getStudentReports,getTopStudents,updateReport,deleteReport, } = require('../controller/teacher/report')
const { addAttendance, getAttendance, updateAttendance, deleteAttendance } = require('../controller/teacher/attendance')
const { getDashboardData } = require('../controller/teacher/Dashboard')
const { protectTeacher } = require('../middleware/auth')
const { addEducationLevel,getEducationLevelHistory,updateEducationLevelHistory,deleteEducationLevelHistory } = require('../controller/teacher/educationLevel')

router.get('/get-classes', protectTeacher, getClasses)
router.get('/get-students', protectTeacher, getStudents)
router.get('/get-student-details', protectTeacher, getStudentDetails)
router.get('/get-lessons-and-marks', protectTeacher, getLessonsAndMarks)
router.post('/add-mark', protectTeacher, addLessonMarks)
router.get('/get-top-students', protectTeacher, getTopStudents)
router.get('/get-daily-reports', protectTeacher, getReports)
router.get('/get-student-report-details', protectTeacher, getStudentReports)
router.put('/update-report',protectTeacher, updateReport)
router.delete('/delete-report',protectTeacher, deleteReport)
router.get('/get-dashboard-data',protectTeacher, getDashboardData)

// attendance
router.post('/add-attendance',protectTeacher, addAttendance)
router.get('/get-attendance',protectTeacher, getAttendance)
router.put('/update-attendance',protectTeacher, updateAttendance)
router.delete('/delete-attendance',protectTeacher, deleteAttendance)

router.post('/add-education-level',protectTeacher, addEducationLevel)
router.get('/get-education-level-history',protectTeacher, getEducationLevelHistory)
router.put('/update-education-level-history/:id',protectTeacher, updateEducationLevelHistory)
router.delete('/delete-education-level-history/:id',protectTeacher, deleteEducationLevelHistory)


module.exports = router
