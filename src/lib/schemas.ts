import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas — used for runtime validation in route handlers
// ---------------------------------------------------------------------------

export const NewTransactionSchema = z.object({
    concept: z.string().min(1),
    amount: z.number().positive({ message: "Amount must be greater than 0" }),
    date: z
        .string()
        .refine((d) => !isNaN(new Date(d).getTime()), { message: "Invalid date" })
        .refine((d) => new Date(d) <= new Date(), { message: "Date cannot be in the future" }),
    type: z.enum(["income", "expense"]),
});

export const UpdateTransactionSchema = NewTransactionSchema; 

export const UpdateUserSchema = z.object({
    name: z.string().min(1),
    role: z.enum(["ADMIN", "USER"]),
});

// ---------------------------------------------------------------------------
// JSDoc — OpenAPI component schemas (shared $ref definitions)
// ---------------------------------------------------------------------------

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: better-auth.session_token
 *       description: Session cookie set automatically after signing in.
 *
 *   schemas:
 *     Error:
 *       type: object
 *       required: [message]
 *       properties:
 *         message:
 *           type: string
 *           example: Unauthorized
 *
 *     FieldError:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 *           example: Missing required fields
 *
 *     User:
 *       type: object
 *       required: [id, name, email, role]
 *       properties:
 *         id:
 *           type: string
 *           example: clxyz1234abcd
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "+1-555-0100"
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 *           example: USER
 *
 *     Transaction:
 *       type: object
 *       required: [id, concept, amount, date, type, user]
 *       properties:
 *         id:
 *           type: string
 *           example: clxyz5678efgh
 *         concept:
 *           type: string
 *           example: Freelance invoice #42
 *         amount:
 *           type: number
 *           example: 1500.00
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2026-03-01T00:00:00.000Z"
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: income
 *         user:
 *           type: object
 *           required: [name]
 *           properties:
 *             name:
 *               type: string
 *               example: Jane Doe
 *
 *     NewTransaction:
 *       type: object
 *       required: [concept, amount, date, type]
 *       properties:
 *         concept:
 *           type: string
 *           example: Grocery shopping
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           example: 85.50
 *         date:
 *           type: string
 *           format: date
 *           description: ISO 8601 date — must not be in the future.
 *           example: "2026-03-05"
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *
 *     UpdateTransaction:
 *       type: object
 *       required: [concept, amount, date, type]
 *       properties:
 *         concept:
 *           type: string
 *           example: Updated grocery shopping
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           example: 90.00
 *         date:
 *           type: string
 *           format: date
 *           description: ISO 8601 date — must not be in the future.
 *           example: "2026-03-05"
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *
 *     ReportSummary:
 *       type: object
 *       required: [totalIncome, totalExpense, currentBalance, transactionCount, incomeCount, expenseCount]
 *       properties:
 *         totalIncome:
 *           type: number
 *           example: 5000.00
 *         totalExpense:
 *           type: number
 *           example: 3200.50
 *         currentBalance:
 *           type: number
 *           example: 1799.50
 *         transactionCount:
 *           type: integer
 *           example: 42
 *         incomeCount:
 *           type: integer
 *           example: 10
 *         expenseCount:
 *           type: integer
 *           example: 32
 *
 *     MonthlyTrend:
 *       type: object
 *       required: [month, income, expense]
 *       properties:
 *         month:
 *           type: string
 *           example: "2026-02"
 *         income:
 *           type: number
 *           example: 2500.00
 *         expense:
 *           type: number
 *           example: 1600.25
 *
 *     DailyTrend:
 *       type: object
 *       required: [date, income, expense]
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2026-03-01"
 *         income:
 *           type: number
 *           example: 1000.00
 *         expense:
 *           type: number
 *           example: 450.75
 *
 *     TopConcept:
 *       type: object
 *       required: [concept, amount]
 *       properties:
 *         concept:
 *           type: string
 *           example: Rent
 *         amount:
 *           type: number
 *           example: 1200.00
 *
 *     Report:
 *       type: object
 *       required: [summary, trends, dailyTrends, topConcepts]
 *       properties:
 *         summary:
 *           $ref: '#/components/schemas/ReportSummary'
 *         trends:
 *           type: array
 *           description: Monthly aggregates ordered ascending by month.
 *           items:
 *             $ref: '#/components/schemas/MonthlyTrend'
 *         dailyTrends:
 *           type: array
 *           description: Daily aggregates ordered ascending by date.
 *           items:
 *             $ref: '#/components/schemas/DailyTrend'
 *         topConcepts:
 *           type: array
 *           maxItems: 5
 *           description: Top 5 expense concepts by total amount (descending).
 *           items:
 *             $ref: '#/components/schemas/TopConcept'
 */

// ---------------------------------------------------------------------------
// JSDoc — Auth endpoints (handled by better-auth, no editable route handler)
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /api/auth/sign-up/email:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new USER account with email/password credentials.
 *     operationId: signUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: s3cr3tP@ss
 *     responses:
 *       200:
 *         description: Account created and session started.
 *       422:
 *         description: Email already in use or password too short.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/auth/sign-in/email:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with email & password
 *     description: Authenticates a user and sets a session cookie (`better-auth.session_token`).
 *     operationId: signIn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: s3cr3tP@ss
 *     responses:
 *       200:
 *         description: Sign-in successful — session cookie is set.
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid email or password
 *
 * /api/auth/sign-out:
 *   post:
 *     tags: [Auth]
 *     summary: Sign out
 *     description: Invalidates the current session and clears the session cookie.
 *     operationId: signOut
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully signed out.
 *
 * /api/auth/get-session:
 *   get:
 *     tags: [Auth]
 *     summary: Get current session
 *     description: Returns the active session and user data for the authenticated caller.
 *     operationId: getSession
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Active session data.
 *       401:
 *         description: No active session.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export {};
