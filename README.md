# PulseDesk

A modern, workspace-first project management application built with the MERN stack.

## Features

- **Workspace Isolation** — Every user gets a private workspace with complete data separation
- **Role-Based Access** — Head (Owner), Admin, and Member roles with granular permissions
- **Passkey System** — Secure workspace join flow with formatted passkeys (PD-XXXX-XXXX-XXXX)
- **Join Request Approval** — Head must approve all workspace join requests
- **Project & Task Management** — Create, assign, and track projects and tasks within your workspace
- **Team Management** — View members, manage roles, and remove users
- **Real-time Dashboard** — Statistics, activity feed, and workspace overview

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT-based authentication

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# Clone the repo
git clone https://github.com/Abhinav-Tiwari1674/PulseDesk.git
cd PulseDesk

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `server/.env` file:

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Run Development Servers

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

## License

MIT
