const { handleError } = require("../../handler/handleError");
const Report = require("../../models/teacher/Mark");
const Mark = require("../../models/teacher/Mark");
const Class = require("../../models/admin/class");
const mongoose = require("mongoose");

const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userData = req.user;

    const query = {
      studentId: new mongoose.Types.ObjectId(userData._id),
    };

    // Date filtering
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      query.createdAt = {
        $gte: start,
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        ...(query.createdAt || {}),
        $lte: end,
      };
    }

    // Default: last 30 days
    if (!startDate && !endDate) {
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 30);
      defaultStart.setHours(0, 0, 0, 0);

      const defaultEnd = new Date();
      defaultEnd.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: defaultStart,
        $lte: defaultEnd,
      };
    }

    const result = await Report.aggregate([
      // 1. Filter first
      {
        $match: query,
      },

      // 2. Sort reports by newest first
      {
        $sort: {
          createdAt: -1,
        },
      },

      // 3. Group reports by date
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          reports: {
            $push: {
              _id: "$_id",
              lessonName: "$lessonName",
              initialCount: "$initialCount",
              typeName: "$typeName",
              initialMark: "$initialMark",
              obtainedCount: "$obtainedCount",
              obtainedMark: "$obtainedMark",
              createdAt: "$createdAt",
            },
          },
        },
      },

      // 4. Sort grouped dates
      {
        $sort: {
          _id: -1,
        },
      },

      // 5. Get total number of dates
      {
        $facet: {
          data: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],

          total: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const groupedReports = result[0]?.data || [];
    const totalRecords = result[0]?.total[0]?.count || 0;

    const reports = groupedReports.map((item) => ({
      date: item._id,
      reports: item.reports,
    }));

    return res.status(200).json({
      message: "Reports fetched successfully",
      reports,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      currentPage: page,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getToppers = async (req, res) => {
  try {
    let { startDate, endDate, count = 3 } = req.query;
    const userData = req.user;
    const classId = userData?.classId || null;
    let matchStage = {};
    if (!startDate && !endDate) {
      // Default case: last 30 days
      const endDateDefault = new Date();
      const startDateDefault = new Date();
      startDateDefault.setDate(startDateDefault.getDate() - 30);
      matchStage.createdAt = {
        $gte: startDateDefault,
        $lte: endDateDefault,
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
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },

      // Unwind student array
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "classes",
          localField: "student.classId",
          foreignField: "_id",
          as: "class",
        },
      },

      // Unwind class array
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },

      // Group by student and sum obtainedMark
      {
        $group: {
          _id: "$studentId",
          studentId: { $first: "$studentId" },
          name: { $first: "$student.name" },
          class: { $first: "$class.name" },
          totalMark: { $sum: "$obtainedMark" },
          image: { $first: "$student.image" },
        },
      },

      // Sort by totalMark (descending by default, ascending if sortByLow)
      {
        $sort: {
          totalMark: -1,
        },
      },

      { $limit: Number(count) },
    ];
    const topStudents = await Mark.aggregate(pipeline);

    // class toppers - get top student from each class
    // class toppers
    const pipelineClassToppers = [
      { $match: matchStage },

      // Join student
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },

      // 🔑 MATCH CLASS AFTER STUDENT LOOKUP
      {
        $match: {
          "student.classId": new mongoose.Types.ObjectId(classId),
        },
      },

      // Join class
      {
        $lookup: {
          from: "classes",
          localField: "student.classId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: "$class" },

      // 1️⃣ Total marks per student
      {
        $group: {
          _id: "$student._id",
          studentName: { $first: "$student.name" },
          image: { $first: "$student.image" },
          classId: { $first: "$class._id" },
          className: { $first: "$class.name" },
          totalMark: { $sum: "$obtainedMark" },
        },
      },

      // 2️⃣ Sort by marks
      { $sort: { totalMark: -1 } },

      // 3️⃣ Take only top 3
      { $limit: 3 },

      // 4️⃣ Add rank
      {
        $addFields: {
          rank: { $add: [{ $indexOfArray: [[1, 2, 3], 1] }, 1] },
        },
      },

      // 5️⃣ Final shape
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          studentName: 1,
          image: 1,
          totalMark: 1,
          rank: { $literal: null }, // fixed below
          classId: 1,
          className: 1,
        },
      },
    ];

    const classToppersRaw = classId
      ? await Mark.aggregate(pipelineClassToppers)
      : [];
    return res.status(200).json({
      message: "Top students fetched successfully",
      topStudents,
      classToppers: classToppersRaw,
    });
  } catch (error) {
    console.log(error);
    handleError(error, res);
  }
};
module.exports = { getReports, getToppers };
