# Employee Management System

## Introduction

The Employee Management System is an API built with Node.js, Express, and SQLite, providing various functionalities to manage employees, roles, and related operations.

## Features

- CRUD operations for employees
- Role assignment to employees
- Employee search functionality
- Admin dashboard metrics (total employees, total roles)
- Role creation and deletion
- Updating employee status
- Retrieving detailed employee information

## Prerequisites

Ensure the following are installed on your machine:

- Node.js
- npm (Node Package Manager)

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/waley-code/employeeManagement.git
   ```

```

2. **Navigate to the Project Directory:**

   ```bash
   cd employee-management-system
```

3. **Install Dependencies:**

   ```bash
   npm install
   ```
4. **Run the Application:**

   ```bash
   npm start
   ```

   The server will be accessible at http://localhost:3000.

## API Documentation

Explore the API using Swagger UI at [http://localhost:3000/api-docs](http://localhost:3000/api-docs) after starting the server.

## Endpoints

### Employee CRUD Operations:

- `POST /employees`
- `GET /employees/:id`
- `PUT /employees/:id`
- `DELETE /employees/:id`

### Role Assignment:

- `POST /employees/:id/assign-role`

### Search Functionality:

- `GET /employees/search`

### Admin Dashboard:

- `GET /admin/total-employees`
- `GET /admin/total-roles`
- `POST /admin/create-role`
- `DELETE /admin/delete-role/:name`

### Status Updates:

- `PUT /admin/update-status/:id`

### Data Consistency:

- `GET /employees/:id/details`

## Contribution

Contributions are welcome! If you encounter issues or have improvements, feel free to open issues or create pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

```

```
