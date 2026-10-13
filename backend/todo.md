# FitCoach Backend TODO

## Current Context

The schema contains tables for relationships, workout assignments, sessions, sets, PRs, injuries, goals, measurements, and messages. The exposed API currently covers users, exercises, workouts, and sessions only.

Implemented and verified backend behavior:

- Authenticated user registration, login, logout, refresh, and current-user lookup.
- Exercise search.
- Workout creation, retrieval, listing, and update.
- Client-owned workouts and assignment validation for an active trainer-client relationship.
- Single-client workout assignment during workout creation.
- Session creation with completed reps and weight.
- Recent session aggregation with volume, set counts, and a PR count query.
- Fresh-container seed creates a development trainer, the `TunaMayo` client, their active relationship, and three assigned routines.
- Bcrypt demo credentials work with the normal login flow.
- Docker Compose waits for PostgreSQL readiness before starting the backend.
- A client session has been verified in PostgreSQL with persisted session, exercise, and set rows.

Known backend gaps:

- The demo relationship is seeded, but there are no coach-client relationship routes or controllers.
- No trainer client-management workflow.
- No multi-client assignment endpoint or assignment management endpoint.
- Session creation does not accept or persist RPE.
- No automatic PR calculation or inserts into `personal_records`.
- No progress, adherence, or trend endpoints.
- No injury routes, exercise-area matching, or avoidance warnings.
- No measurement or goal routes.
- No message routes or relationship authorization for messages.
- Recent-session PR count reads `personal_records`, but nothing currently populates that table.

## API and Domain Work To Build

- [ ] Add relationship endpoints: request, list, accept, reject, end, and status checks.
- [ ] Add shared relationship authorization helpers for trainer/client resources.
- [ ] Add trainer template endpoints with create, read, update, archive, and duplicate behavior.
- [ ] Add assignment endpoints supporting one or more active clients, status changes, and assignment history.
- [ ] Extend session validation and inserts to persist per-set RPE and optional notes.
- [ ] Implement transactional PR detection for max weight, max reps, and max volume per client/exercise.
- [ ] Add PR history and progress aggregation endpoints.
- [ ] Add planned-versus-completed adherence calculations from assignments and sessions.
- [ ] Add injury CRUD endpoints and affected-body-area exercise matching.
- [ ] Add measurement history and goal CRUD endpoints.
- [ ] Add relationship-scoped message list and send endpoints.
- [ ] Add indexes and constraints needed for the new query paths.
- [ ] Add API tests for role checks, ownership, relationship scope, validation, and transactional behavior.

## Steps I Will Follow

1. Inspect the existing schema, route registration, auth middleware, and controller conventions.
2. Define the smallest request and response contract for one feature slice.
3. Add or verify database constraints and indexes before writing queries.
4. Implement authorization at the backend boundary, not only in the frontend.
5. Use parameterized SQL and transactions for multi-table writes.
6. Return consistent `ApiResponse` and `ApiError` results.
7. Add focused tests for allowed roles, forbidden users, invalid payloads, and happy paths.
8. Register routes in `app.js` and verify they are reachable through the authenticated API.
9. Run backend lint/tests or a focused API smoke check after each slice.
10. Update this file only when the feature is persisted, authorized, and verified end to end; the demo seed assigns three routines to the client.
