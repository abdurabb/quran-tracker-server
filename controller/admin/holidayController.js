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

    // --------------------------------
    // Basic validation
    // --------------------------------

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one holiday date is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Holiday name is required",
      });
    }

    // --------------------------------
    // Remove duplicate dates
    // --------------------------------

    const uniqueDates = [...new Set(dates)];

    // --------------------------------
    // Validate all dates
    // --------------------------------

    const invalidDates = uniqueDates.filter(
      (date) => !/^\d{4}-\d{2}-\d{2}$/.test(date),
    );

    if (invalidDates.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
        invalidDates,
      });
    }

    // --------------------------------
    // Find existing holidays
    // --------------------------------

    const existingHolidays = await Holiday.find({
      date: { $in: uniqueDates },
      isActive: true,
    })
      .select("date")
      .lean();

    const existingDates = new Set(
      existingHolidays.map((holiday) => holiday.date),
    );

    // --------------------------------
    // Separate new and existing dates
    // --------------------------------

    const datesToCreate = uniqueDates.filter(
      (date) => !existingDates.has(date),
    );

    const skippedDates = uniqueDates.filter((date) => existingDates.has(date));

    // --------------------------------
    // Nothing new to create
    // --------------------------------

    if (datesToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All selected dates already have holidays",
        skippedDates,
      });
    }

    // --------------------------------
    // Create holidays
    // --------------------------------

    const holidaysToCreate = datesToCreate.map((date) => ({
      date,
      name: name.trim(),
      description: description?.trim() || "",
    }));

    const createdHolidays = await Holiday.insertMany(holidaysToCreate);

    // --------------------------------
    // Response
    // --------------------------------

    return res.status(201).json({
      success: true,
      message:
        skippedDates.length > 0
          ? `${createdHolidays.length} holidays created. ${skippedDates.length} dates were already holidays.`
          : `${createdHolidays.length} holidays created successfully`,
      holidays: createdHolidays,
      createdDates: datesToCreate,
      skippedDates,
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
    const { id } = req.query;

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
