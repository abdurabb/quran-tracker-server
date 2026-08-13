const Holiday = require("../models/admin/Holiday");
const WEEKLY_HOLIDAYS = require("../handler/holidays");
const { handleError } = require("../handler/handleError");

const getHolidaysByMonth = async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid year or month",
      });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    // --------------------------------
    // Special holidays from DB
    // --------------------------------

    const specialHolidays = await Holiday.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      isActive: true,
    })
      .sort({ date: 1 })
      .lean();

    // --------------------------------
    // Weekly holidays
    // --------------------------------

    const weeklyHolidays = [];

    const current = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    while (current <= lastDay) {
      const day = current.getDay();

      let isHoliday = false;
      let name = "";

      if (WEEKLY_HOLIDAYS.includes(day)) {
        isHoliday = true;
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        name = `${dayNames[day]} Holiday`;
      }

      if (isHoliday) {
        const formattedDate =
          `${current.getFullYear()}-` +
          `${String(current.getMonth() + 1).padStart(2, "0")}-` +
          `${String(current.getDate()).padStart(2, "0")}`;

        weeklyHolidays.push({
          date: formattedDate,
          name,
          description: "",
          type: "weekly",
          isActive: true,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    // --------------------------------
    // Combine
    // --------------------------------

    const holidays = [...specialHolidays, ...weeklyHolidays].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return res.json({
      success: true,
      holidays,
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getHolidaysByMonth,
};
