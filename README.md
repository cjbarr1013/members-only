# Members Only

### [LIVE WEBSITE](https://members-only-production-0f4f.up.railway.app)

Basic social media site made as part of [The Odin Project](https://www.theodinproject.com/lessons/node-path-nodejs-members-only). Try it out above!

## Tech Stack
- Node.js + Express
- EJS templates
- Tailwind CSS
- PostgreSQL
- Passport (local strategy)
- Multer (memoryStorage) + Cloudinary
- express-validator
- Flowbite components

## Features
- Express + Node.js full-stack application following MVC structure
  - Clear separation of concerns: routes → controllers → views → utils.
  - Controllers orchestrate validation, auth, DB calls, and view rendering.
  - Reusable helpers for formatting and Cloudinary URL generation.

- PostgreSQL data layer
  - Centralized query module for users, posts, comments, and sessions.
  - Session storage backed by Postgres (connect-pg-simple).
  - DB utilities for seeding/clearing data to support development and tests.

- Authentication and Validation (Passport + sessions + express-validator)
  - Local strategy with bcrypt password hashing.
  - Persistent login via secure cookie-based sessions.
  - Sign-in, sign-up, and sign-out flows.
  - Auth guards (middleware) for protected routes and ownership checks.
  - Validation for user input provided by express-validator.
 
- Authorization (role-based)
  - Route-level middleware enforces permissions for basic, member, and admin users.

| Role                  | Read post | Visit post | Visit profiles | Create posts/comments | Delete posts/comments | Sign-in | Register | Sign-out |
|-----------------------|-----------|------------|----------------|-----------------------|-----------------------|---------|----------|----------|
| Basic (not signed-in) | X         |            |                |                       |                       | X       | X        |          |
| Member                | X         | X          | X              | X                     |                       |         |          | X        |
| Admin                 | X         | X          | X              | X                     | X                     |         |          | X        |

- Cloudinary image pipeline (optimized)
  - Multer memoryStorage parses file uploads.
  - Uploads stored under a scoped folder with overwrite + invalidate.
  - Versioned delivery URLs ensure cache-busting on replacement.
  - Delivery transforms: face-aware crop, exact sizes, and f_auto/q_auto for modern formats and adaptive quality.
  - URL analytics disabled to minimize tracking params.
 
- Accessible, responsive UI (EJS + Tailwind + Flowbite)
  - Tailwind for utility-first styling; production build purged and minified.
  - Components (modals, sidebar) made keyboard- and screen-reader-friendly:
  - Sidebar focus management toggles tabbability when opened/closed.
  - Light/Dark modes that adapt to user preferences
  - Flash messages to alert the user of completed or rejected actions
  
- Full integration tests (Jest + Supertest/Superagent)
  - Global DB setup/teardown to run tests against a real Postgres instance.
  - Tests cover end-to-end flows: auth, permissions, posting, comments, and image upload paths.
  - Deterministic environment for reliable testing.
