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
        const userData = req.user;
        const classId = userData?.classId || null;
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
                    totalMark: { $sum: '$obtainedMark' },
                    image: { $first: '$student.image' }
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

            // 🔑 MATCH CLASS AFTER STUDENT LOOKUP
            {
                $match: {
                    'student.classId': new mongoose.Types.ObjectId(classId)
                }
            },

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

            // 1️⃣ Total marks per student
            {
                $group: {
                    _id: '$student._id',
                    studentName: { $first: '$student.name' },
                    image: { $first: '$student.image' },
                    classId: { $first: '$class._id' },
                    className: { $first: '$class.name' },
                    totalMark: { $sum: '$obtainedMark' }
                }
            },

            // 2️⃣ Sort by marks
            { $sort: { totalMark: -1 } },

            // 3️⃣ Take only top 3
            { $limit: 3 },

            // 4️⃣ Add rank
            {
                $addFields: {
                    rank: { $add: [{ $indexOfArray: [[1, 2, 3], 1] }, 1] }
                }
            },

            // 5️⃣ Final shape
            {
                $project: {
                    _id: 0,
                    studentId: '$_id',
                    studentName: 1,
                    image: 1,
                    totalMark: 1,
                    rank: { $literal: null }, // fixed below
                    classId: 1,
                    className: 1
                }
            }
        ];



        const classToppersRaw = classId
            ? await Mark.aggregate(pipelineClassToppers)
            : [];

        const classToppers = classToppersRaw.map((item, idx) => ({
            ...item,
            rank: idx + 1
        }));

        return res.status(200).json({ message: 'Top students fetched successfully', topStudents, classToppers:classToppersRaw });
    } catch (error) {
        handleError(error, res);
    }
}
module.exports = { getReports, getToppers }