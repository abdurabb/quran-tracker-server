const express = require('express')
const router = express.Router()
const { getProfile,getAttendance,getClassData } = require('../controller/user/Profile')
const { protectUser, } = require('../middleware/auth')
const { getReports,getToppers } = require('../controller/user/report')


router.get('/get-profile', protectUser, getProfile)
router.get('/get-attendance', protectUser, getAttendance)
router.get('/get-classData', protectUser, getClassData)
router.get('/get-reports', protectUser, getReports)
router.get('/get-toppers', protectUser, getToppers)

module.exports = router
