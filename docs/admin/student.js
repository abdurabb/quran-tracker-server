/**
 * @openapi
 * /admin/add-student:
 *   post:
 *     summary: Add a new student to the system.
 *     tags:
 *       - Student Management
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
 *               - email
 *               - password
 *               - dialCode
 *               - phone
 *               - dob
 *               - gender
 *               - address
 *               - admissionDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *               dialCode:
 *                 type: string
 *                 example: +91
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 2005-06-15
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               address:
 *                 type: string
 *                 example: 123 Street, City, Country
 *               classId:
 *                 type: string
 *                 description: Optional class ID to assign the student to.
 *                 example: 64fa1234abc56789def01234
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-07-01
 *               image:
 *                 type: string
 *                 description: Optional URL to the student's image.
 *                 example: https://example.com/images/student.jpg
 *     responses:
 *       201:
 *         description: Student created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student created successfully
 *       400:
 *         description: Validation error or duplicate entry.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Students already exists with this email or phone number
 *       401:
 *         description: Unauthorized – missing or invalid admin token.
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
 * /admin/update-student:
 *   post:
 *     summary: Update an existing student's information.
 *     tags:
 *       - Student Management
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
 *                 description: The ID of the student to update.
 *                 example: 64fb1234abc56789def01234
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               image:
 *                 type: string
 *                 example: https://example.com/images/student.jpg
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: newPassword123
 *               dialCode:
 *                 type: string
 *                 example: +92
 *               phone:
 *                 type: string
 *                 example: 3216549870
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 2006-03-25
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 example: 2022-08-01
 *               address:
 *                 type: string
 *                 example: 456 Road, City, Country
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: female
 *               classId:
 *                 type: string
 *                 example: 64fc9876a1b2c3d4e5f67890
 *     responses:
 *       200:
 *         description: Student updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher Updated Successfully
 *       400:
 *         description: Missing or invalid input, duplicate email/phone, or class not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher already exists with this Phone Number
 *       401:
 *         description: Unauthorized – Missing or invalid admin token.
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
 * /admin/get-students:
 *   get:
 *     summary: Retrieve a paginated list of students with optional search and class filter.
 *     tags:
 *       - Student Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search students by name (case-insensitive).
 *         example: John
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter students by class ID.
 *         example: 64fa1234abc56789def01234
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination.
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page.
 *         example: 10
 *     responses:
 *       200:
 *         description: List of students fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Students fetched successfully
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64fb1234abc56789def01234
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       dialCode:
 *                         type: string
 *                         example: +91
 *                       phone:
 *                         type: string
 *                         example: 9876543210
 *                       image:
 *                         type: string
 *                         example: https://example.com/student.jpg
 *                       classId:
 *                         type: string
 *                         example: 64fc9876a1b2c3d4e5f67890
 *                       class:
 *                         type: string
 *                         example: Class 6A
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
 *         description: Server error while fetching students.
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
 * /admin/get-student-details:
 *   get:
 *     summary: Get full details of a specific student, including class and teacher info.
 *     tags:
 *       - Student Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student.
 *         example: 64fb1234abc56789def01234
 *     responses:
 *       200:
 *         description: Student details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Students Details Fetched
 *                 student:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64fb1234abc56789def01234
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     phone:
 *                       type: string
 *                       example: 9876543210
 *                     dialCode:
 *                       type: string
 *                       example: +91
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: 2005-06-15
 *                     admissionDate:
 *                       type: string
 *                       format: date
 *                       example: 2021-09-01
 *                     gender:
 *                       type: string
 *                       example: male
 *                     address:
 *                       type: string
 *                       example: 123 Main St, City
 *                     image:
 *                       type: string
 *                       example: https://example.com/student.jpg
 *                     classId:
 *                       type: string
 *                       example: 64fc9876a1b2c3d4e5f67890
 *                     classes:
 *                       type: string
 *                       example: Class 7B
 *                     teacher:
 *                       type: string
 *                       example: Mr. Smith
 *       400:
 *         description: Missing or invalid student ID, or student not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: _id is required
 *       401:
 *         description: Unauthorized – Missing or invalid admin token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error while fetching student details.
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
 * /admin/delete-students:
 *   post:
 *     summary: Delete a student by ID. (Related data like attendance and daily reports should also be handled.)
 *     tags:
 *       - Student Management
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
 *                 description: The ID of the student to delete.
 *                 example: 64fb1234abc56789def01234
 *     responses:
 *       200:
 *         description: Student deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student deleted successfully
 *       400:
 *         description: Student ID not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: _id is required
 *       404:
 *         description: Student not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student not found
 *       401:
 *         description: Unauthorized – Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error while deleting the student.
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
 * /admin/assign-a-class-for-student:
 *   post:
 *     summary: Assign a class to a student.
 *     tags:
 *       - Student Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student.
 *                 example: 64fb1234abc56789def01234
 *               classId:
 *                 type: string
 *                 description: ID of the class to assign.
 *                 example: 64fc9876a1b2c3d4e5f67890
 *     responses:
 *       200:
 *         description: Class assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class Assigned Successfully
 *       400:
 *         description: Missing or invalid class or student ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing Class Id or Student Id
 *       401:
 *         description: Unauthorized – Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error during class assignment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
