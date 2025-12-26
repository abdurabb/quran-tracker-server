const { handleError } = require('../../handler/handleError')
const Student = require('../../models/admin/student')
const Mark = require('../../models/teacher/Mark')
const Lesson = require('../../models/admin/lesson')
const LessonType = require('../../models/admin/lessonType')
const Class = require('../../models/admin/class')
const mongoose = require('mongoose')


const getTopStudents = async (req, res) => {
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
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
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
        return res.status(200).json({ message: 'Top students fetched successfully', topStudents });
    } catch (error) {
        handleError(error, res)
    }
}


const getReports = async (req, res) => {
    try {
        const { startDate, endDate, classId, search, sortByLow } = req.query;
        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

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
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchStage.createdAt.$lte = new Date(endDate);
            }
        }


        // Build aggregation pipeline
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

            // Filter by classId if provided
            ...(classId ? [{
                $match: {
                    'student.classId': new mongoose.Types.ObjectId(classId)
                }
            }] : []),

            // Filter by search (student name) if provided
            ...(search ? [{
                $match: {
                    'student.name': { $regex: search, $options: 'i' }
                }
            }] : []),

            // Lookup class information
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
                    totalMark: sortByLow ? -1 : 1
                }
            }
        ];

        // Get total count before pagination
        const countPipeline = [
            ...pipeline,
            { $count: 'total' }
        ];

        const countResult = await Mark.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Add pagination
        pipeline.push(
            { $skip: skip },
            { $limit: limit }
        );

        // Project final fields
        pipeline.push({
            $project: {
                _id: 1,
                studentId: 1,
                name: 1,
                class: 1,
                totalMark: 1
            }
        });

        const marks = await Mark.aggregate(pipeline);

        return res.status(200).json({
            message: 'Reports fetched successfully',
            marks: marks,
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            currentPage: page
        })
    } catch (error) {
        handleError(error, res)
    }
}
const getStudentReports = async (req, res) => {
    try {
        const { studentId, startDate, endDate } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!studentId) return res.status(400).json({ message: 'Student ID is required' });
        const student = await Student.findById(studentId).select('_id name classId').populate('classId', 'name');
        if (!student) return res.status(400).json({ message: 'Student not found' });
        const matchStage = { studentId: new mongoose.Types.ObjectId(studentId) };
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
                matchStage.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchStage.createdAt.$lte = new Date(endDate);
            }
        }
        const reports = await Mark.find(matchStage).skip(skip).limit(limit)
            .select('obtainedMark lessonId createdAt lessonName initialCount typeName initialMark obtainedCount obtainedMark')
        const total = await Mark.countDocuments(matchStage);
        return res.status(200).json({ message: 'Student reports fetched successfully', student: { _id: student._id, name: student.name, class: student.classId.name }, reports, totalPages: Math.ceil(total / limit), totalRecords: total, });
    } catch (error) {
        handleError(error, res)
    }
}


module.exports = {
    getReports, getStudentReports, getTopStudents,
}