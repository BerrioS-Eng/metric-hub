import swaggerJsdoc from "swagger-jsdoc";

// Generate the OpenAPI spec at request time by scanning JSDoc annotations
// across all API route files and the shared schemas file.
const spec = swaggerJsdoc({
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Metric Hub API",
            version: "1.0.0",
            description:
                "REST API for Metric Hub — a personal finance tracker.\n\n" +
                "## Authentication\n" +
                "Protected endpoints require a session cookie obtained via `/api/auth/sign-in/email`.\n\n" +
                "## Roles\n" +
                "- **ADMIN** — full access to all resources\n" +
                "- **USER** — restricted to own transactions",
        },
        tags: [
            { name: "Auth", description: "Authentication & session management (better-auth)" },
            { name: "Transactions", description: "Income and expense transactions" },
            { name: "Reports", description: "Aggregated financial reports (ADMIN only)" },
            { name: "Users", description: "User management (ADMIN only)" },
        ],
    },
    // Scan route handlers and the shared schemas file for @openapi JSDoc blocks.
    apis: [
        "./src/lib/schemas.ts",
        "./src/app/api/transactions/route.ts",
        "./src/app/api/reports/route.ts",
        "./src/app/api/users/route.ts",
        "./src/app/api/users/[id]/route.ts",
    ],
});

export function GET() {
    return Response.json(spec);
}
