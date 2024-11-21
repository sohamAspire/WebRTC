const multer = require('multer');

// Set up multer to handle video chunk uploads
const storage = multer.memoryStorage(); // Save chunks in memory for now
const upload = multer({ storage: storage });

module.exports = upload