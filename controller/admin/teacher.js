const { handleError } = require('../../handler/handleError')
const Teacher = require('../../models/admin/teacher')
const Class = require('../../models/admin/class')
const bcrypt = require('bcryptjs');

const addTeacher = async (req, res) => {
    try {
        const { password, email, phone } = req.body;

        const existingTeacher = await Teacher.findOne({
            $or: [
                { email: new RegExp(`^${email}$`, 'i') },
                { phone }
            ]
        });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher already exists with this email or phone number' });
        }
        await Teacher.create({
            ...req?.body,
            dob: new Date(req?.body?.dob),
            joiningDate: new Date(req?.body?.joiningDate)
        });

        return res.status(201).json({ message: 'Teacher created successfully' });
    } catch (error) {
        handleError(error, res);
    }
};

const updateTeacher = async (req, res) => {
    try {
        const {
            _id,
            name,
            image,
            email,
            password,
            qualification,
            dob,
            joiningDate,
            dialCode,
            phone,
            address,
            gender,
            experience
        } = req?.body;
        if (!_id) { return res.status(400).json({ message: '_id is required' }) }
        const teacher = await Teacher.findById(_id)
        if (!teacher) { return res.status(400).json({ message: 'data not fount' }) }

        if (name) teacher.name = name
        if (image) teacher.image = image
        if (email) {
            const existingTeacher = await Teacher.findOne({ _id: { $ne: _id }, email: new RegExp(`^${email}$`, 'i') })
            if (existingTeacher) return res.status(400).json({ message: 'Teacher already exists with this email' })
            teacher.email = email
        }
        if (password) {
            // const hashedPassword = await bcrypt.hash(password, 10);
            teacher.password = password
        }
        if (qualification) teacher.qualification = qualification
        if (dob) teacher.dob = new Date(dob)
        if (joiningDate) teacher.joiningDate = new Date(joiningDate)
        if (dialCode) teacher.dialCode = dialCode
        if (phone) {
            const existingTeacher = await Teacher.findOne({ _id: { $ne: _id }, phone })
            if (existingTeacher) return res.status(400).json({ message: 'Teacher already exists with this Phone Number' })
            teacher.phone = phone
        }
        if (address) teacher.address = address
        if (gender) teacher.gender = gender
        if (experience) teacher.experience = experience
        await teacher.save()
        return res.status(200).json({ message: 'Teacher Updated Successfully' })

    } catch (error) {
        handleError(error, res);
    }
}

const getTeachers = async (req, res) => {
    try {
        const { search } = req.query;
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit

        let query = {}
        if (search?.trim()) {
            query.name = { $regex: new RegExp(search.trim(), 'i') };
          }
        const teachers = await Teacher.find(query).skip(skip).select('name email dialCode phone image').sort({createdAt:-1}).limit(limit).lean();
        const total = await Teacher.countDocuments(query)
        return res.status(200).json({ message: 'Teachers fetched successfully', teachers, totalPages: Math.ceil(total / limit) });

    } catch (error) {
        handleError(error, res);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) return res.status(400).json({ message: '_id is required' });
        const teacherDoc = await Teacher.findById(_id);
        if (!teacherDoc) return res.status(404).json({ message: 'Teacher not found' });
        const classAssigned = await Class.find({ teacher: _id })
        if (Array.isArray(classAssigned) && classAssigned.length > 0) {
            for (const cls of classAssigned) {
                cls.teacher = null;
                await cls.save()
            }
        }
        await Teacher.findByIdAndDelete(_id);
        return res.status(200).json({ message: 'Teacher deleted successfully' });

    } catch (error) {
        handleError(error, res)
    }
}

const getAllTeachers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search?.trim()) {
            query.name = { $regex: new RegExp(search.trim(), 'i') };
          }
        const teachers = await Teacher.find().select('name')
        return res.status(200).json({ message: 'All teachers', teachers })
    } catch (error) {
        handleError(error, res)
    }
}


const assignAClass = async (req, res) => {
    try {
        const { classId, teacherId } = req?.body;
        if (!classId || !teacherId) { return res.status(400).json({ message: 'Missing Required Data' }) }
        const classDoc = await Class.findById(classId)
        const teacher = await Teacher.findById(teacherId)
        if (!classDoc) { return res.status(400).json({ message: 'Class is Missing in this Id' }) }
        if (!teacher) { return res.status(400).json({ message: 'Teacher is Missing in this Id' }) }
        classDoc.teacher = teacherId
        await classDoc.save()
        return res.status(200).json({ message: 'Class Assigned' })
    } catch (error) {
        handleError(error, res);
    }
}

const getTeacherDetails = async (req, res) => {
    try {
        const { _id } = req?.query;
        if (!_id) { return res.status(400).json({ message: "_id is required" }) }
        const teacher = await Teacher.findById(_id)
        if (!teacher) { return res.status(400).json({ message: 'Teacher not fount' }) }
        const classes = await Class.find({ teacher: _id }).select('name').lean()
        let data = {
            ...teacher?.toObject(),
            classes
        }
        return res.status(200).json({ message: 'Teacher Details Fetched', teacher: data })
    } catch (error) {
        handleError(error, res);
    }
}

module.exports = {
    addTeacher, updateTeacher, getTeachers, deleteTeachers, getAllTeachers, assignAClass, getTeacherDetails
}