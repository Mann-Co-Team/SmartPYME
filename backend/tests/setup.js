const db = require('../config/db');

// Close database connection after all tests
afterAll(async () => {
    // If using a pool, we might need to close it. 
    // mysql2 pool doesn't always need explicit closing for tests if forceExit is used,
    // but it's good practice.
    // Since db.js exports a pool, we can try to end it if exposed.
    // Checking db.js content... it exports pool.promise().
    // We can't easily close the pool if it's not directly exposed as 'pool'.
    // We will rely on --forceExit for now.
});
