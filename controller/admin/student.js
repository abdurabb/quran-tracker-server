const { handleError } = require("../../handler/handleError");
const Class = require("../../models/admin/class");
const Teacher = require("../../models/admin/teacher");
const Admin = require("../../models/admin/adminSchema");
const Student = require("../../models/admin/student");
const mongoose = require("mongoose");
const Branch = require("../../models/admin/branch");
const Attendance = require("../../models/teacher/Attendance");
const Report = require("../../models/teacher/Mark");
const EducationLevel = require("../../models/teacher/Education");
const { hashPassword } = require("../../handler/password");
const { getTotalStudiedJuz } = require("../../handler/educationUtils");

const addStudent = async (req, res) => {
  try {
    let { email, classId, branch, previousStudy } = req?.body;
    const existingStudent = await Student.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });
    if (existingStudent) {
      return res.status(400).json({
        message: "Students already exists with this email",
      });
    }
    const existingTeacher = await Teacher.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });
    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher already exists with this email",
      });
    }
    const existingAdmin = await Admin.findOne({
      email: new RegExp(`^${email}$`, "i"),
    });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists with this email",
      });
    }
    if (!branch) {
      return res
        .status(400)
        .json({ message: "Branch is Required", error: "Branch is required" });
    }
    const findBranch = await Branch.findById(branch);
    if (!findBranch) {
      return res
        .status(400)
        .json({ message: "Branch not Found", error: "Branch not Found" });
    }
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      classId = null;
    }
    if (classId) {
      const findClass = await Class.findById(classId);
      if (!findClass) {
        return res
          .status(400)
          .json({ message: "Class Not Found", error: "Class Not Found" });
      }
    }
    // Previous study validation
    const previousStudyResult = previousStudyValidation(previousStudy);

    if (!previousStudyResult.valid) {
      return res.status(400).json({
        message: previousStudyResult.message,
      });
    }
    await Student.create({
      ...req?.body,
      password: await hashPassword(req?.body?.password),
      dob: new Date(req?.body?.dob),
      admissionDate: new Date(req?.body?.admissionDate),
      classId,
      previousStudy: previousStudyResult.data,
    });

    return res.status(201).json({ message: "Student created successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const updateStudent = async (req, res) => {
  try {
    const {
      _id,
      name,
      image,
      email,
      password,
      dialCode,
      phone,
      dob,
      admissionDate,
      address,
      gender,
      classId,
      fatherName,
      branch,
      motherName,
      motherDialCode,
      motherPhone,
      previousStudy,
    } = req?.body;
    if (!_id) {
      return res.status(400).json({ message: "_id is required" });
    }
    const students = await Student.findById(_id);
    if (!students) {
      return res.status(400).json({ message: "data not fount" });
    }

    if (name) students.name = name;
    if (image) students.image = image;
    if (email) {
      const existingStudent = await Student.findOne({
        _id: { $ne: _id },
        email: new RegExp(`^${email}$`, "i"),
      });
      if (existingStudent)
        return res
          .status(400)
          .json({ message: "Teacher already exists with this email" });
      students.email = email;
    }
    if (password) {
      // students.password = password;
      students.password = await hashPassword(password);
    }
    if (dob) students.dob = new Date(dob);
    if (admissionDate) students.admissionDate = new Date(admissionDate);
    if (dialCode) students.dialCode = dialCode;
    if (phone) {
      // const existingStudent = await Student.findOne({ _id: { $ne: _id }, phone })
      // if (existingStudent) return res.status(400).json({ message: 'Student already exists with this Phone Number' })
      students.phone = phone;
    }
    if (address) students.address = address;
    if (gender) students.gender = gender;
    if (classId) {
      const classFind = await Class.findById(classId);
      if (!classFind) {
        return res.status(400).json({ message: "Class not Fount" });
      }
      students.classId = classId;
    }
    if (fatherName) students.fatherName = fatherName;
    if (branch) {
      const findBranch = await Branch.findById(branch);
      if (!findBranch) {
        return res
          .status(400)
          .json({ message: "Branch not Found", error: "Branch not Found" });
      }
      students.branch = branch;
    }
    if (motherName) {
      students.motherName = motherName;
    }
    if (motherDialCode) {
      students.motherDialCode = motherDialCode;
    }
    if (motherPhone) {
      students.motherPhone = motherPhone;
    }
    if (previousStudy !== undefined) {
      const result = previousStudyValidation(previousStudy);
      if (!result.valid) {
        return res.status(400).json({
          message: result.message,
        });
      }
      students.previousStudy = result.data;
    }
    await students.save();
    return res.status(200).json({ message: "Teacher Updated Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const getStudents = async (req, res) => {
  try {
    const { search, classId } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    let query = {};
    if (search?.trim()) {
      query.name = { $regex: new RegExp(search.trim(), "i") };
    }
    if (classId) {
      query.classId = classId;
    }
    const students = await Student.find(query)
      .skip(skip)
      .select("name email  dialCode phone image classId")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const total = await Student.countDocuments(query);

    const studentWithClasses = await Promise.all(
      students.map(async (std) => {
        let className = "";
        if (std?.classId) {
          const classFind = await Class.findById(std?.classId).select("name");
          className = classFind?.name;
        }
        return {
          ...std,
          class: className,
        };
      }),
    );

    return res.status(200).json({
      message: "Students fetched successfully",
      students: studentWithClasses,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getStudentsFilteredByClass = async (req, res) => {
  try {
    let { search, classId, isClass = false } = req.query;
    if (!classId) {
      return res.status(400).json({ message: "Class Id is required" });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let query = {};
    if (search?.trim()) {
      query.name = { $regex: new RegExp(search.trim(), "i") };
    }
    isClass = isClass === "true" ? true : false;
    if (isClass) {
      query.classId = classId;
    } else {
      query.classId = { $ne: classId };
    }
    const students = await Student.find(query)
      .select("name email  dialCode phone image classId")
      .sort({ createdAt: -1 })
      .lean()
      .skip(skip)
      .limit(limit);
    const total = await Student.countDocuments(query);
    return res.status(200).json({
      message: "Students fetched successfully",
      students,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const { _id } = req?.query;
    if (!_id) {
      return res.status(400).json({ message: "_id is required" });
    }
    const student = await Student.findById(_id).select("-password");
    if (!student) {
      return res.status(400).json({ message: "Student not fount" });
    }
    let classFind, teacher;
    if (student?.classId) {
      classFind = await Class.findById(student?.classId).select("name teacher");
      if (classFind?.teacher) {
        teacher = await Teacher.findById(classFind?.teacher).select("name");
      }
    }
    const studiedFromCenter = student?.previousStudy?.juzDetails?.length;
    const totalStudied = (await getTotalStudiedJuz(_id)) + studiedFromCenter;
    let data = {
      ...student?.toObject(),
      classes: classFind?.name,
      teacher: teacher?.name || "",
      previousStudy: student?.previousStudy,
      studiedFromCenter,
      totalStudied,
      remining: Math.max(30 - totalStudied, 0),
    };
    return res
      .status(200)
      .json({ message: "Students Details Fetched", student: data });
  } catch (error) {
    handleError(error, res);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ message: "_id is required" });
    const studentDoc = await Student.findById(_id);
    if (!studentDoc)
      return res.status(404).json({ message: "Student not found" });
    // need delete attendance, daily reports,
    await Attendance.deleteMany({ studentId: _id });
    await Report.deleteMany({ studentId: _id });
    await EducationLevel.deleteMany({ studentId: _id });
    await Student.findByIdAndDelete(_id);
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

const assignClassFotStudent = async (req, res) => {
  try {
    const { studentId, classId } = req?.body;
    if (!studentId || !classId) {
      return res
        .status(400)
        .json({ message: "Missing Class Id or Student Id" });
    }
    const classFind = await Class.findById(classId);
    if (!classFind)
      return res.status(400).json({ message: "Invalid Class Id" });

    //  students as array   //
    if (Array.isArray(studentId)) {
      for (const std of studentId) {
        const student = await Student.findById(std);
        if (student) student.classId = classId;
        await student.save();
      }
    } else {
      const student = await Student.findById(studentId);
      if (student) student.classId = classId;
      await student.save();
    }
    return res.status(200).json({ message: "Class Assigned Successfully" });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  addStudent,
  updateStudent,
  getStudents,
  getStudentDetails,
  deleteStudent,
  assignClassFotStudent,
  getStudentsFilteredByClass,
};

const JUZ_LIST = [
  "الٓم",
  "سَيَقُولُ",
  "تِلْكَ الرُّسُلُ",
  "لَنْ تَنَالُوا",
  "وَالْمُحْصَنَاتُ",
  "لَا يُحِبُّ اللَّهُ",
  "وَإِذَا سَمِعُوا",
  "وَلَوْ أَنَّنَا",
  "قَالَ الْمَلَأُ",
  "وَاعْلَمُوا",
  "يَعْتَذِرُونَ",
  "وَمَا مِنْ دَابَّةٍ",
  "وَمَا أُبَرِّئُ",
  "رُبَمَا",
  "سُبْحَانَ الَّذِي",
  "قَالَ أَلَمْ",
  "اقْتَرَبَ",
  "قَدْ أَفْلَحَ",
  "وَقَالَ الَّذِينَ",
  "أَمَّنْ خَلَقَ",
  "اتْلُ مَا أُوحِيَ",
  "وَمَنْ يَقْنُتْ",
  "وَمَا لِيَ",
  "فَمَنْ أَظْلَمُ",
  "إِلَيْهِ يُرَدُّ",
  "حم",
  "قَالَ فَمَا خَطْبُكُمْ",
  "قَدْ سَمِعَ",
  "تَبَارَكَ",
  "عَمَّ يَتَسَاءَلُونَ",
];

function previousStudyValidation(previousStudy) {
  const data = previousStudy || {};

  const totalStudiedPages = Number(data.totalStudiedPages ?? 0);
  const totalStudiedLines = Number(data.totalStudiedLines ?? 0);
  const isJuzCompleted = Boolean(data.isJuzCompleted);
  const juzDetails = Array.isArray(data.juzDetails) ? data.juzDetails : [];

  // Pages
  if (!Number.isInteger(totalStudiedPages) || totalStudiedPages < 0) {
    return {
      valid: false,
      message: "Studied pages must be a non-negative integer",
    };
  }

  // Lines
  if (
    !Number.isInteger(totalStudiedLines) ||
    totalStudiedLines < 0 ||
    totalStudiedLines > 14
  ) {
    return {
      valid: false,
      message: "Studied lines must be between 0 and 14",
    };
  }

  // Juz completed but no details
  if (isJuzCompleted && juzDetails.length === 0) {
    return {
      valid: false,
      message: "Please select at least one completed Juz",
    };
  }

  // Validate Juz
  const usedJuzNumbers = new Set();

  for (const juz of juzDetails) {
    const juzNumber = Number(juz.juzNumber);

    if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      return {
        valid: false,
        message: "Invalid Juz number",
      };
    }

    // Prevent duplicate Juz
    if (usedJuzNumbers.has(juzNumber)) {
      return {
        valid: false,
        message: `Juz ${juzNumber} is selected more than once`,
      };
    }

    usedJuzNumbers.add(juzNumber);

    // Always derive the name from the number
    if (juz.juzName !== JUZ_LIST[juzNumber - 1]) {
      return {
        valid: false,
        message: `Invalid Juz name for Juz ${juzNumber}`,
      };
    }
  }

  // If no Juz completed, don't allow details
  if (!isJuzCompleted && juzDetails.length > 0) {
    return {
      valid: false,
      message: "Juz details cannot be added when Juz is not completed",
    };
  }

  return {
    valid: true,
    data: {
      totalStudiedPages,
      totalStudiedLines,
      isJuzCompleted,
      juzDetails,
    },
  };
}
