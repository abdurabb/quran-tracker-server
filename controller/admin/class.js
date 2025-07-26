const { handleError } = require('../../handler/handleError')
const Class = require('../../models/admin/class');
const Teacher = require('../../models/admin/teacher');
const Student = require('../../models/admin/student')

const addClass = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Class Name is required' });

        const existingClass = await Class.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
        if (existingClass) return res.status(400).json({ message: 'Class already exists with this name' });

        await Class.create({ name, description });
        return res.status(201).json({ message: 'Class created successfully' });

    } catch (error) {
        handleError(error, res);
    }
};


const updateClass = async (req, res) => {
    try {
        const { _id, name, description } = req.body;
        if (!_id) return res.status(400).json({ message: '_id is required' });

        const classDoc = await Class.findById(_id);
        if (!classDoc) return res.status(404).json({ message: 'Class not found' });

        if (name) {
            const duplicate = await Class.findOne({ _id: { $ne: _id }, name: new RegExp(`^${name}$`, 'i') }).lean();
            if (duplicate) return res.status(400).json({ message: 'Class already exists with this name' });
            classDoc.name = name;
        }

        if (description !== undefined) classDoc.description = description;

        await classDoc.save();
        return res.status(200).json({ message: 'Class updated successfully' });

    } catch (error) {
        handleError(error, res);
    }
};

const getClasses = async (req, res) => {
    try {
        const { search } = req.query;
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit
        let query = {}
        if (search?.trim()) {
            query.name = { $regex: new RegExp(search.trim(), 'i') };
        }
        const classes = await Class.find(query).select('name description teacher').sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
        const classWithDetails = await Promise.all(classes.map(async (cls) => {
            const teacher = await Teacher.findById(cls?.teacher).select('name')
            return {
                ...cls,
                totalStudent: 5,
                teacherName: teacher?.name
            }
        }))
        const total = await Class.countDocuments(query)
        return res.status(200).json({ message: 'Classes fetched successfully', classes: classWithDetails, totalPages: Math.ceil(total / limit) });

    } catch (error) {
        handleError(error, res);
    }
};

const deleteClass = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) return res.status(400).json({ message: '_id is required' });
        const classDoc = await Class.findById(_id);
        if (!classDoc) return res.status(404).json({ message: 'Class not found' });

        // if (classDoc?.teacher !== null) return res.status(400).json({ message: 'Cannot delete: teacher is assigned to this class' });
        // Check if any students or teachers are associated with this class
        // const [studentExists] = await Promise.all([
        //     Student.exists({ classId: _id }),
        //     
        // ]);
        // if (studentExists) return res.status(400).json({ message: 'Cannot delete: students are assigned to this class' });

        await Class.findByIdAndDelete(_id);
        return res.status(200).json({ message: 'Class deleted successfully' });

    } catch (error) {
        handleError(error, res)
    }
}

const getAllClasses = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (typeof search === 'string' && search.trim()) {
            query.name = { $regex: new RegExp(search.trim(), 'i') };
        }
        console.log(query)
        const classes = await Class.find(query).select('name')
        return res.status(200).json({ message: 'Classes fetched successfully', classes, });
    } catch (error) {
        console.log(error)
        handleError(error, res);
    }
}

const assignATeacher = async (req, res) => {
    try {
        const { classId, teacherId } = req?.body;
        if (!classId || !teacherId) { return res.status(400).json({ message: 'Missing Required Data' }) }
        const classDoc = await Class.findById(classId)
        const teacher = await Teacher.findById(teacherId)
        if (!classDoc) { return res.status(400).json({ message: 'Class is Missing in this Id' }) }
        if (!teacher) { return res.status(400).json({ message: 'Teacher is Missing in this Id' }) }
        classDoc.teacher = teacherId
        await classDoc.save()
        return res.status(200).json({ message: 'Teacher Assigned' })
    } catch (error) {
        handleError(error, res);
    }
}

const addStudents = async (req, res) => {
    try {
        const { students, classId } = req?.body;
        if (!students) { return res.status(400).json({ message: 'Students are required' }) }
        if (!classId) { return res.status(400).json({ message: 'Class Id is required' }) }
        const classFind = await Class.findById(classId)
        if (!classFind) { return res.status(400).json({ message: 'Class not fount' }) }
        if (!Array.isArray(students)) { return res.status(400).json({ message: 'Invalid Type of Students' }) }

        for (const std of students) {
            const student = await Student.findById(std)
            if (student) student.classId = classId
            await student.save()
        }
        return res.status(200).json({ message: 'Students Added Successfully' })
    } catch (error) {
        handleError(error, res);
    }
}



module.exports = {
    addClass, updateClass, getClasses, deleteClass, getAllClasses, assignATeacher, addStudents
}