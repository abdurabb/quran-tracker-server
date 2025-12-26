const { handleError } = require('../../handler/handleError')
const Class = require('../../models/admin/class')
const Student = require('../../models/admin/student')
const Teacher = require('../../models/admin/teacher')
const Lesson = require('../../models/admin/lesson')


const getDashboardData = async (req, res) => {
    try {
        const totalClasses = await Class.countDocuments();
        const classes = await Class.find({ teacher: req.teacherId })
            .select("_id name description")
            .lean();
        const myTotalClasses = classes.length;
        // extract only ids
        const classIds = classes.map(c => c._id);

        const myTotalStudents = await Student.countDocuments({
            classId: { $in: classIds }
        });
        const totalStudents = await Student.countDocuments({});

        const totalLessons = await Lesson.countDocuments({});
        const totalTeachers = await Teacher.countDocuments({});


        return res.status(200).json({
            message: 'Dashboard data fetched successfully',
            totalClasses,
            classes,
            myTotalClasses,
            totalStudents,
            myTotalStudents,
            totalLessons,
            totalTeachers
        });
    } catch (error) {
        handleError(error, res)
    }
}
module.exports = {
    getDashboardData
}