/**
 * @openapi
 * /admin/add-class:
 *   post:
 *     summary: Add a new class to the system.
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the class to be created.
 *                 example: Class 1
 *               description:
 *                 type: string
 *                 description: Optional description for the class.
 *                 example: This is the first class for new students.
 *     responses:
 *       200:
 *         description: Class created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class Created Successfully
 *       400:
 *         description: Missing class name or class already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class Already Exist in this Name
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error.
 */


/**
 * @openapi
 * /admin/update-class:
 *   post:
 *     summary: Update the name or description of an existing class.
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The ID of the class to update.
 *                 example: 60f71b8e9a1e8a23b8f3e0d5
 *               name:
 *                 type: string
 *                 description: The new name for the class.
 *                 example: Class 2
 *               description:
 *                 type: string
 *                 description: The new description for the class.
 *                 example: Updated class for advanced students.
 *     responses:
 *       200:
 *         description: Class updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class updated successfully
 *       400:
 *         description: Missing ID or duplicate class name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class already exists with this name
 *       404:
 *         description: Class not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class not found
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @openapi
 * /admin/get-classes:
 *   get:
 *     summary: Retrieve a list of all classes, optionally filtered by name.
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter classes by name using a case-insensitive search.
 *         example: class 1
 *     responses:
 *       200:
 *         description: List of classes retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Classes fetched successfully
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Class 1
 *                       description:
 *                         type: string
 *                         example: This is a description of Class 1
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @openapi
 * /admin/delete-class:
 *   post:
 *     summary: Delete a class by its ID, only if no students or teachers are associated.
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The ID of the class to be deleted.
 *                 example: 60f71b8e9a1e8a23b8f3e0d5
 *     responses:
 *       200:
 *         description: Class deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class deleted successfully
 *       400:
 *         description: Missing class ID or class has linked students or teachers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot delete students are assigned to this class
 *       404:
 *         description: Class not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class not found
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @openapi
 * /admin/get-all-classes:
 *   get:
 *     summary: Retrieve all classes (optionally filtered by name).
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive filter to match class names.
 *         example: Grade 5
 *     responses:
 *       200:
 *         description: List of all matching classes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Classes fetched successfully
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Grade 5
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @openapi
 * /admin/assign-a-teacher:
 *   post:
 *     summary: Assign a teacher to a class.
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - teacherId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: ID of the class to assign the teacher to.
 *                 example: 64fa1234abc56789def01234
 *               teacherId:
 *                 type: string
 *                 description: ID of the teacher to assign.
 *                 example: 64fb9876abc12345def06789
 *     responses:
 *       200:
 *         description: Teacher assigned successfully to the class.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher Assigned
 *       400:
 *         description: Missing or invalid classId or teacherId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing Required Data
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @openapi
 * /admin/add-students:
 *   post:
 *     summary: Assign multiple students to a class.
 *     tags:
 *       - Class Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - students
 *               - classId
 *             properties:
 *               students:
 *                 type: array
 *                 description: Array of student IDs to assign to the class.
 *                 items:
 *                   type: string
 *                   example: 64fc1111a1b2c3d4e5f67890
 *               classId:
 *                 type: string
 *                 description: ID of the class to assign the students to.
 *                 example: 64fa1234abc56789def01234
 *     responses:
 *       200:
 *         description: Students successfully assigned to the class.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Students Added Successfully
 *       400:
 *         description: Missing or invalid input (e.g. no classId or students array).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class Id is required
 *       401:
 *         description: Unauthorized – Admin token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
