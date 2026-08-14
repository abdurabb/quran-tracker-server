const { handleError } = require("../../handler/handleError");
const EducationLevel = require("../../models//teacher/Education");
const mongoose = require("mongoose");
const { getTotalStudiedJuz } = require("../../handler/educationUtils");

const getEducationLevel = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userData = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {
      studentId: new mongoose.Types.ObjectId(userData._id),
    };

    if (month) {
      query.month = Number(month);
    }

    if (year) {
      query.year = Number(year);
    }

    const edicationLevel = await EducationLevel.find(query)
      .sort({ createdAt: -1 })
      .select(
        "juzuCompleted juzuCount lineCount month pageCount year juzuDetails",
      )
      .skip(skip)
      .limit(limit);

    const total = await EducationLevel.countDocuments(query);

    return res.status(200).json({
      message: "Education Level fetched successfully",
      edicationLevel,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getEducationLevelGraph = async (req, res) => {
  try {
    const { monthGraph, yearGraph, year } = req.query;
    const userData = req.user;

    const studentId = new mongoose.Types.ObjectId(userData._id);

    // 13 lines = 1 page
    const LINES_PER_PAGE = 15;

    // =========================
    // Monthly Graph
    // =========================
    if (monthGraph) {
      const selectedYear = Number(year) || new Date().getFullYear();

      const monthlyData = await EducationLevel.aggregate([
        {
          $match: {
            studentId,
            year: selectedYear,
          },
        },
        {
          $group: {
            _id: "$month",

            totalPages: {
              $sum: "$pageCount",
            },

            totalLines: {
              $sum: "$lineCount",
            },
          },
        },
        {
          $project: {
            _id: 1,

            // Convert lines into page equivalent
            value: {
              $add: [
                "$totalPages",
                {
                  $divide: ["$totalLines", LINES_PER_PAGE],
                },
              ],
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      // Always return all 12 months
      const months = [
        { month: 1, label: "Jan", value: 0 },
        { month: 2, label: "Feb", value: 0 },
        { month: 3, label: "Mar", value: 0 },
        { month: 4, label: "Apr", value: 0 },
        { month: 5, label: "May", value: 0 },
        { month: 6, label: "Jun", value: 0 },
        { month: 7, label: "Jul", value: 0 },
        { month: 8, label: "Aug", value: 0 },
        { month: 9, label: "Sep", value: 0 },
        { month: 10, label: "Oct", value: 0 },
        { month: 11, label: "Nov", value: 0 },
        { month: 12, label: "Dec", value: 0 },
      ];

      monthlyData.forEach((item) => {
        const month = months.find((m) => m.month === item._id);

        if (month) {
          month.value = Number(item.value.toFixed(2));
        }
      });
      const totalStudied = await getTotalStudiedJuz(studentId);
      return res.status(200).json({
        message: "Monthly learning graph data fetched successfully",
        year: selectedYear,
        data: months,
        totalStudied,
        remining: Math.max(30 - totalStudied, 0),
      });
    }

    // =========================
    // Yearly Graph
    // =========================
    if (yearGraph) {
      const yearlyData = await EducationLevel.aggregate([
        {
          $match: {
            studentId,
          },
        },
        {
          $group: {
            _id: "$year",

            totalPages: {
              $sum: "$pageCount",
            },

            totalLines: {
              $sum: "$lineCount",
            },
          },
        },
        {
          $project: {
            _id: 1,
            value: {
              $add: [
                "$totalPages",
                {
                  $divide: ["$totalLines", LINES_PER_PAGE],
                },
              ],
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ]);

      const data = yearlyData.map((item) => ({
        year: item._id,
        value: Number(item.value.toFixed(2)),
      }));
      const totalStudied = await getTotalStudiedJuz(studentId);
      return res.status(200).json({
        message: "Yearly learning graph data fetched successfully",
        data,
        totalStudied,
        remining: Math.max(30 - totalStudied, 0),
      });
    }

    return res.status(400).json({
      message: "Please provide monthGraph or yearGraph",
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getEducationLevel,
  getEducationLevelGraph,
};
