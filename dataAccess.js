// dataAccess.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

// Create Employee and Role tables
db.serialize(() => {
  db.run('CREATE TABLE employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, role TEXT, status TEXT)');
  db.run('CREATE TABLE roles (name TEXT PRIMARY KEY)');
});

const dataAccess = {
  createEmployee: (name, role, status, callback) => {
    db.run('INSERT INTO employees (name, role, status) VALUES (?, ?, ?)', [name, role, status], callback);
  },

  getEmployeeById: (id, callback) => {
    db.get('SELECT * FROM employees WHERE id = ?', [id], callback);
  },

  updateEmployee: (id, name, role, status, callback) => {
    db.run('UPDATE employees SET name = ?, role = ?, status = ? WHERE id = ?', [name, role, status, id], callback);
  },

  deleteEmployee: (id, callback) => {
    db.run('DELETE FROM employees WHERE id = ?', [id], callback);
  },

  assignRoleToEmployee: (id, role, callback) => {
    db.run('UPDATE employees SET role = ? WHERE id = ?', [id, role], callback);
  },

  searchEmployeesByName: (name, callback) => {
    db.all('SELECT * FROM employees WHERE name = ?', [`${name}`], callback);
  },

  getTotalEmployees: (callback) => {
    db.get('SELECT COUNT(*) AS totalEmployees FROM employees', callback);
  },

  getTotalRoles: (callback) => {
    db.get('SELECT COUNT(*) AS totalRoles FROM roles', callback);
  },

  createRole: (name, callback) => {
    db.run('INSERT INTO roles (name) VALUES (?)', [name], callback);
  },

  deleteRole: (name, callback) => {
    db.run('DELETE FROM roles WHERE name = ?', [name], callback);
  },

  updateEmployeeStatus: (id, status, callback) => {
    db.run('UPDATE employees SET status = ? WHERE id = ?', [status, id], callback);
  },

  getEmployeeDetails: (id, callback) => {
    db.get('SELECT employees.*, roles.name AS roleName FROM employees LEFT JOIN roles ON employees.role = roles.name WHERE employees.id = ?', [id], callback);
  },
};

module.exports = dataAccess;
