// index.js
const express = require('express');
const app = express();


require('dotenv').config();
const PORT = Number(process.env.PORT) || 3000;
const MAX_PORT_TRIES = 10;

// Import routes
const userRoutes = require('./routes/users');
const animalRoutes = require('./routes/animal');
const vehicleRoutes = require('./routes/vehicle');
const imgRoutes = require('./routes/img');


// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Use the users route with a base path

app.use('/api/vehicle', vehicleRoutes);
app.use('/api/animal', animalRoutes);
app.use('/api/users', userRoutes);
app.use('/img', imgRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Express API!');
});

function startServer(port, triesLeft = MAX_PORT_TRIES) {
  app.listen(port, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE' && triesLeft > 1) {
        const nextPort = port + 1;
        console.warn(`Port ${port} is in use. Trying ${nextPort}...`);
        return startServer(nextPort, triesLeft - 1);
      }

      console.error(`Failed to start server on port ${port}: ${err.message}`);
      process.exit(1);
    }

    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer(PORT);
