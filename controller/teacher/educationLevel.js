const { handleError } = require("../../handler/handleError");
const Education = require("../../models/teacher/Education");
const Student = require("../../models/admin/student");
const { getTotalStudiedJuz } = require("../../handler/educationUtils");

const addEducationLevel = async (req, res) => {
  try {
    const {
      juzuCompleted,
      juzuCount,
      lineCount,
      month,
      pageCount,
      studentId,
      juzuDetails,
      year,
    } = req.body;
    if (!studentId)
      return res.status(400).json({ message: "Student ID is required" });
    if (!year) return res.status(400).json({ message: "Year is required" });
    if (!month) return res.status(400).json({ message: "Month is required" });
    if (!pageCount)
      return res.status(400).json({ message: "Page Count is required" });
    if (juzuCompleted == undefined || juzuCompleted == null)
      return res.status(400).json({ message: "Juzu Completed is required" });
    if (juzuCompleted == true && !juzuCount)
      return res.status(400).json({ message: "Juzu Count is required" });
    const isExist = await Education.findOne({ studentId, month, year });
    if (isExist) {
      return res
        .status(400)
        .json({ message: "Educatioin Level Already Added for this student" });
    }
    if (juzuCompleted === false && juzuCount !== 0 && juzuCount !== null) {
      return res.status(400).json({ message: "Juzu Count should be 0" });
    }
    if (juzuCount > 0 && (!juzuDetails || juzuDetails.length == 0))
      return res.status(400).json({ message: "Juzu Details are required" });
    if (juzuCount > 0 && juzuDetails.length > 0) {
      for (const detail of juzuDetails) {
        if (!detail.juzNumber)
          return res.status(400).json({ message: "Juzu Number is required" });
        if (!detail.juzName)
          return res.status(400).json({ message: "Juzu Name is required" });
        if (!detail.howManyDays)
          return res.status(400).json({ message: "How Many Days is required" });
      }
    }
    await Education.create({
      juzuCompleted,
      juzuCount,
      lineCount,
      month,
      pageCount,
      studentId,
      year,
      juzuDetails,
    });
    return res
      .status(201)
      .json({ message: "Education Level added successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const getEducationLevelHistory = async (req, res) => {
  try {
    let { studentId, year, month } = req.query;
    if (!studentId)
      return res.status(400).json({ message: "Student ID is required" });
    const student = await Student.findById(studentId).select("-password");
    if (!student) {
      return res.status(400).json({ message: "Student not fount" });
    }
    if (!year) return res.status(400).json({ message: "Year is required" });
    if (!month) return res.status(400).json({ message: "Month is required" });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    month = parseInt(month);
    year = parseInt(year);
    let query = {
      studentId,
      year,
      month,
    };
    const educationLevelHistory = await Education.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Education.countDocuments(query);
    const studiedFromCenter = student?.previousStudy?.juzDetails?.length || 0;
    const totalStudied =
      (await getTotalStudiedJuz(studentId)) + studiedFromCenter;
    return res.status(200).json({
      message: "Education Level History fetched successfully",
      educationLevelHistory,
      previousStudy: student?.previousStudy,
      studiedFromCenter,
      totalStudied: totalStudied,
      remining: Math.max(30 - totalStudied, 0),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const updateEducationLevelHistory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const educationLevelHistory = await Education.findById(id);
    if (!educationLevelHistory)
      return res
        .status(400)
        .json({ message: "Education Level History not found" });
    const {
      juzuCompleted,
      juzuCount,
      lineCount,
      month,
      pageCount,
      juzuDetails,
      year,
    } = req.body;
    if (juzuCompleted) educationLevelHistory.juzuCompleted = juzuCompleted;
    if (juzuCount) educationLevelHistory.juzuCount = juzuCount;
    if (lineCount) educationLevelHistory.lineCount = lineCount;
    if (month) educationLevelHistory.month = month;
    if (pageCount) educationLevelHistory.pageCount = pageCount;
    if (juzuDetails) educationLevelHistory.juzuDetails = juzuDetails;
    if (year) educationLevelHistory.year = year;
    await educationLevelHistory.save();
    return res
      .status(200)
      .json({ message: "Education Level History updated successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const deleteEducationLevelHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const educationLevelHistory = await Education.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Education Level History deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  addEducationLevel,
  getEducationLevelHistory,
  updateEducationLevelHistory,
  deleteEducationLevelHistory,
};
