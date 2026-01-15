# FluxBoard

![FluxBoard Banner](https://capsule-render.vercel.app/api?type=waving&color=0f111a&height=300&section=header&text=FluxBoard&fontSize=90&fontColor=4f85f6&animation=fadeIn&fontAlignY=38&desc=High-Performance%20Real-Time%20Collaboration%20Platform&descAlignY=51&descAlign=50)

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

<br />

<p align="center">
  <b>FluxBoard</b> is a production-grade Kanban collaboration platform engineered to demonstrate mastery of concurrency, state management, and distributed systems architecture. It features a "Gemini-inspired" deep space aesthetic and a robust real-time engine.
</p>

---

## 📑 Table of Contents

-   [✨ Key Features](#-key-features)
-   [🏗️ Architecture](#️-architecture)
-   [🛠️ Tech Stack](#️-tech-stack)
-   [🏁 Getting Started](#-getting-started)
-   [🔐 Environment Variables](#-environment-variables)
-   [📦 Project Structure](#-project-structure)

---

## ✨ Key Features

*   **⚡ Real-Time Collaboration**: Sub-millisecond updates across all connected clients via **Socket.io**.
*   **🧠 Optimistic UI**: Instant visual feedback for drag-and-drop actions, ensuring a snappy user experience regardless of network latency.
*   **🔒 Concurrency Control**: Visual locking mechanism prevents race conditions when multiple users edit the same card.
*   **🚀 High-Performance Caching**: Implements a **Write-Behind** strategy using **Redis** and **BullMQ** to buffer high-frequency events before persisting to **PostgreSQL**.
*   **🔢 Efficient Ordering**: Uses the **Lexorank** algorithm for O(1) list reordering, avoiding heavy database updates.
*   **🛡️ Secure Authentication**: Robust JWT-based auth stored in HttpOnly cookies with CSRF protection.
*   **🎨 Premium UX**: Modern interface featuring glassmorphism, aurora gradients, and smooth animations powered by **Framer Motion**.

---

## 🏗️ Architecture

FluxBoard follows a distributed microservices-ready architecture:

1.  **Frontend**: React client with TanStack Query for state and Socket.io for live events.
2.  **Gateway**: NestJS WebSocket Gateway handles real-time connections and broadcasts.
3.  **Hot Storage**: Redis stores active board states and handles pub/sub for scalability.
4.  **Write-Behind**: BullMQ processes persist changes to the database asynchronously.
5.  **Cold Storage**: PostgreSQL serves as the source of truth.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 18** | UI Library with Hooks |
| | **TypeScript** | Static Typing |
| | **Vite** | Next-gen Build Tool |
| | **Tailwind CSS v4** | Utility-first Styling |
| | **Framer Motion** | Animation Library |
| | **@hello-pangea/dnd** | Drag and Drop logic |
| **Backend** | **NestJS** | Progressive Node.js Framework |
| | **Socket.io** | Real-time Engine |
| | **TypeORM** | ORM for PostgreSQL |
| | **BullMQ** | Job Queue for write-behind |
| **Data** | **PostgreSQL** | Relational Database |
| | **Redis** | In-memory Cache & Pub/Sub |
| **DevOps** | **Docker** | Containerization |

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **Docker** & **Docker Compose**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/fluxboard.git
    cd fluxboard
    ```

2.  **Start Infrastructure (DB & Cache)**
    ```bash
    docker compose up -d
    ```

3.  **Setup Backend**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    npm run start:dev
    ```
    *The backend server will start on port 3000.*

4.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    *The frontend will start on port 5173.*

5.  **Access the App**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `flux` |
| `POSTGRES_PASSWORD` | Database password | `password123` |
| `POSTGRES_DB` | Database name | `fluxboard` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret for signing tokens | **CHANGE_THIS** |
| `FRONTEND_URL` | CORS Origin URL | `http://localhost:5173` |

---

## 📦 Project Structure

```bash
fluxboard/
├── backend/                 # NestJS API & WebSocket Server
│   ├── src/
│   │   ├── auth/           # Authentication & Guards
│   │   ├── boards/         # Board Domain & Gateways
│   │   ├── cards/          # Card Domain
│   │   ├── columns/        # Column Domain
│   │   ├── redis/          # Redis Integration
│   │   └── users/          # User Management
│   └── ...
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── api/            # Axios & Socket wrappers
│   │   ├── components/     # Reusable UI Components
│   │   ├── context/        # Global State (Auth)
│   │   ├── pages/          # Route Views
│   │   └── ...
├── docker-compose.yml       # Infrastructure Config
└── README.md                # Documentation
```

---

<p align="center">
  Made with ❤️ by the FluxBoard Team
</p>
