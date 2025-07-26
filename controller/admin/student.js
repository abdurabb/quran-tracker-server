
const { handleError } = require('../../handler/handleError')
const Class = require('../../models/admin/class');
const Teacher = require('../../models/admin/teacher');
const Student = require('../../models/admin/student');
const mongoose = require('mongoose');


const addStudent = async (req, res) => {
    try {
        let { email, classId } = req?.body;
        const existingStudent = await Student.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (existingStudent) {
            return res.status(400).json({ message: 'Students already exists with this email or phone number' });
        }
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            classId = null;
        }
        await Student.create({
            ...req?.body,
            dob: new Date(req?.body?.dob),
            admissionDate: new Date(req?.body?.admissionDate),
            classId
        });

        return res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
        handleError(error, res);
    }
};

const updateStudent = async (req, res) => {
    try {
        const {
            _id,
            name,
            image,
            email,
            password,
            dialCode,
            phone,
            dob,
            admissionDate,
            address,
            gender,
            classId
        } = req?.body;
        if (!_id) { return res.status(400).json({ message: '_id is required' }) }
        const students = await Student.findById(_id)
        if (!students) { return res.status(400).json({ message: 'data not fount' }) }

        if (name) students.name = name
        if (image) students.image = image
        if (email) {
            const existingStudent = await Student.findOne({ _id: { $ne: _id }, email: new RegExp(`^${email}$`, 'i') })
            if (existingStudent) return res.status(400).json({ message: 'Teacher already exists with this email' })
            students.email = email
        }
        if (password) {
            students.password = password
        }
        if (dob) students.dob = new Date(dob)
        if (admissionDate) students.admissionDate = new Date(admissionDate)
        if (dialCode) students.dialCode = dialCode
        if (phone) {
            const existingStudent = await Student.findOne({ _id: { $ne: _id }, phone })
            if (existingStudent) return res.status(400).json({ message: 'Teacher already exists with this Phone Number' })
            students.phone = phone
        }
        if (address) students.address = address
        if (gender) students.gender = gender
        if (classId) {
            const classFind = await Class.findById(classId)
            if (!classFind) { return res.status(400).json({ message: 'Class not Fount' }) }
            students.classId = classId
        }
        await students.save()
        return res.status(200).json({ message: 'Teacher Updated Successfully' })

    } catch (error) {
        handleError(error, res);
    }
}

const getStudents = async (req, res) => {
    try {
        const { search, classId } = req.query;
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit
        let query = {}
        if (search?.trim()) {
            query.name = { $regex: new RegExp(search.trim(), 'i') };
        }
        if (classId) {
            query.classId = classId
        }
        const students = await Student.find(query).skip(skip).select('name  dialCode phone image classId').sort({createdAt:-1}).limit(limit).lean();
        const total = await Student.countDocuments(query)

        const studentWithClasses = await Promise.all(students.map(async (std) => {
            let className = ""
            if (std?.classId) {
                const classFind = await Class.findById(std?.classId).select('name')
                className = classFind?.name
            }
            return {
                ...std,
                class: className
            }
        }))

        return res.status(200).json({ message: 'Students fetched successfully', students: studentWithClasses, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        handleError(error, res);
    }
}

const getStudentDetails = async (req, res) => {
    try {
        const { _id } = req?.query;
        if (!_id) { return res.status(400).json({ message: "_id is required" }) }
        const student = await Student.findById(_id)
        if (!student) { return res.status(400).json({ message: 'Student not fount' }) }
        let classFind, teacher;
        if (student?.classId) {
            classFind = await Class.findById(student?.classId).select('name teacher')
            if (classFind?.teacher) {
                teacher = await Teacher.findById(classFind?.teacher).select('name')
            }
        }
        let data = {
            ...student?.toObject(),
            classes: classFind?.name,
            teacher: teacher?.name || ""
        }
        return res.status(200).json({ message: 'Students Details Fetched', student: data })

    } catch (error) {
        handleError(error, res);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) return res.status(400).json({ message: '_id is required' });
        const studentDoc = await Student.findById(_id);
        if (!studentDoc) return res.status(404).json({ message: 'Student not found' });
        // need delete attendance, daily reports, 

        await Student.findByIdAndDelete(_id);
        return res.status(200).json({ message: 'Student deleted successfully' });

    } catch (error) {
        handleError(error, res);
    }
}


const assignClassFotStudent = async (req, res) => {
    try {
        const { studentId, classId } = req?.body;
        if (!studentId || classId) { return res.status(400).json({ message: 'Missing Class Id or Student Id' }) }
        const classFind = await Class.findById(classId)
        if (!classFind) return res.status(400).json({ message: 'Invalid Class Id' })
        const student = await Student.findById(studentId)
        if (!student) { return res.status(400).json({ message: 'Invalid Student Id' }) }
        student.classId = classId
        await student.save()
        return res.status(200).json({ message: 'Class Assigned Successfully' })
    } catch (error) {
        handleError(error, res);
    }
}



module.exports = {
    addStudent, updateStudent, getStudents, getStudentDetails, deleteStudent, assignClassFotStudent
}