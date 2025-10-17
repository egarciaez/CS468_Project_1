# CS468_Project_1 - TaskTrack

A full-stack web application for task management built with the SERN stack (SQLite + Knex, Express.js, React, Node.js). TaskTrack allows users to register, log in, create task lists, assign tasks, and track progress with a beautiful, responsive user interface.

## Features

### User Authentication
- **Secure Registration & Login**: JWT-based authentication with password hashing
- **Protected Routes**: All task management endpoints require authentication
- **Session Management**: Automatic token handling and refresh

### Task Management
- **Task Lists**: Create and organize tasks into custom lists (e.g., "Work Tasks", "Personal")
- **Task Creation**: Add tasks with title, description, due date, and priority
- **Task Updates**: Edit, update, and delete tasks with real-time UI updates
- **Status Tracking**: Mark tasks as "todo", "in-progress", or "completed"
- **Priority Levels**: High, medium, and low priority with visual indicators
- **Due Date Management**: Set and track task deadlines with datetime picker
- **Simplified Interface**: Clean, intuitive design without complex sorting options

### User Interface
- **Modern Design**: responsive UI with gradient backgrounds and glassmorphism effects
- **Real-time Updates**: Instant UI updates when creating, editing, or deleting tasks
- **Simplified Design**: Clean interface focused on core functionality without complex sorting options
- **Intuitive Navigation**: Easy-to-use interface with clear visual feedback

### Technical Features
- **RESTful API**: Well-designed API following REST principles
- **Test-Driven Development**: Comprehensive test coverage with Jest
- **Modular Architecture**: Clean separation of concerns with loose coupling
- **Error Handling**: Robust error handling and validation throughout
- **Database Persistence**: SQLite database with Knex.js query builder

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **SQLite**: Lightweight database for development and testing
- **Knex.js**: SQL query builder and migration tool
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library

### Frontend
- **React**: JavaScript library for building user interfaces
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **CSS3**: Modern styling with gradients and animations
- **Jest & React Testing Library**: Frontend testing

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Git** (for cloning the repository)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/egarciaez/CS468_Project_1.git
cd CS468_Project_1
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will start on `http://localhost:3000`

### 4. Running Tests

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## Architecture Overview

### Backend Architecture

```
backend/
├── src/
│   ├── controllers/     # Route handlers (business logic)
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── taskListController.js
│   ├── models/          # Data access layer
│   │   ├── userModel.js
│   │   ├── taskModel.js
│   │   └── taskListModel.js
│   ├── routes/          # API route definitions
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── lists.js
│   ├── middleware/      # Custom middleware
│   │   └── authMiddleware.js
│   ├── db.js           # Database connection
│   ├── server.js       # Express app configuration
│   └── index.js        # Application entry point
├── tests/              # Test files
├── migrations/         # Database migrations
└── package.json
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── TaskList.js
│   │   ├── CreateTask.js
│   │   ├── TaskListManager.js
│   │   └── ProtectedRoute.js
│   ├── services/       # API communication
│   │   ├── api.js
│   │   └── auth.js
│   ├── App.js         # Main application component
│   └── index.js       # Application entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Task Lists (Protected)
- `GET /api/lists` - Get all task lists for authenticated user
- `POST /api/lists` - Create a new task list
- `GET /api/lists/:id` - Get specific task list
- `PUT /api/lists/:id` - Update task list
- `DELETE /api/lists/:id` - Delete task list

### Tasks (Protected)
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update existing task
- `DELETE /api/tasks/:id` - Delete task

### Query Parameters
- `list_id` - Filter tasks by specific list

## Testing

### Backend Tests (87 tests)
- **Authentication Tests**: User registration and login
- **Task Management Tests**: CRUD operations for tasks
- **Task List Tests**: CRUD operations for task lists
- **Integration Tests**: End-to-end workflow testing
- **Error Handling Tests**: Input validation and error scenarios
- **Authorization Tests**: Access control and security

### Frontend Tests (14 tests)
- **Component Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **User Interaction Tests**: Form submission and user actions

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries with Knex.js
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Error Handling**: Secure error messages without sensitive data exposure

## Design Principles

### Separation of Concerns
- **Controllers**: Handle HTTP requests and responses
- **Models**: Manage data access and business logic
- **Routes**: Define API endpoints and middleware
- **Services**: Handle external API communication
- **Components**: Manage UI state and presentation

### Loose Coupling
- **Dependency Injection**: Services injected into components
- **Interface Segregation**: Small, focused interfaces
- **Abstraction Layers**: Clear separation between layers
- **Event-Driven Communication**: Components communicate via callbacks

### High Cohesion
- **Single Responsibility**: Each module has one clear purpose
- **Related Functionality**: Related features grouped together
- **Clear Interfaces**: Well-defined module boundaries

## Deployment

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### Production Build
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm run build
# Serve the build folder with a web server
```

## Usage Examples

### Creating a Task List
1. Log in to your account
2. Click "Create New List" in the sidebar
3. Enter list name and description
4. Click "Create List"

### Adding a Task
1. Select a list or choose "All Tasks"
2. Fill out the task creation form
3. Set priority, due date, and status
4. Click "Add Task"

### Managing Tasks
1. View tasks in the main content area under "All Tasks"
2. Click "Edit" to modify task details including due date and priority
3. Click "Mark Complete" to update status
4. Click "Delete" to remove tasks
5. Tasks are automatically organized by priority and creation date

Backend: 
<img width="1364" height="684" alt="image" src="https://github.com/user-attachments/assets/0c9d82da-9bac-4e66-9083-c6f0cf4284ff" />

Frontend: 

<img width="674" height="666" alt="image" src="https://github.com/user-attachments/assets/83f9a6e0-bb77-47a2-aa37-d27f121eb6f3" />
<img width="682" height="665" alt="image" src="https://github.com/user-attachments/assets/348cb163-544d-468d-9c09-fe8aaae7dcc9" />
<img width="681" height="671" alt="image" src="https://github.com/user-attachments/assets/74e86bbd-f76f-4efe-b6b8-b8c33a88e2f0" />







