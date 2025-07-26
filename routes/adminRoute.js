const express = require('express')
const router = express.Router()

const { adminLogin } = require('../controller/admin/auth')
const { addClass, updateClass, getClasses, deleteClass, getAllClasses, assignATeacher, addStudents } = require('../controller/admin/class')
const { addTeacher, updateTeacher, getTeachers, getTeacherDetails, deleteTeachers, getAllTeachers, assignAClass } = require('../controller/admin/teacher')
const { addStudent, updateStudent, getStudents, getStudentDetails, deleteStudent, assignClassFotStudent } = require('../controller/admin/student')
const { protectAdmin } = require('../middleware/auth')




// auth
router.post('/login', adminLogin)

// class
router.post('/add-class', protectAdmin, addClass)
router.post('/update-class', protectAdmin, updateClass)
router.get('/get-classes', protectAdmin, getClasses)
router.post('/delete-class', protectAdmin, deleteClass)
router.get('/get-all-classes', protectAdmin, getAllClasses)
router.post('/assign-a-teacher', protectAdmin, assignATeacher)
router.post('/add-students', protectAdmin, addStudents)

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
router.get('/get-student-details', protectAdmin, getStudentDetails)
router.post('/delete-students', protectAdmin, deleteStudent)
router.post('/assign-a-class-for-student', protectAdmin, assignClassFotStudent)


// lessons and marks


// daily reports


// monthly toper







module.exports = router
