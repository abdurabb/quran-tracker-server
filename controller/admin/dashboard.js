const { handleError } = require('../../handler/handleError')
const Student = require('../../models/admin/student')
const Class = require('../../models/admin/class')
const Teacher = require('../../models/admin/teacher')
const Lesson = require('../../models/admin/lesson')


const getDashboardData = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalClasses = await Class.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalLessons = await Lesson.countDocuments({ isDeleted: false });
        const recentlyAddedStudents = await Student.find().select('name email phone image')
        .populate('classId', 'name')
        .sort({ createdAt: -1 }).limit(5);
        const recentlyAddedTeachers = await Teacher.find()
        .select('name email phone image')
        .sort({ createdAt: -1 }).limit(5);

        let teachersData=[]
        for (const teacher of recentlyAddedTeachers) {
            const classAssigned = await Class.find({ teacher: teacher._id }).select('name')
            teachersData.push({
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email, 
                phone: teacher.phone,
                image: teacher.image,
                classAssigned: classAssigned.length,
                classes: classAssigned
            })
        }
        return res.status(200).json({
            message: 'Dashboard data fetched successfully',
            recentlyAddedStudents,
            recentlyAddedTeachers:teachersData,
            totalStudents,
            totalClasses,
            totalTeachers,
            totalLessons
        });
    } catch (error) {
        handleError(error, res);
    }
}


module.exports = { getDashboardData }