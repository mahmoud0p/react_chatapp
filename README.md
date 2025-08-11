# 💬 React ChatApp — Real-Time Messaging

A **real-time chat application** built with **React**, **PostgreSQL**, and **Prisma**. This project demonstrates fast, reliable real-time messaging with a clean UI and a type-safe backend. Use it as a learning project, demo, or foundation for a production-ready chat platform.

---

## 🚀 Tech Stack & Key Tools

### **Frontend**
- **React** — Component-based UI library for building the chat interface.
- **TypeScript** — Static typing for safer, more maintainable code.
- **Tailwind CSS** (or SCSS) — Utility-first styling for responsive UIs.
- **Socket.IO** (or WebSocket) — Real-time, event-driven communication between clients and server.
- **react-chat-elements** — Optional prebuilt chat UI components (message bubbles, avatars, lists).
- **React Router** — Client-side routing if multiple screens are required.

### **Backend / Database**
- **Node.js + Express** — Typical lightweight server to serve APIs and manage socket connections.
- **PostgreSQL** — Persistent relational database for users, messages, rooms, and metadata.
- **Prisma ORM** — Type-safe database client, schema migrations, and developer ergonomics for PostgreSQL.
- **JWT Authentication** — (Optional) For securing endpoints and identifying users.

### **Dev Tools**
- **ESLint & Prettier** — Code quality and formatting.
- **Nodemon / ts-node-dev** — Development server auto-reload.
- **Docker** (optional) — Containerize the app and PostgreSQL for reproducible dev environments.

---

## ✨ Features

- 📡 **Real-time messaging** — Messages appear instantly across clients.
- 🗂 **Room / channel support** — Separate conversations by room or topic.
- 💾 **Persistent storage** — Messages and users stored in PostgreSQL via Prisma.
- 📱 **Responsive UI** — Mobile-first layout using Tailwind.
- 🧩 **Extensible architecture** — Easy to add auth, file uploads, presence, etc.

---

## 📂 Project Structure (example)

```

/src
/components      # ChatList, MessageBubble, InputBar, Avatar
/hooks           # useSocket, useAuth, useMessages
/pages or /routes # App routes (if using React Router)
/styles          # Tailwind or SCSS files
App.tsx          # Main app component
/prisma
schema.prisma    # Prisma schema for PostgreSQL

package.json
README.md
.env (local, not committed)

````

---

## 🗄 Database Setup (PostgreSQL + Prisma)

1. Create a `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
````

2. Initialize Prisma and create your schema (`/prisma/schema.prisma`). Example model:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  messages  Message[]
  createdAt DateTime @default(now())
}

model Message {
  id        String   @id @default(uuid())
  text      String
  senderId  String
  roomId    String
  createdAt DateTime @default(now())
  sender    User     @relation(fields: [senderId], references: [id])
}
```

3. Run migrations and generate the client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Use the generated Prisma client in your server code:

```ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

---

## 🛠 Installation & Local Development

```bash
git clone https://github.com/mahmoud0p/react_chatapp.git
cd react_chatapp
npm install
```

Add your `.env` (DATABASE\_URL, JWT secret, any provider keys) then run:

```bash
# start the backend (example)
npm run dev:server
# start the frontend
npm run dev
```

> Replace the scripts above with whatever your repository uses (e.g. `start`, `dev`, or separate `server` and `client` commands).

---

## 🧭 Common Scripts (example)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "vite preview",
    "dev:server": "ts-node-dev --respawn --transpile-only src/server/index.ts",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate"
  }
}
```

---

## 🛡 Security & Best Practices

* Never commit `.env` or secrets.
* Use `express-rate-limit` and input validation to protect endpoints.
* Sanitize and validate user input before persisting.
* Consider message encryption at rest if sensitive data is stored.

---

## ✅ Future Enhancements

* 🔑 Authentication (JWT / OAuth providers)
* ✅ Read receipts and typing indicators
* 🗃️ Message search and pagination
* 📎 File/image uploads with CDN storage (S3)
* 🔒 End-to-end encryption (optional)
* 📈 Analytics and admin dashboard
