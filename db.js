
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql_db', // matches the service name in docker-compose
  user: process.env.DB_USER || 'appuser',  // Changed from root to appuser
  password: process.env.DB_PASSWORD || 'userpassword',
  database: process.env.DB_NAME || 'appdb',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}
async function createUsersTable() {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(`
          SHOW TABLES LIKE 'users'
        `);

    if (users.length) {
      connection.release();
      return 0;
    }
      // Table doesn't exist, create it
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tg_id VARCHAR(128) NOT NULL UNIQUE,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
async function createFormTable() {
  try {
    const connection = await pool.getConnection();
    const [tables] = await connection.query(`
          SHOW TABLES LIKE 'form_submissions'
        `);

    if (tables.length) {
      connection.release();
      return 0;
    }
      // Table doesn't exist, create it
    await connection.query(`
      CREATE TABLE form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
async function createTablesIfNotExists() {
  console.log("Check if need tables")
  await createUsersTable();
  await createFormTable();
  console.log("tables are ok")
}
async function addToAdmins(tg_id) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO users
        (tg_id)
        VALUES (?)`,
      [tg_id]
    );
    connection.release();

    // Check if insert was successful
    if (result.affectedRows) {
      console.log('User added successfully with ID:', result.insertId);
      return { success: true, insertId: result.insertId };
    } else {
      console.log('User failed - no rows affected');
      return { success: false, message: 'No rows affected' };
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

async function submitForm(formData) {

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO form_submissions
        (name, email, phone)
        VALUES (?, ?, ?)`,
      [ formData.name, formData.email, formData.phone ]
    );
    connection.release();

        // Check if insert was successful
    if (result.affectedRows) {
      console.log('Form submitted successfully with ID:', result.insertId);
      return { success: true, insertId: result.insertId };
    } else {
      console.log('Form submission failed - no rows affected');
      return { success: false, message: 'No rows affected' };
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
async function getForms() {
  try {
    const connection = await pool.getConnection();

    // Execute query to get only id and tg_id
    const [forms] = await connection.query(
      `SELECT name, email, phone FROM form_submissions`
    );
    connection.release()
    return forms;

  } catch (error) {
    console.error('Database error in getforms:', error);
    return {
      success: false,
      message: 'Failed to fetch forms',
      error: error.message
    };
  }
}
async function getUsers() {

  try {
    const connection = await pool.getConnection();

    // Execute query to get only id and tg_id
    const [users] = await connection.query(
      `SELECT id, tg_id FROM users`
    );
    connection.release()
    return users;

  } catch (error) {
    console.error('Database error in getUsers:', error);
    return {
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    };
  }
}
module.exports = {
  testDatabaseConnection,
  createTablesIfNotExists,
  submitForm,
  getUsers,
  getForms,
  addToAdmins
};
