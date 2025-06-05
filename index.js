const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const { testDatabaseConnection, createTablesIfNotExists, submitForm } = require('./db.js')
const { formatTelegramMessage, sendToAdmins, startTgBot } = require('./tgBot');

const app = express();

// Create livereload server
const liveReloadServer = livereload.createServer();


// Watch public directory for changes
liveReloadServer.watch(path.join(__dirname, 'public'));


// Inject livereload script to response
app.use(connectLiveReload());
app.use(bodyParser.json()) // for parsing application/json

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('assets', express.static(path.join(__dirname, 'public', 'assets')));

// Route for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/bid', (req, res) => {
  res.send('All good')
})

app.post('/form', async (req, res) => {
    try {
        const formData = req.body;
        // 1. Save to your database (your existing code)
        await submitForm(formData);
        // 2. Send notification to Telegram admins
        const message = formatTelegramMessage(formData);
        await sendToAdmins(message);

        res.status(200).json({ success: true, message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testDatabaseConnection();
  await createTablesIfNotExists();
  await startTgBot();
});
