/**
 * @openapi
 * /admin/add-teacher:
 *   post:
 *     summary: Add a new teacher to the system.
 *     tags:
 *       - Teacher Management
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
 *               - qualification
 *               - dob
 *               - joiningDate
 *               - dialCode
 *               - phone
 *               - address
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the teacher.
 *                 example: John Doe
 *               image:
 *                 type: string
 *                 description: Optional image URL for the teacher.
 *                 example: https://example.com/photo.jpg
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique email address of the teacher.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for teacher account.
 *                 example: securePassword123
 *               qualification:
 *                 type: string
 *                 description: Teacher's educational qualification.
 *                 example: M.Ed in Mathematics
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth.
 *                 example: 1990-05-15
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 description: Joining date of the teacher.
 *                 example: 2024-08-01
 *               dialCode:
 *                 type: string
 *                 description: Country dial code for the phone number.
 *                 example: +91
 *               phone:
 *                 type: string
 *                 description: Phone number (must be unique).
 *                 example: 9876543210
 *               address:
 *                 type: string
 *                 description: Residential address of the teacher.
 *                 example: 123 Main Street, City, Country
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Gender of the teacher.
 *                 example: male
 *               experience:
 *                 type: number
 *                 description: Years of teaching experience (optional).
 *                 example: 5
 *     responses:
 *       201:
 *         description: Teacher created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher created successfully
 *       400:
 *         description: Email or phone already exists, or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher already exists with this email or phone number
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
 * /admin/update-teacher:
 *   post:
 *     summary: Update an existing teacher's information.
 *     tags:
 *       - Teacher Management
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
 *                 description: The unique ID of the teacher to update.
 *                 example: 60f71b8e9a1e8a23b8f3e0d5
 *               name:
 *                 type: string
 *                 description: Full name of the teacher.
 *                 example: John Doe
 *               image:
 *                 type: string
 *                 description: Optional image URL for the teacher.
 *                 example: https://example.com/photo.jpg
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address (must be unique).
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (optional).
 *                 example: newSecurePassword123
 *               qualification:
 *                 type: string
 *                 description: Updated educational qualification.
 *                 example: PhD in Chemistry
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Updated date of birth.
 *                 example: 1990-05-15
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 description: Updated joining date.
 *                 example: 2024-08-01
 *               dialCode:
 *                 type: string
 *                 description: Updated dial code.
 *                 example: +91
 *               phone:
 *                 type: string
 *                 description: Updated phone number (must be unique).
 *                 example: 9876543210
 *               address:
 *                 type: string
 *                 description: Updated residential address.
 *                 example: 123 Main Street, City
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Updated gender.
 *                 example: male
 *               experience:
 *                 type: number
 *                 description: Updated years of experience.
 *                 example: 7
 *     responses:
 *       200:
 *         description: Teacher updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher Updated Successfully
 *       400:
 *         description: Missing ID, duplicate email/phone, or teacher not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher already exists with this email
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
 * /admin/get-teachers:
 *   get:
 *     summary: Retrieve a paginated list of teachers, optionally filtered by name.
 *     tags:
 *       - Teacher Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search term to filter teachers by name.
 *         example: john
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination.
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page.
 *         example: 10
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully.
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
 *                         example: John Doe
 *                       description:
 *                         type: string
 *                         example: Senior Math Teacher
 *                 totalPages:
 *                   type: integer
 *                   example: 5
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
 * /admin/delete-teachers:
 *   post:
 *     summary: Delete a teacher by their ID and unassign them from any associated classes.
 *     tags:
 *       - Teacher Management
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
 *                 description: ID of the teacher to delete.
 *                 example: 60f71b8e9a1e8a23b8f3e0d5
 *     responses:
 *       200:
 *         description: Teacher deleted successfully and removed from associated classes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class deleted successfully
 *       400:
 *         description: Missing or invalid ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: _id is required
 *       404:
 *         description: Teacher not found.
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
 * /admin/get-all-teachers:
 *   get:
 *     summary: Retrieve a list of all teachers (optionally filtered by name).
 *     tags:
 *       - Teacher Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive filter to match teacher names.
 *         example: jane
 *     responses:
 *       200:
 *         description: All matching teachers retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All teachers
 *                 teachers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Jane Doe
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
 * /admin/assign-a-class:
 *   post:
 *     summary: Assign a class to a teacher.
 *     tags:
 *       - Teacher Management
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
 *                 description: ID of the class to be assigned.
 *                 example: 64fa1234abc56789def01234
 *               teacherId:
 *                 type: string
 *                 description: ID of the teacher to assign the class to.
 *                 example: 64fb9876abc12345def06789
 *     responses:
 *       200:
 *         description: Class assigned to teacher successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class Assigned
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
