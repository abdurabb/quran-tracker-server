const { generateToken } = require("../../handler/jwtGenerate");
const { handleError } = require("../../handler/handleError");
const Student = require("../../models/admin/student");
const bcrypt = require("bcryptjs");
const { verifyPassword } = require("../../handler/password");

const changeUserPassword = async (req, res) => {
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
    // const userId = req.user.id;
    const userId = req.userId;
    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Old password is incorrect.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change User password error:", error);
    return res.status(500).json({
      message: "Failed to change password.",
    });
  }
};

module.exports = {
  changeUserPassword,
};
