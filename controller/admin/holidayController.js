const Holiday = require("../../models/admin/Holiday");
const WEEKLY_HOLIDAYS = require("../../handler/holidays");
const { getHolidaysByMonth } = require("../../handler/getHolidayByMonth");
const { handleError } = require("../../handler/handleError");

const createHoliday = async (req, res) => {
  try {
    const { date, name, description } = req.body;

    if (!date || !name) {
      return res.status(400).json({
        success: false,
        message: "Date and holiday name are required",
      });
    }

    // Validate YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Prevent creating holiday for a past date
    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (date < todayString) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a holiday for a past date",
      });
    }

    // Check duplicate
    const existingHoliday = await Holiday.findOne({
      date,
      isActive: true,
    });

    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: "Holiday already exists for this date",
      });
    }

    const holiday = await Holiday.create({
      date,
      name,
      description: description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Holiday created successfully",
      holiday,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const createMultipleHoliday = async (req, res) => {
  try {
    const { dates, name, description } = req.body;

    if (!Array.isArray(dates) || dates.length === 0 || !name) {
      return res.status(400).json({
        success: false,
        message: "Dates and holiday name are required",
      });
    }

    // Today's date in YYYY-MM-DD
    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    // Validate all dates
    for (const date of dates) {
      // Validate YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: `Invalid date format: ${date}. Use YYYY-MM-DD`,
        });
      }

      // Prevent past dates
      if (date < todayString) {
        return res.status(400).json({
          success: false,
          message: `Cannot create a holiday for a past date: ${date}`,
        });
      }
    }

    // Remove duplicate dates from request
    const uniqueDates = [...new Set(dates)];

    // Check existing holidays
    const existingHolidays = await Holiday.find({
      date: { $in: uniqueDates },
      isActive: true,
    });

    if (existingHolidays.length > 0) {
      const existingDates = existingHolidays.map((holiday) => holiday.date);

      return res.status(400).json({
        success: false,
        message: "Holiday already exists for one or more selected dates",
        existingDates,
      });
    }

    // Create holidays
    const holidaysToCreate = uniqueDates.map((date) => ({
      date,
      name,
      description: description || "",
    }));

    const holidays = await Holiday.insertMany(holidaysToCreate);

    return res.status(201).json({
      success: true,
      message: `${holidays.length} holidays created successfully`,
      holidays,
    });
  } catch (error) {
    handleError(error, res);
  }
};

const getHoliday = async (req, res) => {
  try {
    await getHolidaysByMonth(req, res);
  } catch (error) {
    handleError(error, res);
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.body;

    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  getHoliday,
  createHoliday,
  deleteHoliday,
  createMultipleHoliday,
};
