const bcrypt = require("bcryptjs");
const Teacher = require("../../models/admin/teacher");

const changeTeacherPassword = async (req, res) => {
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

    // ---------------------------------------------------------
    // AUTHENTICATED TEACHER
    // ---------------------------------------------------------

    // const teacherId = req.user.id;
    const teacherId = req.teacherId;
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher account not found.",
      });
    }

    // ---------------------------------------------------------
    // CHECK OLD PASSWORD
    // ---------------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      teacher.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Old password is incorrect.",
      });
    }

    // ---------------------------------------------------------
    // HASH NEW PASSWORD
    // ---------------------------------------------------------

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ---------------------------------------------------------
    // UPDATE PASSWORD
    // ---------------------------------------------------------

    teacher.password = hashedPassword;

    await teacher.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change teacher password error:", error);

    return res.status(500).json({
      message: "Failed to change password.",
    });
  }
};

module.exports = {
  changeTeacherPassword,
};
