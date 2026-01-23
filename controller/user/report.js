const { handleError } = require('../../handler/handleError')
const Report = require('../../models/teacher/Mark')
const Mark = require('../../models/teacher/Mark')
const Class = require('../../models/admin/class')
const mongoose = require('mongoose')


const getReports = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        const userData = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {
            studentId: new mongoose.Types.ObjectId(userData._id),
        }
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        startDate = startDate.setHours(0, 0, 0, 0);
        endDate = endDate.setHours(23, 59, 59, 999);
        if (startDate && endDate) {
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            }
        }
        else {
            if (startDate) {
                startDate = new Date(startDate);
                startDate = startDate.setHours(0, 0, 0, 0);
                query.createdAt = {
                    $gte: startDate
                }
            }
            if (endDate) {
                endDate = new Date(endDate);
                endDate = endDate.setHours(23, 59, 59, 999);
                query.createdAt = {
                    $lte: endDate
                }
            }
            if (!startDate && !endDate) {
                query.createdAt = {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                    $lte: new Date()
                }
            }
        }
        const reports = await Report.find(query).select('lessonName initialCount typeName initialMark obtainedCount obtainedMark createdAt').skip(skip).limit(limit);
        const totalReports = await Report.countDocuments(query);
        return res.status(200).json({ message: 'Reports fetched successfully', reports, totalPages: Math.ceil(totalReports / limit) });
    } catch (error) {
        handleError(error, res);
    }
}


const getToppers = async (req, res) => {
    try {
        const { startDate, endDate, count = 3 } = req.query;
        const matchStage = {};
        if (!startDate && !endDate) {
            // Default case: last 30 days
            const endDateDefault = new Date();
            const startDateDefault = new Date();
            startDateDefault.setDate(startDateDefault.getDate() - 30);
            matchStage.createdAt = {
                $gte: startDateDefault,
                $lte: endDateDefault
            };
        } else {
            // Use provided dates
            matchStage.createdAt = {};
            if (startDate) {
                startDate = new Date(startDate);
                startDate = startDate.setHours(0, 0, 0, 0);
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                endDate = new Date(endDate);
                endDate = endDate.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = new Date(endDate);
            }
        }
        const pipeline = [
            // Match marks based on date filters
            { $match: matchStage },

            // Lookup student information
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },

            // Unwind student array
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: false } },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'student.classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },

            // Unwind class array
            { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },

            // Group by student and sum obtainedMark
            {
                $group: {
                    _id: '$studentId',
                    studentId: { $first: '$studentId' },
                    name: { $first: '$student.name' },
                    class: { $first: '$class.name' },
                    totalMark: { $sum: '$obtainedMark' }
                }
            },

            // Sort by totalMark (descending by default, ascending if sortByLow)
            {
                $sort: {
                    totalMark: -1
                }
            },

            { $limit: Number(count) }
        ];
        const topStudents = await Mark.aggregate(pipeline);

        // class toppers
        const pipelineClassToppers = [
            // Optional date filter (same logic as above if needed)
            { $match: matchStage },

            // Join student
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },

            // Join class
            {
                $lookup: {
                    from: 'classes',
                    localField: 'student.classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            { $unwind: '$class' },

            // 1️⃣ Total marks per student per class
            {
                $group: {
                    _id: {
                        classId: '$class._id',
                        studentId: '$student._id'
                    },
                    studentName: { $first: '$student.name' },
                    className: { $first: '$class.name' },
                    totalMark: { $sum: '$obtainedMark' }
                }
            },

            // 2️⃣ Sort students by marks within class
            {
                $sort: {
                    '_id.classId': 1,
                    totalMark: -1
                }
            },

            // 3️⃣ Pick topper per class
            {
                $group: {
                    _id: '$_id.classId',
                    className: { $first: '$className' },
                    topper: {
                        $first: {
                            studentId: '$_id.studentId',
                            studentName: '$studentName',
                            totalMark: '$totalMark'
                        }
                    }
                }
            },

            // Optional: clean output
            {
                $project: {
                    _id: 0,
                    classId: '$_id',
                    className: 1,
                    topper: 1
                }
            }
        ];

        const classToppers = await Mark.aggregate(pipelineClassToppers);
        return res.status(200).json({ message: 'Top students fetched successfully', topStudents,classToppers });
    } catch (error) {
        handleError(error, res);
    }
}
module.exports = { getReports, getToppers }