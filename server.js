const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Static frontend files serve करणे
app.use(express.static(path.join(__dirname, 'public')));

// Render Health Check Endpoint (सर्व्हर बंद पडू नये म्हणून)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// कोणतीही लिंक ओपन केल्यास index.html दाखवणे
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Whisper Pro Server running on port ${PORT}`);
});
