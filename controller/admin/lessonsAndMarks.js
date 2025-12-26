const { handleError } = require('../../handler/handleError')
const Lesson = require('../../models/admin/lesson')
const LessonType = require('../../models/admin/lessonType')

const addLesson = async (req, res) => {
    try {
        const { name, description, mark, lessonType, criteriaNumber, isFixedMarks = false } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        if (!description) return res.status(400).json({ message: 'Description is required' });
        if (!mark) return res.status(400).json({ message: 'Mark is required' });
        if (isFixedMarks == false && !lessonType) return res.status(400).json({ message: 'Lesson Type is required' });
        if (isFixedMarks == false && !criteriaNumber) return res.status(400).json({ message: 'Criteria Number is required' });
        let lessonTypeDoc
        if (isFixedMarks == false) {
            lessonTypeDoc = await LessonType.findById(lessonType);
            if (!lessonTypeDoc) return res.status(400).json({ message: 'Lesson Type not found' });
        }
        const existingLesson = await Lesson.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existingLesson && !existingLesson.isDeleted) return res.status(400).json({ message: 'Lesson already exists with this name' });
        if (existingLesson && existingLesson.isDeleted) {
            existingLesson.isDeleted = false;
            existingLesson.name = name;
            existingLesson.description = description;
            existingLesson.mark = mark;
            existingLesson.lessonType = isFixedMarks ? null : lessonTypeDoc?._id;
            existingLesson.criteriaNumber = isFixedMarks ? 0 : criteriaNumber;
            existingLesson.isFixedMarks = isFixedMarks;
            await existingLesson.save();
        } else {
            await Lesson.create({ name, description, mark, isFixedMarks, lessonType: isFixedMarks ? null : lessonTypeDoc?._id, criteriaNumber: isFixedMarks ? 0 : criteriaNumber });
        }
        return res.status(200).json({ message: 'Lesson created successfully' });
    } catch (error) {
        handleError(error, res);
    }
}

const updateLesson = async (req, res) => {
    try {
        const { _id, name, description, mark, lessonType, isFixedMarks, criteriaNumber } = req.body;
        const lesson = await Lesson.findById(_id);
        if (!lesson) return res.status(400).json({ message: 'Lesson not found' });

        if (name) lesson.name = name;
        if (description) lesson.description = description;
        if (mark) lesson.mark = mark;
        if (lessonType && isFixedMarks == false) {
            const lessonTypeDoc = await LessonType.findById(lessonType);
            if (!lessonTypeDoc) return res.status(400).json({ message: 'Lesson Type not found' });
        }
        lesson.lessonType = isFixedMarks ? null : lessonType;
        if (criteriaNumber) isFixedMarks == false ? lesson.criteriaNumber = criteriaNumber : lesson.criteriaNumber = 0;
        if (isFixedMarks !== undefined) lesson.isFixedMarks = isFixedMarks;
        if (isFixedMarks == true) {
            lesson.lessonType = null;
            lesson.criteriaNumber = 0
        };
        await lesson.save();
        return res.status(200).json({ message: 'Lesson updated successfully' });
    } catch (error) {
        handleError(error, res);
    }
}

const getLessons = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { isDeleted: false };
        if (search?.trim()) {
            query.name = { $regex: new RegExp(search.trim(), 'i') };
        }
        const lessons = await Lesson.find(query).populate('lessonType');
        return res.status(200).json({ message: 'Lessons fetched successfully', lessons });
    } catch (error) {
        handleError(error, res);
    }
}

const deleteLessons = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) return res.status(400).json({ message: '_id is required' });
        const lesson = await Lesson.findById(_id);
        if (!lesson) return res.status(400).json({ message: 'Lesson not found' });
        lesson.isDeleted = true;
        await lesson.save();
        return res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        handleError(error, res);
    }
}

// lesson types
const getLessonTypes = async (req, res) => {
    try {
        const lessonTypes = await LessonType.find({ isDeleted: false });
        return res.status(200).json({ message: 'Lesson Types fetched successfully', lessonTypes });
    } catch (error) {
        handleError(error, res);
    }
}

const addLessonType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const existingLessonType = await LessonType.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (existingLessonType && !existingLessonType.isDeleted) return res.status(400).json({ message: 'Lesson Type already exists with this name' });
        if (existingLessonType && existingLessonType.isDeleted) {
            existingLessonType.isDeleted = false;
            existingLessonType.name = name;
            await existingLessonType.save();
        } else {
            await LessonType.create({ name });
        }
        return res.status(200).json({ message: 'Lesson Type created successfully' });
    }
    catch (error) {
        handleError(error, res);
    }
}

const updateLessonType = async (req, res) => {
    try {
        const { _id, name } = req.body;
        const lessonType = await LessonType.findById(_id);
        if (!lessonType) return res.status(400).json({ message: 'Lesson Type not found' });
        if (name) lessonType.name = name;
        await lessonType.save();
        return res.status(200).json({ message: 'Lesson Type updated successfully' });
    } catch (error) {
        handleError(error, res);
    }
}

const deleteLessonType = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) return res.status(400).json({ message: '_id is required' });
        const lessonType = await LessonType.findById(_id);
        if (!lessonType) return res.status(400).json({ message: 'Lesson Type not found' });
        lessonType.isDeleted = true;
        await lessonType.save();
        return res.status(200).json({ message: 'Lesson Type deleted successfully' });
    } catch (error) {
        handleError(error, res);
    }
}


module.exports = {
    addLesson,
    updateLesson,
    getLessons,
    deleteLessons,
    getLessonTypes,
    addLessonType,
    updateLessonType,
    deleteLessonType
}