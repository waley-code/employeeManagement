// server.js
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database(':memory:');

// Create Employee and Role tables
db.serialize(() => {
  db.run('CREATE TABLE employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, role TEXT, status TEXT)');
  db.run('CREATE TABLE roles (name TEXT PRIMARY KEY)');
});

app.use(bodyParser.json());




// 1. Employee CRUD Operations

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     parameters:
 *       - in: body
 *         name: employee
 *         description: The employee to create
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 *     responses:
 *       201:
 *         description: Created successfully
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 */
app.post('/employees', (req, res) => {
  const { name, role, status } = req.body;

  if (!name || !role || !status) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  db.run('INSERT INTO employees (name, role, status) VALUES (?, ?, ?)', [name, role, status], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create employee.' });
    }

    res.status(201).json({ id: this.lastID, name, role, status });
  });
});


/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Retrieve employee by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the employee
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to retrieve employee
 */
app.get('/employees/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve employee.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json(row);
  });
});



/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update employee by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the employee
 *         required: true
 *         type: integer
 *       - in: body
 *         name: employee
 *         description: The updated employee details
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to update employee
 */
app.put('/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, status } = req.body;

  db.run('UPDATE employees SET name = ?, role = ?, status = ? WHERE id = ?', [name, role, status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update employee.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ id, name, role, status });
  });
});



/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete employee by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the employee to delete
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to delete employee
 */
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete employee.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ message: 'Employee deleted successfully.' });
  });
});

// 2. Role Assignment

/**
 * @swagger
 * /employees/{id}/assign-role:
 *   post:
 *     summary: Assign a role to an employee
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the employee
 *         required: true
 *         type: integer
 *       - in: body
 *         name: role
 *         description: The role to assign
 *         schema:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       404:
 *         description: Employee not found
 */
app.post('/employees/:id/assign-role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
  
    db.run('UPDATE employees SET role = ? WHERE id = ?', [role, id], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to assign role.' });
      }
  
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Employee not found.' });
      }
  
      res.json({ message: 'Role assigned successfully.' });
    });
  });

// 3. Search Functionality

/**
 * @swagger
 * /employees/search:
 *   get:
 *     summary: Search employees by name
 *     parameters:
 *       - in: query
 *         name: name
 *         description: The name to search for
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *       500:
 *         description: Failed to search employees
 */
app.get('/employees/search', (req, res) => {
    const { name } = req.query;
    console.log('Search Query:', name);
  
    db.all('SELECT * FROM employees WHERE name LIKE ?', [`%${name}%`], (err, rows) => {
      if (err) {
        console.error(err);  // Log the error for further investigation
        return res.status(500).json({ error: 'Failed to search employees.' });
      }
  
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found.' });
      }
  
      res.json(rows);
    });
  });
  

// 4. Admin Dashboard
/**
 * @swagger
 * /admin/total-employees:
 *   get:
 *     summary: Retrieve the total number of employees
 *     responses:
 *       200:
 *         description: Total employees retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             totalEmployees:
 *               type: integer
 *       500:
 *         description: Failed to retrieve total employees
 */

app.get('/admin/total-employees', (req, res) => {
  db.get('SELECT COUNT(*) AS totalEmployees FROM employees', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve total employees.' });
    }

    res.json(row);
  });
});


/**
 * @swagger
 * /admin/total-roles:
 *   get:
 *     summary: Retrieve the total number of roles
 *     responses:
 *       200:
 *         description: Total roles retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             totalRoles:
 *               type: integer
 *       500:
 *         description: Failed to retrieve total roles
 */
app.get('/admin/total-roles', (req, res) => {
  db.get('SELECT COUNT(*) AS totalRoles FROM roles', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve total roles.' });
    }

    res.json(row);
  });
});


/**
 * @swagger
 * /admin/create-role:
 *   post:
 *     summary: Create a new role
 *     parameters:
 *       - in: body
 *         name: role
 *         description: The role to create
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *       400:
 *         description: Missing role name
 *       500:
 *         description: Failed to create role
 */

app.post('/admin/create-role', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing role name.' });
  }

  db.run('INSERT INTO roles (name) VALUES (?)', [name], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create role.' });
    }

    res.status(201).json({ name });
  });
});


/**
 * @swagger
 * /admin/delete-role/{name}:
 *   delete:
 *     summary: Delete a role by name
 *     parameters:
 *       - in: path
 *         name: name
 *         description: The name of the role to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Role not found
 *       500:
 *         description: Failed to delete role
 */

app.delete('/admin/delete-role/:name', (req, res) => {
  const { name } = req.params;

  db.run('DELETE FROM roles WHERE name = ?', [name], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete role.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Role not found.' });
    }

    res.json({ message: 'Role deleted successfully.' });
  });
});

// 5. Status Updates
/**
 * @swagger
 * /admin/update-status/{id}:
 *   put:
 *     summary: Update employee status by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the employee
 *         required: true
 *         type: integer
 *       - in: body
 *         name: status
 *         description: The updated status
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *     responses:
 *       200:
 *         description: Employee status updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to update employee status
 */
app.put('/admin/update-status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE employees SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update employee status.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ message: 'Employee status updated successfully.' });
  });
});

// 6. Data Consistency
/**
 * @swagger
 * /employees/{id}/details:
 *   get:
 *     summary: Retrieve detailed employee information by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the employee
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             status:
 *               type: string
 *             roleName:
 *               type: string
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Failed to retrieve employee details
 */
app.get('/employees/:id/details', (req, res) => {
  const { id } = req.params;

  db.get('SELECT employees.*, roles.name AS roleName FROM employees LEFT JOIN roles ON employees.role = roles.name WHERE employees.id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve employee details.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json(row);
  });
});

// Start the server
// Define Swagger options
const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Employee Management System API',
        description: 'API for managing employees, roles, and related operations',
        version: '1.0.0',
      },
    },
    apis: ['server.js'], // Path to the API routes and comments
  };
  
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  
  // Serve Swagger UI documentation
  /**
   * @swagger
   * /api-docs:
   *   get:
   *     summary: Serve Swagger UI documentation
   *     produces:
   *       - text/html
   */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });