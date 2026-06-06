# DECISIONS.md

> Keep this short. Bullets are fine. Be specific and honest. We read every word.

## The feature: assignees + filtering

**What I built**
- Added an `assignee_id` field to the `tasks` table and seeded data.
- Updated API routes to support filtering and updating the assignee.
- Added a dropdown to assign tasks on creation and inline in the task list, plus a filter in the main view.

**Decisions I made on the ambiguous parts**
- How I handled tasks with no assignee: Left the `assignee_id` as `null` in the DB and added an "Unassigned" option in the UI dropdowns.
- Single-select vs multi-select filter, and why: Single-select to keep the UI simple and functional as per the "no gold-plating" rule.
- How the assignee filter interacts with the existing status/search filter: It stacks with them via logical `AND` on the backend query.
- Where the filter state lives (URL, local state, etc.) and why: Local state (`useState` in `App.tsx`) to match the existing pattern for the `status` and `search` filters. 

**Anything I assumed instead of asking**
- I assumed it was fine to fetch the users once on app mount rather than on every render, since the app doesn't currently support creating/deleting users.

## The bug

- What the bug was: A race condition where typing rapidly in the search bar would trigger multiple asynchronous `fetchTasks` calls. Out-of-order responses could overwrite the state with stale data, leaving the UI out of sync with the input box.
- How I found it: The hint "try using the app the way an impatient user would" strongly pointed toward rapid typing, and examining the `useEffect` showed no cleanup or ignore flag.
- Why my fix is correct (and not just "it stopped happening"): Using an `ignore` flag in the `useEffect` cleanup function guarantees that only the result of the *latest* fetch request is written to state, cleanly preventing stale updates regardless of network delays.
- Anything similar I noticed but didn't fix: The `NewTaskForm` could technically face duplicate submissions if double-clicked, but React's synthetic events usually handle basic debouncing, and we await the network call.

## Tradeoffs

- What I deliberately did NOT do, and why: I did not extract the filters into URL parameters (e.g., using React Router). While better for shareability, it would require introducing a new library and expanding the scope significantly beyond the existing local state pattern.
- Where I leaned on AI, and what I changed or rejected from what it gave me: I used an AI coding assistant to help scaffold the Docker configuration and the Jenkins deployment pipeline. I rejected the AI's initial suggestion to extract the frontend state into URL parameters via React Router, as I wanted to strictly adhere to the project's existing `useState` patterns. I also manually verified the race-condition `ignore` flag logic to ensure it wasn't a hallucination.

## If I had more time

- Next thing I'd do: Debounce the search input so we don't spam the API with a request for every keystroke. Add basic error boundaries and toast notifications for network failures.
- Where this design breaks at 10x or 100x the data: The frontend `fetchTasks` currently returns all rows without pagination. The `<select>` for assignees would become unusable if there were thousands of users.
- One thing about the existing codebase I'd want to refactor and why: Move the API logic in `tasks.ts` into a dedicated controller or service layer to separate HTTP routing from business logic and database access.

## Time spent

- Roughly: 1 hours

## Deployment (optional)

- Live URL (if deployed): https://folixxtasks.ibrands.ng
- GitHub Repository: https://github.com/puzzo-dev/teamtasksComplete
- How I hosted it: Containerized the frontend (Nginx) and backend (Express/SQLite) using Docker, and built a declarative Jenkins CI/CD pipeline to push the images to the GitHub Container Registry. The pipeline automatically SSHs into a production VPS, pulls the latest images, and orchestrates a zero-downtime deployment using `docker-compose` behind a Traefik reverse proxy.
- What I'd harden before real production: I would add authentication, sanitize all inputs to prevent SQL injection, set up rate limiting, and use connection pooling for the database instead of `better-sqlite3`'s direct file access if high concurrency is expected.
