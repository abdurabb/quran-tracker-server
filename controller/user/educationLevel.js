const { handleError } = require('../../handler/handleError')
const EducationLevel = require('../../models//teacher/Education')
const mongoose = require('mongoose')

const getEducationLevel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const userData = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {
            studentId: new mongoose.Types.ObjectId(userData._id),
        };


        if (month) {
            query.month = Number(month);
        }

        if (year) {
            query.year = Number(year);
        }


        const edicationLevel = await EducationLevel.find(query)
            .sort({ createdAt: -1 })
            .select('juzuCompleted juzuCount lineCount month pageCount year juzuDetails')
            .skip(skip)
            .limit(limit);


        const total = await EducationLevel.countDocuments(query);


        return res.status(200).json({
            message: 'Education Level fetched successfully',
            edicationLevel,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        handleError(error, res);
    }
}

module.exports = {
    getEducationLevel
}