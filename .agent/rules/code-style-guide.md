---
trigger: always_on
---

Naming Conventions:
   - Variables/Functions: camelCase
   - Constants: UPPER_CASE
   - Private members: _underscore prefix
   - Interfaces: IUser, IProduct
   - Types: TUser, TProduct
   - Components: PascalCase
   - Files: kebab-case or PascalCase for components

TypeScript Strictness:
   - Enable strict mode in tsconfig.json
   - Type everything (functions, variables, parameters)
   - Avoid 'any' type - use 'unknown' if type is uncertain
   - Use Zod schemas and infer types: z.infer<typeof schema>
   - Prefer type inference over explicit types when obvious

Architecture Patterns:
    - Clean Architecture principles

Error Handling Strategy:
    - Use try-catch blocks for ALL risky operations
    - Implement global error handler
    - Log errors with context and stack traces
    - Return user-friendly error messages
    - NEVER expose internal errors or stack traces to users
Error Tracking:
    - Use Sentry for error monitoring
    - Track errors across all environments
    - Set up alerts for critical errors
Input Validation:
    - Use Zod for all input validation
    - Validate API requests, form inputs, external data
    - Create reusable schemas
    - Infer TypeScript types from Zod schemas

Type Safety:
    - Enable TypeScript strict mode
    - No implicit any
    - Type all function parameters and return types
    - Use type guards for runtime checks
    - Leverage utility types: Partial, Pick, Omit, Record
Tailwind CSS Custom Rules:
    - Use `bg-linear-to-br` instead of `bg-gradient-to-br`
    - Use `bg-linear-to-r` instead of `bg-gradient-to-r`
    - More custom gradient rules may be added later