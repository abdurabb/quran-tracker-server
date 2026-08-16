const { generateToken } = require("../../handler/jwtGenerate");
const { handleError } = require("../../handler/handleError");
const Admin = require("../../models/admin/adminSchema");
const Teacher = require("../../models/admin/teacher");
const Student = require("../../models/admin/student");
const bcrypt = require("bcryptjs");
const { verifyPassword } = require("../../handler/password");

const adminLogin = async (req, res) => {
  try {
    const { role, email, password } = req?.body;
    // if (!role) { return res.status(400).json({ success: false, message: 'Role is required.' }) }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    // let isExist = role == 'admin' ? await Admin.findOne({ email }) :
    // role == 'teacher' ? await Teacher.findOne({ email }) : await Student.findOne({ email })
    let isExist = await Admin.findOne({ email });
    let newRole = "admin";
    if (!isExist) {
      isExist = await Teacher.findOne({ email });
      newRole = "teacher";
    }
    if (!isExist) {
      isExist = await Student.findOne({ email });
      newRole = "user";
    }

    if (!isExist) {
      return res
        .status(400)
        .json({ success: false, message: "Email is not registered." });
    }

    const verify = await verifyPassword(password, isExist?.password);
    if (!verify) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password." });
    }
    // const isMatch = await bcrypt.compare(password, isExist?.password);
    // if (!isMatch) {
    //     return res.status(401).json({ message: 'Invalid email or password' });
    // }
    const token = generateToken(isExist._id, "90d");
    return res.status(200).json({
      success: true,
      message: "Logged Successfully",
      token,
      role: newRole,
      admin: isExist,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          "Old password, new password and confirm password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters.",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match.",
      });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from old password.",
      });
    }
    // const adminId = req.user.id;
    const adminId = req.adminId;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Old password is incorrect.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();
    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change admin password error:", error);
    return res.status(500).json({
      message: "Failed to change password.",
    });
  }
};

const crone = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "Cron ping success" });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  adminLogin,
  changeAdminPassword,
  crone,
};
