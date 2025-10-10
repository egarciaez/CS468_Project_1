require('dotenv').config();          // Load .env variables (like PORT, JWT_SECRET)
const app = require('./server');     // Import Express app

const PORT = process.env.PORT || 5000;

// Start listening for requests
app.listen(PORT, () => console.log(`TrackTask server running on port ${PORT}`));
