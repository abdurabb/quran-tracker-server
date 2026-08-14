const mongoose = require("mongoose");
const Education = require("../models/teacher/Education");

const getTotalStudiedJuz = async (studentId) => {
  if (!studentId) {
    throw new Error("Student ID is required");
  }

  const result = await Education.aggregate([
    {
      $match: {
        studentId: new mongoose.Types.ObjectId(studentId),
      },
    },
    {
      $group: {
        _id: null,
        totalStudiedJuz: {
          $sum: {
            $ifNull: ["$juzuCount", 0],
          },
        },
      },
    },
  ]);

  return result[0]?.totalStudiedJuz || 0;
};

module.exports = {
  getTotalStudiedJuz,
};
