# FitCoach Frontend TODO

## Current Context

The current dashboard is client-only. Trainers are redirected away from `/dashboard` and do not yet have a trainer workspace.

Implemented and verified client flows:

- Load assigned and client-created workouts.
- Create a personal routine with exercises, sets, reps, and weight.
- Log empty workouts.
- Log assigned routines, currently using prescribed values and completion checkboxes.
- Display recent session activity.
- Export a client-side workout share card.
- Demo client `tuna@gmail.com` can authenticate and log a session persisted to PostgreSQL.
- Demo Leg, Push, and Pull routines are represented by the shared data module and are also seeded and assigned in the database.
- Docker startup waits for PostgreSQL readiness before starting the backend.

Known dummy or incomplete UI:

- The dashboard still has a client-side fallback for the curated Leg, Push, and Pull routines when API data is unavailable; it now matches the seeded routines but is not a substitute for API data.
- Hardcoded monthly report values and milestone data.
- "Edit" routine action opens the create flow instead of editing the selected routine.
- RPE input is missing.
- Assigned-session logging does not allow actual reps or weight to differ from targets.
- Session save errors are swallowed in the routine and empty workout views, so success can be shown when the API failed.
- No trainer dashboard or trainer navigation.
- No UI for client relationships, assignments to multiple clients, progress analytics, injuries, measurements, goals, or messages.

## Product Work To Build

- [ ] Add trainer route protection and a trainer dashboard shell. Authentication works, but trainers currently land outside the client dashboard.
- [ ] Add trainer-client relationship screens: pending requests, active clients, accept/reject/end actions.
- [ ] Add trainer client selector and assignment workflow for workout templates.
- [ ] Separate reusable trainer templates from client-owned routines.
- [ ] Add template edit and duplicate flows.
- [ ] Improve assigned workout logging to capture actual reps, weight, and RPE per set.
- [ ] Add session error handling that preserves unsaved input and only shows success after a confirmed API response.
- [ ] Add PR feedback and PR history views.
- [ ] Add trainer progress view with volume trends, PR history, and planned-versus-completed adherence.
- [ ] Add client and trainer injury forms with affected-area warnings before exercise selection or assignment.
- [ ] Add body measurement history and goals screens for clients.
- [ ] Add relationship-scoped messaging screens for clients and trainers.
- [ ] Replace hardcoded monthly report data with API-backed data.
- [ ] Replace client-side fallback routines with clearly labeled empty/error states or API-backed templates.

## Steps I Will Follow

1. Confirm the API contract and authenticated role for the screen being changed.
2. Identify the owning React screen/component and its nearest existing pattern.
3. Add the smallest route, state, and API client changes needed for one vertical slice.
4. Keep loading, empty, validation, unauthorized, and API-error states explicit.
5. Connect the UI to persisted backend data; do not use hardcoded success or report values.
6. Verify client and trainer access separately.
7. Run the focused frontend lint/build or relevant test after each slice.
8. Check responsive behavior for desktop and mobile layouts.
9. Update this file when a feature becomes genuinely end-to-end complete.
