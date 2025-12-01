# Maseno Radio - MERN Application

Modern content platform built with the MERN stack. The project bundles three apps (public client, admin dashboard, and API server) and now ships with a hardened authentication flow for email/password and Google OAuth.

---

## At a Glance

- **Tech stack**: React 18, Zustand, Tailwind CSS, Node.js, Express, MongoDB, JWT, Google OAuth.
- **Key features**: Dynamic blog feeds, writer analytics, follower management, dark/light themes, responsive design, OTP email verification for writers.
- **Security updates**:
  - Removed query-string credential leaks in favour of secure POST flows.
  - Normalised user accounts with provider-aware records (`credentials` vs `google`).
  - Centralised JWT issuing, strict validation, and consistent sanitisation of user payloads.
  - Client-side store now persists auth state safely and injects bearer tokens into API calls.

---

## Repository Layout

```
MERN-app/
├── client/         # Public React front-end
├── admin/          # Admin dashboard (React)
├── server/         # Express API + MongoDB models
├── package.json    # Workspace scripts
└── README.md       # You are here
```

---

## Authentication Overview

**Email & Password**
- `POST /api/auth/signup` registers a user, hashing passwords with bcrypt.
- `POST /api/auth/login` verifies credentials, enforces writer email verification, and issues a short-lived JWT.

**Google OAuth**
- `POST /api/auth/google` accepts an OAuth access token, verifies it with Google, and links or creates the account server-side.
- Both email and Google flows respond with `{ success, message, token, user }`.

**Session Handling**
- JWTs are stored client-side (localStorage) through Zustand. The store exposes `signIn` and `signOut` helpers and automatically applies the bearer token to Axios requests.
- `GET /api/auth/me` returns the hydrated user profile for active sessions.

---

## Security Practices

- Never send credentials via query strings or GET parameters.
- JWT secret lives in `server/.env` (`JWT_SECRET_KEY`). Rotate regularly.
- `UserModel` now hides the password by default and tracks provider metadata plus last login time.
- Google tokens are verified straight with Google; no client-side userinfo calls are trusted.
- Error messages are normalised to avoid leaking stack traces in production.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (ships with Node 18)
- MongoDB Atlas cluster or self-hosted MongoDB instance
- Google Cloud project with OAuth Client ID (for social login)
- Firebase project (for optional media uploads)

### Installation

Clone the repo and install workspace dependencies:

```bash
git clone https://github.com/<your-org>/MERN-app.git
cd MERN-app
npm install
```

From the project root you can use:

- `npm run dev:server` - starts the Express API with nodemon.
- `npm run dev:client` - starts the public React app (port 3000).
- `npm run dev:admin` - starts the admin dashboard.

> Tip: run each command in its own terminal.

---

## Environment Variables

Create `.env` files per app.

### `server/.env`

```
PORT=8800
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster-url/maseno
JWT_SECRET_KEY=super-secret-change-me
AUTH_EMAIL=otp-sender@example.com
AUTH_PASSWORD=app-specific-password
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### `client/.env`

```
REACT_APP_API_URL=http://localhost:8800/api
REACT_APP_GOOGLE_CLIENT_ID=<google-oauth-client-id>
REACT_APP_FIREBASE_API_KEY=<firebase-api-key>
```

### `admin/.env`

```
REACT_APP_FIREBASE_API_KEY=<firebase-api-key>
```

Never commit `.env` files to source control.

---

## API Reference (Auth)

| Method | Endpoint            | Description                               |
| ------ | ------------------- | ----------------------------------------- |
| POST   | `/api/auth/signup`  | Create an account (email + password).     |
| POST   | `/api/auth/login`   | Sign in with email/password credentials.  |
| POST   | `/api/auth/google`  | Sign in or sign up with Google OAuth.     |
| GET    | `/api/auth/me`      | Fetch currently authenticated user.       |

Responses always include `success`, `message`, and `user`; `signup`, `login`, and `google` also include a signed `token`.

---

## Front-End Notes

- Global authentication state is managed by `client/src/store/index.js`.
- `saveUserInfo` centralises token persistence, toast feedback, and safe redirects after login/signup.
- Axios helpers live in `client/src/utils/apiCalls.js` and automatically apply the bearer token via `setAuthHeader`.
- The sign-in and sign-up pages are fully dynamic:
  - Email flows post to the API.
  - Google button only renders when `REACT_APP_GOOGLE_CLIENT_ID` exists.
  - Loading states surface through Zustand’s `setIsLoading`.

---

## Admin Dashboard

- Located in `admin/`.
- Mirrors client theming and uses the same API for content management.
- Ensure admin users are provisioned in the database with the appropriate `accountType`.

---

## Troubleshooting

- **Invalid Google token**: confirm the OAuth client is configured for `http://localhost:3000` and you are passing the `access_token` returned by Google.
- **JWT rejected**: token expired or `Authorization` header missing. Call `signOut()` to clear stale tokens.
- **Email verification**: writer accounts receive OTP emails via the `AUTH_EMAIL`/`AUTH_PASSWORD` SMTP credentials. Ensure the sender allows less-secure app access or use an app password.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/auth-hardening`).
3. Commit with context-rich messages.
4. Ensure linting passes (`npm run lint` in the respective workspace).
5. Open a pull request detailing the change and test coverage.

---

## License

This project is proprietary to Maseno Radio. Contact the maintainers for usage rights.
