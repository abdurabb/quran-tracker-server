const { handleError } = require("../../handler/handleError");
const Branch = require("../../models/admin/branch");
const Students = require('../../models/admin/student')

// ==============================
// Add Branch
// ==============================

const addBranch = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: "Branch name is required",
            });
        }

        const existingBranch = await Branch.findOne({
            name: new RegExp(`^${name.trim()}$`, "i"),
        }).lean();

        if (existingBranch) {
            return res.status(400).json({
                message: "Branch already exists with this name",
            });
        }

        await Branch.create({
            name: name.trim(),
        });

        return res.status(201).json({
            message: "Branch created successfully",
        });

    } catch (error) {
        handleError(error, res);
    }
};

// ==============================
// Get Branches
// ==============================

const getBranches = async (req, res) => {
    try {

        const search = req.query.search;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;
        let query = {};
        if (search.trim()) {
            query.name = {
                $regex: new RegExp(search.trim(), "i"),
            };
        }
        const branches = await Branch.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Branch.countDocuments(query);
        return res.status(200).json({
            message: "Branches fetched successfully",
            branches,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        handleError(error, res);
    }
};

const getAllBranchNames = async (req, res) => {
    try {
        const search = req.query.search;
        let query = {};
        if (search.trim()) {
            query.name = {
                $regex: new RegExp(search.trim(), "i"),
            };
        }
        const branches = await Branch.find(query).select('name')
        return res.status(200).json({ messsage: 'Branches', branches })

    } catch (error) {
        handleError(error, res);
    }
}

// ==============================
// Update Branch
// ==============================

const updateBranch = async (req, res) => {
    try {

        const { _id, name } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "_id is required",
            });
        }

        const branch = await Branch.findById(_id);

        if (!branch) {
            return res.status(404).json({
                message: "Branch not found",
            });
        }

        if (name) {

            const duplicate = await Branch.findOne({
                _id: { $ne: _id },
                name: new RegExp(`^${name.trim()}$`, "i"),
            }).lean();

            if (duplicate) {
                return res.status(400).json({
                    message: "Branch already exists with this name",
                });
            }

            branch.name = name.trim();
        }

        await branch.save();

        return res.status(200).json({
            message: "Branch updated successfully",
        });

    } catch (error) {
        handleError(error, res);
    }
};

// ==============================
// Delete Branch
// ==============================

const deleteBranch = async (req, res) => {
    try {

        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "_id is required",
            });
        }

        const branch = await Branch.findById(_id);

        if (!branch) {
            return res.status(404).json({
                message: "Branch not found",
            });
        }

        // Future validation
        // Example:
        const students = await Students.exists({ branch: _id });
        if (students) {
            return res.status(400).json({
                message: "Cannot delete: students are assigned to this branch"
            });
        }

        await Branch.findByIdAndDelete(_id);

        return res.status(200).json({
            message: "Branch deleted successfully",
        });

    } catch (error) {
        handleError(error, res);
    }
};

module.exports = {
    addBranch,
    getBranches,
    updateBranch,
    deleteBranch,
    getAllBranchNames
};