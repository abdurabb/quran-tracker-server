const Class = require("../../models/admin/class");
const Student = require("../../models/admin/student");
const Lesson = require("../../models/admin/lesson");
const LessonType = require("../../models/admin/lessonType");
const Mark = require("../../models/teacher/Mark");
const { handleError } = require("../../handler/handleError");
const getClasses = async (req, res) => {
  try {
    let query = { teacher: req.teacherId };
    if (req.query.search) {
      query.name = { $regex: new RegExp(req.query.search, "i") };
    }
    const totalClasses = await Class.countDocuments();
    const assignedClasses = await Class.find({
      teacher: req.teacherId,
    }).countDocuments();
    const classes = await Class.find(query)
      .select("name description teacher")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ classes, totalClasses, assignedClasses });
  } catch (error) {
    handleError(error, res);
  }
};

const getStudents = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 20;
    let skip = (page - 1) * limit;
    let query = {};
    if (req.query.classId) {
      query.classId = req.query.classId;
    }
    if (req.query.search && req.query.search.trim()) {
      query.name = { $regex: new RegExp(req.query.search, "i") };
    }
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .select("name email dialCode phone image classId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.status(200).json({
      message: "Students fetched successfully",
      students,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getStudentDetails = async (req, res) => {
  try {
    if (!req.query.studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    const student = await Student.findById(req.query.studentId)
      .populate("classId", "name description teacher")
      .populate("branch", "name")
      .select("-password");
    // .select('name email dialCode phone image classId,branch, fatherName,motherName,motherDialCode,motherPhone,admissionDate,address,gender,dob').lean()
    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }
    res
      .status(200)
      .json({ message: "Student details fetched successfully", student });
  } catch (error) {
    handleError(error, res);
  }
};

const getLessonsAndMarks = async (req, res) => {
  try {
    let query = { isDeleted: false };
    const lessons = await Lesson.find(query)
      .select("name lessonType criteriaNumber description mark")
      .sort({ createdAt: -1 })
      .lean();
    let data = [];
    for (const lesson of lessons) {
      if (lesson?.lessonType) {
        let lessonType = await LessonType.findById(lesson?.lessonType)
          .select("name")
          .lean();
        data.push({ ...lesson, lessonType: lessonType?.name });
      } else {
        data.push({ ...lesson, lessonType: null });
      }
    }
    return res
      .status(200)
      .json({ message: "Lessons fetched successfully", lessons: data });
  } catch (error) {
    handleError(error, res);
  }
};

const addLessonMarks = async (req, res) => {
  try {
    const { studentId, lessons, date } = req.body;

    let markDate = null;

    if (date) {
      // date comes as: "2026-08-06"
      markDate = new Date(`${date}T00:00:00.000Z`);

      if (isNaN(markDate.getTime())) {
        return res.status(400).json({
          message: "Invalid date",
        });
      }
    }

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ message: "Lessons array is required" });
    }

    const student = await Student.findById(studentId)
      .populate("classId", "teacher")
      .select("classId")
      .lean();

    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }

    if (student?.classId?.teacher?.toString() !== req.teacherId?.toString()) {
      return res.status(400).json({
        message: "You are not authorized to add marks for this student",
      });
    }

    const marksData = [];

    for (const item of lessons) {
      const { lessonId, typeCount } = item;
      if (!lessonId) {
        return res.status(400).json({
          message: "Lesson ID is required",
        });
      }
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(400).json({
          message: `Lesson not found: ${lessonId}`,
        });
      }
      if (lesson.isDeleted === true) {
        return res.status(400).json({
          message: `Lesson ${lesson.name} is not available`,
        });
      }
      let lessonTypeName = "";
      if (lesson.lessonType) {
        if (!typeCount) {
          return res.status(400).json({
            message: `Type Count is required for ${lesson.name}`,
          });
        }

        const lessonType = await LessonType.findById(lesson.lessonType)
          .select("name")
          .lean();

        lessonTypeName = lessonType?.name || "";
      } else {
        lessonTypeName = "Fixed Marks";
      }
      let obtainedMark = 0;
      if (lesson.isFixedMarks === true) {
        obtainedMark = lesson.mark;
      } else {
        obtainedMark = (lesson.mark / lesson.criteriaNumber) * typeCount;
      }
      marksData.push({
        lessonId,
        studentId,
        lessonTypeId: lesson.lessonType,
        lessonName: lesson.name,
        initialCount: lesson.criteriaNumber,
        typeName: lessonTypeName,
        initialMark: lesson.mark,
        obtainedCount: typeCount || 0,
        obtainedMark,
        // Only override timestamps when a date was provided
        ...(markDate
          ? {
              createdAt: markDate,
              updatedAt: markDate,
            }
          : {}),
      });
    }
    await Mark.insertMany(marksData);
    return res.status(200).json({
      message: "Lesson marks added successfully",
      count: marksData.length,
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getClasses,
  getStudents,
  getStudentDetails,
  getLessonsAndMarks,
  addLessonMarks,
};
