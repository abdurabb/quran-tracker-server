const mongoose = require("mongoose");

const previousJuzSchema = new mongoose.Schema(
  {
    juzName: {
      type: String,
      required: true,
    },

    juzNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
  },
  { _id: false },
);

const previousStudySchema = new mongoose.Schema(
  {
    // How many pages the student already studied
    totalStudiedPages: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Lines studied on the current/last page
    // Maximum is 14
    totalStudiedLines: {
      type: Number,
      default: 0,
      min: 0,
      max: 14,
    },

    // Whether the student has completed any Juz
    isJuzCompleted: {
      type: Boolean,
      default: false,
    },

    // Completed Juz details
    juzDetails: {
      type: [previousJuzSchema],
      default: [],
    },
  },
  { _id: false },
);

const studentsSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: [true, "name is Required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    dialCode: {
      type: String,
      required: [true, "Dial Code is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    dob: {
      type: Date,
      required: [true, "Dob is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Address is required"],
    },
    fatherName: {
      type: String,
      required: [true, "father name is required"],
    },
    motherName: {
      type: String,
      required: [true, "mother name is required"],
    },
    motherDialCode: {
      type: String,
      required: [true, "Dial Code is required"],
    },
    motherPhone: {
      type: String,
      required: [true, "Phone is required"],
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission Date is required"],
    },
    // =====================================================
    // PREVIOUS STUDY DETAILS
    // =====================================================

    previousStudy: {
      type: previousStudySchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentsSchema);
module.exports = Student;
