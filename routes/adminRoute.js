const express = require('express')
const router = express.Router()

const { adminLogin,crone } = require('../controller/admin/auth')
const { addClass, updateClass, getClasses, deleteClass, getAllClasses, assignATeacher, addStudents,removeTeacher } = require('../controller/admin/class')
const { addTeacher, updateTeacher, getTeachers, getTeacherDetails, deleteTeachers, getAllTeachers, assignAClass } = require('../controller/admin/teacher')
const { addStudent, updateStudent, getStudents,getStudentsFilteredByClass, getStudentDetails, deleteStudent, assignClassFotStudent } = require('../controller/admin/student')
const { protectAdmin } = require('../middleware/auth')
const { addLesson, updateLesson, getLessons, deleteLessons, getLessonTypes, addLessonType, updateLessonType, deleteLessonType } = require('../controller/admin/lessonsAndMarks')
const { getTopStudents, getReports, getStudentReports } = require('../controller/admin/report')
const { getAttendance } = require('../controller/admin/attendance')
const { getDashboardData } = require('../controller/admin/dashboard')



// auth
router.post('/login', adminLogin)
router.get('/crone', crone)
// class
router.post('/add-class', protectAdmin, addClass)
router.post('/update-class', protectAdmin, updateClass)
router.get('/get-classes', protectAdmin, getClasses)
router.post('/delete-class', protectAdmin, deleteClass)
router.get('/get-all-classes', protectAdmin, getAllClasses)
router.post('/assign-a-teacher', protectAdmin, assignATeacher)
router.post('/add-students', protectAdmin, addStudents)
router.post('/remove-teacher',protectAdmin, removeTeacher)

// teachers
router.post('/add-teacher', protectAdmin, addTeacher)
router.post('/update-teacher', protectAdmin, updateTeacher)
router.get('/get-teachers', protectAdmin, getTeachers)
router.get('/get-teacher-details', protectAdmin, getTeacherDetails)
router.post('/delete-teachers', protectAdmin, deleteTeachers)
router.get('/get-all-teachers', protectAdmin, getAllTeachers)
router.post('/assign-a-class', protectAdmin, assignAClass)

// students
router.post('/add-student', protectAdmin, addStudent)
router.post('/update-student', protectAdmin, updateStudent)
router.get('/get-students', protectAdmin, getStudents)
router.get('/get-students-filtered-by-class', protectAdmin, getStudentsFilteredByClass)
router.get('/get-student-details', protectAdmin, getStudentDetails)
router.post('/delete-students', protectAdmin, deleteStudent)
router.post('/assign-a-class-for-student', protectAdmin, assignClassFotStudent)


// lessons and marks
router.post('/add-lesson', protectAdmin, addLesson)
router.post('/update-lesson', protectAdmin, updateLesson)
router.get('/get-lessons', protectAdmin, getLessons)
router.post('/delete-lesson', protectAdmin, deleteLessons)
router.get('/get-lesson-types', protectAdmin, getLessonTypes)
router.post('/add-lesson-type', protectAdmin, addLessonType)
router.post('/update-lesson-type', protectAdmin, updateLessonType)
router.post('/delete-lesson-type', protectAdmin, deleteLessonType)




// daily reports
router.get('/get-top-students', protectAdmin, getTopStudents)
router.get('/get-daily-reports', protectAdmin, getReports)
router.get('/get-student-report-details', protectAdmin, getStudentReports)

// attendance
router.get('/get-attendance',protectAdmin, getAttendance)


// dashboard
router.get('/get-dashboard-data',protectAdmin, getDashboardData)






module.exports = router
