export const openApiSpec = {
    openapi: "3.1.0",
    info: {
        title: "Metric Hub API",
        version: "1.0.0",
        description:
            "REST API for Metric Hub — a personal finance tracker with income/expense management, financial reports, and user administration.\n\n" +
            "## Authentication\n" +
            "All protected endpoints require an active session cookie obtained via the `/api/auth/sign-in/email` endpoint. " +
            "Requests without a valid session receive `401 Unauthorized`.\n\n" +
            "## Roles\n" +
            "- **ADMIN** — full access to all resources (all users transactions, user management)\n" +
            "- **USER** — restricted to own transactions and reports",
        contact: {
            name: "Metric Hub",
        },
    },
    servers: [
        {
            url: "/",
            description: "Current server",
        },
    ],
    tags: [
        { name: "Auth", description: "Authentication & session management (powered by better-auth)" },
        { name: "Transactions", description: "Income and expense transactions" },
        { name: "Reports", description: "Aggregated financial reports" },
        { name: "Users", description: "User management (admin only)" },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "better-auth.session_token",
                description: "Session cookie set automatically after signing in",
            },
        },
        schemas: {
            Error: {
                type: "object",
                properties: {
                    message: { type: "string", example: "Unauthorized" },
                },
                required: ["message"],
            },
            FieldError: {
                type: "object",
                properties: {
                    error: { type: "string", example: "Missing required fields" },
                },
                required: ["error"],
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "string", format: "cuid", example: "clxyz1234abcd" },
                    name: { type: "string", example: "Jane Doe" },
                    email: { type: "string", format: "email", example: "jane@example.com" },
                    phone: { type: "string", nullable: true, example: "+1-555-0100" },
                    role: { type: "string", enum: ["ADMIN", "USER"], example: "USER" },
                },
                required: ["id", "name", "email", "role"],
            },
            Transaction: {
                type: "object",
                properties: {
                    id: { type: "string", format: "cuid", example: "clxyz5678efgh" },
                    concept: { type: "string", example: "Freelance invoice #42" },
                    amount: { type: "number", format: "double", example: 1500.0 },
                    date: { type: "string", format: "date-time", example: "2026-03-01T00:00:00.000Z" },
                    type: { type: "string", enum: ["income", "expense"], example: "income" },
                    user: {
                        type: "object",
                        properties: {
                            name: { type: "string", example: "Jane Doe" },
                        },
                        required: ["name"],
                    },
                },
                required: ["id", "concept", "amount", "date", "type", "user"],
            },
            NewTransaction: {
                type: "object",
                properties: {
                    concept: { type: "string", example: "Grocery shopping" },
                    amount: {
                        type: "number",
                        format: "double",
                        minimum: 0.01,
                        exclusiveMinimum: true,
                        example: 85.5,
                    },
                    date: {
                        type: "string",
                        format: "date",
                        description: "ISO 8601 date string — must not be in the future",
                        example: "2026-03-05",
                    },
                    type: { type: "string", enum: ["income", "expense"], example: "expense" },
                },
                required: ["concept", "amount", "date", "type"],
            },
            CreatedTransaction: {
                type: "object",
                properties: {
                    id: { type: "string", format: "cuid", example: "clxyz9999ijkl" },
                    concept: { type: "string", example: "Grocery shopping" },
                    amount: { type: "string", example: "85.5" },
                    date: { type: "string", format: "date-time", example: "2026-03-05T00:00:00.000Z" },
                    type: { type: "string", enum: ["income", "expense"], example: "expense" },
                    userId: { type: "string", format: "cuid", example: "clxyz1234abcd" },
                },
                required: ["id", "concept", "amount", "date", "type", "userId"],
            },
            ReportSummary: {
                type: "object",
                properties: {
                    totalIncome: { type: "number", example: 5000.0 },
                    totalExpense: { type: "number", example: 3200.5 },
                    currentBalance: { type: "number", example: 1799.5 },
                    transactionCount: { type: "integer", example: 42 },
                    incomeCount: { type: "integer", example: 10 },
                    expenseCount: { type: "integer", example: 32 },
                },
                required: ["totalIncome", "totalExpense", "currentBalance", "transactionCount", "incomeCount", "expenseCount"],
            },
            MonthlyTrend: {
                type: "object",
                properties: {
                    month: { type: "string", example: "2026-02" },
                    income: { type: "number", example: 2500.0 },
                    expense: { type: "number", example: 1600.25 },
                },
                required: ["month", "income", "expense"],
            },
            DailyTrend: {
                type: "object",
                properties: {
                    date: { type: "string", format: "date", example: "2026-03-01" },
                    income: { type: "number", example: 1000.0 },
                    expense: { type: "number", example: 450.75 },
                },
                required: ["date", "income", "expense"],
            },
            TopConcept: {
                type: "object",
                properties: {
                    concept: { type: "string", example: "Rent" },
                    amount: { type: "number", example: 1200.0 },
                },
                required: ["concept", "amount"],
            },
            Report: {
                type: "object",
                properties: {
                    summary: { $ref: "#/components/schemas/ReportSummary" },
                    trends: {
                        type: "array",
                        items: { $ref: "#/components/schemas/MonthlyTrend" },
                        description: "Monthly income/expense aggregates ordered by month (ascending)",
                    },
                    dailyTrends: {
                        type: "array",
                        items: { $ref: "#/components/schemas/DailyTrend" },
                        description: "Daily income/expense aggregates ordered by date (ascending)",
                    },
                    topConcepts: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TopConcept" },
                        maxItems: 5,
                        description: "Top 5 expense concepts by total amount (descending)",
                    },
                },
                required: ["summary", "trends", "dailyTrends", "topConcepts"],
            },
            SignInRequest: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email", example: "jane@example.com" },
                    password: { type: "string", format: "password", example: "s3cr3tP@ss" },
                },
                required: ["email", "password"],
            },
            SignUpRequest: {
                type: "object",
                properties: {
                    name: { type: "string", example: "Jane Doe" },
                    email: { type: "string", format: "email", example: "jane@example.com" },
                    password: { type: "string", format: "password", minLength: 8, example: "s3cr3tP@ss" },
                },
                required: ["name", "email", "password"],
            },
            SessionResponse: {
                type: "object",
                properties: {
                    session: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "sess_abc123" },
                            userId: { type: "string", example: "clxyz1234abcd" },
                            expiresAt: { type: "string", format: "date-time", example: "2026-04-09T00:00:00.000Z" },
                        },
                    },
                    user: { $ref: "#/components/schemas/User" },
                },
            },
        },
    },
    paths: {
        "/api/auth/sign-up/email": {
            post: {
                tags: ["Auth"],
                summary: "Register a new user",
                description: "Creates a new USER account with email/password credentials.",
                operationId: "signUp",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/SignUpRequest" },
                            example: {
                                name: "Jane Doe",
                                email: "jane@example.com",
                                password: "s3cr3tP@ss",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Account created and session started",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SessionResponse" },
                            },
                        },
                    },
                    "422": {
                        description: "Validation error (e.g. email already in use, password too short)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },
        "/api/auth/sign-in/email": {
            post: {
                tags: ["Auth"],
                summary: "Sign in with email & password",
                description: "Authenticates a user and sets a session cookie (`better-auth.session_token`).",
                operationId: "signIn",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/SignInRequest" },
                            example: {
                                email: "jane@example.com",
                                password: "s3cr3tP@ss",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Sign-in successful — session cookie is set",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SessionResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid credentials",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Invalid email or password" },
                            },
                        },
                    },
                },
            },
        },
        "/api/auth/sign-out": {
            post: {
                tags: ["Auth"],
                summary: "Sign out",
                description: "Invalidates the current session and clears the session cookie.",
                operationId: "signOut",
                security: [{ cookieAuth: [] }],
                responses: {
                    "200": {
                        description: "Successfully signed out",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean", example: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/auth/get-session": {
            get: {
                tags: ["Auth"],
                summary: "Get current session",
                description: "Returns the active session and user data for the authenticated caller.",
                operationId: "getSession",
                security: [{ cookieAuth: [] }],
                responses: {
                    "200": {
                        description: "Active session data",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SessionResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "No active session",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Unauthorized" },
                            },
                        },
                    },
                },
            },
        },
        "/api/transactions": {
            get: {
                tags: ["Transactions"],
                summary: "List transactions",
                description:
                    "Returns a list of transactions ordered by date (newest first).\n\n" +
                    "- **ADMIN** — all users' transactions\n" +
                    "- **USER** — only their own transactions",
                operationId: "listTransactions",
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: "days",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, example: 30 },
                        description: "Filter to transactions in the last N days. Omit to return all transactions.",
                    },
                ],
                responses: {
                    "200": {
                        description: "Array of transactions",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Transaction" },
                                },
                                example: [
                                    {
                                        id: "clxyz5678efgh",
                                        concept: "Freelance invoice #42",
                                        amount: 1500.0,
                                        date: "2026-03-01T00:00:00.000Z",
                                        type: "income",
                                        user: { name: "Jane Doe" },
                                    },
                                    {
                                        id: "clxyz5678mnop",
                                        concept: "Grocery shopping",
                                        amount: 85.5,
                                        date: "2026-02-28T00:00:00.000Z",
                                        type: "expense",
                                        user: { name: "Jane Doe" },
                                    },
                                ],
                            },
                        },
                    },
                    "401": {
                        description: "Not authenticated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Unauthorized" },
                            },
                        },
                    },
                    "500": {
                        description: "Internal server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FieldError" },
                                example: { error: "Failed to fetch transactions" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Transactions"],
                summary: "Create a transaction",
                description: "Records a new income or expense transaction for the authenticated user.",
                operationId: "createTransaction",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/NewTransaction" },
                            example: {
                                concept: "Grocery shopping",
                                amount: 85.5,
                                date: "2026-03-05",
                                type: "expense",
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Transaction created successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreatedTransaction" },
                                example: {
                                    id: "clxyz9999ijkl",
                                    concept: "Grocery shopping",
                                    amount: "85.5",
                                    date: "2026-03-05T00:00:00.000Z",
                                    type: "expense",
                                    userId: "clxyz1234abcd",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FieldError" },
                                examples: {
                                    missingFields: {
                                        summary: "Missing required fields",
                                        value: { error: "Missing required fields" },
                                    },
                                    invalidType: {
                                        summary: "Invalid transaction type",
                                        value: { error: "Invalid transaction type" },
                                    },
                                    invalidAmount: {
                                        summary: "Amount must be positive",
                                        value: { error: "Amount must be greater than 0" },
                                    },
                                    invalidDate: {
                                        summary: "Unparseable date",
                                        value: { error: "Invalid date" },
                                    },
                                    futureDate: {
                                        summary: "Date in the future",
                                        value: { error: "Date cannot be in the future" },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Not authenticated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Unauthorized" },
                            },
                        },
                    },
                    "500": {
                        description: "Internal server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FieldError" },
                                example: { error: "Failed to create transaction" },
                            },
                        },
                    },
                },
            },
        },
        "/api/reports": {
            get: {
                tags: ["Reports"],
                summary: "Get financial report",
                description:
                    "Returns aggregated financial data for the specified time window.\n\n" +
                    "- **ADMIN** — aggregates across all users\n" +
                    "- **USER** — aggregates for own transactions only\n\n" +
                    "The `days` parameter defaults to **30** and is capped at **365**.",
                operationId: "getReport",
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: "days",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, maximum: 365, default: 30, example: 90 },
                        description: "Number of days to look back from today. Capped at 365.",
                    },
                ],
                responses: {
                    "200": {
                        description: "Financial report",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Report" },
                                example: {
                                    summary: {
                                        totalIncome: 5000.0,
                                        totalExpense: 3200.5,
                                        currentBalance: 1799.5,
                                        transactionCount: 42,
                                        incomeCount: 10,
                                        expenseCount: 32,
                                    },
                                    trends: [
                                        { month: "2026-01", income: 2500.0, expense: 1600.25 },
                                        { month: "2026-02", income: 2500.0, expense: 1600.25 },
                                    ],
                                    dailyTrends: [
                                        { date: "2026-03-01", income: 1000.0, expense: 450.75 },
                                        { date: "2026-03-02", income: 0, expense: 200.0 },
                                    ],
                                    topConcepts: [
                                        { concept: "Rent", amount: 1200.0 },
                                        { concept: "Groceries", amount: 600.0 },
                                        { concept: "Utilities", amount: 300.5 },
                                        { concept: "Transport", amount: 200.0 },
                                        { concept: "Dining out", amount: 150.75 },
                                    ],
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Not authenticated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Unauthorized" },
                            },
                        },
                    },
                    "500": {
                        description: "Internal server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Internal Server Error" },
                            },
                        },
                    },
                },
            },
        },
        "/api/users": {
            get: {
                tags: ["Users"],
                summary: "List users",
                description: "Returns all registered users. **Requires ADMIN role.**",
                operationId: "listUsers",
                security: [{ cookieAuth: [] }],
                responses: {
                    "200": {
                        description: "Array of users",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/User" },
                                },
                                example: [
                                    {
                                        id: "clxyz1234abcd",
                                        name: "Jane Doe",
                                        email: "jane@example.com",
                                        phone: "+1-555-0100",
                                        role: "ADMIN",
                                    },
                                    {
                                        id: "clxyz5678efgh",
                                        name: "John Smith",
                                        email: "john@example.com",
                                        phone: null,
                                        role: "USER",
                                    },
                                ],
                            },
                        },
                    },
                    "401": {
                        description: "Not authenticated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Unauthorized" },
                            },
                        },
                    },
                    "403": {
                        description: "Authenticated but not an ADMIN",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Forbidden" },
                            },
                        },
                    },
                    "500": {
                        description: "Internal server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FieldError" },
                                example: { error: "Failed to fetch users" },
                            },
                        },
                    },
                },
            },
        },
        "/api/users/{id}": {
            patch: {
                tags: ["Users"],
                summary: "Update a user",
                description:
                    "Updates a user's `name` and/or `role`. **Requires ADMIN role.**\n\n" +
                    "Both `name` and `role` must be provided in the request body.",
                operationId: "updateUser",
                security: [{ cookieAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "cuid", example: "clxyz5678efgh" },
                        description: "CUID of the user to update",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "John Smith Jr." },
                                    role: { type: "string", enum: ["ADMIN", "USER"], example: "ADMIN" },
                                },
                                required: ["name", "role"],
                            },
                            example: {
                                name: "John Smith Jr.",
                                role: "ADMIN",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Updated user",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" },
                                example: {
                                    id: "clxyz5678efgh",
                                    name: "John Smith Jr.",
                                    email: "john@example.com",
                                    phone: null,
                                    role: "ADMIN",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Missing or invalid fields",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FieldError" },
                                example: { error: "Invalid fields" },
                            },
                        },
                    },
                    "401": {
                        description: "Not authenticated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Unauthorized" },
                            },
                        },
                    },
                    "403": {
                        description: "Authenticated but not an ADMIN",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { message: "Forbidden" },
                            },
                        },
                    },
                    "500": {
                        description: "Internal server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/FieldError" },
                                example: { error: "Failed to update user" },
                            },
                        },
                    },
                },
            },
        },
    },
} as const;
