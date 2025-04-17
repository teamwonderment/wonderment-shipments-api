const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API endpoint for tracking
app.post('/api/tracking/:searchTerm', async (req, res) => {
    try {        
        const { searchTerm } = req.params;
        const { t } = req.query;

        console.log('Request params:', req.params);
        console.log('Request query:', req.query);

        if (!searchTerm) {
            console.log('Missing searchTerm in request');
            return res.status(400).json({ error: 'searchTerm is required' });
        }

        if (!t) {
            console.log('Missing token (t) in request');
            return res.status(400).json({ error: 'Token (t) is required' });
        }
       
        console.log('Making request to Wonderment API with searchTerm:', searchTerm, 'and token:', t);
        const apiUrl = `https://api.wonderment.com/2022-10/shipments/search/${encodeURIComponent(searchTerm)}?t=${encodeURIComponent(t)}`;
        const response = await axios({
            method: 'get',
            url: apiUrl,
            headers: {
                'Accept': 'application/json',
                'X-Wonderment-Access-Token': process.env.WONDERMENT_DEMO_API_KEY // ADD YOUR KEY HERE
            }
        });

        console.log('Wonderment API response:', response.status);
        return res.json(response.data);
    } catch (error) {
        console.error('Tracking API Error:', error.message);
        if (error.response) {
            console.error('API Response:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        return res.status(error.response?.status || 500).json({
            error: 'Failed to fetch tracking information',
            details: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Serve static files
app.use(express.static(__dirname));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Available routes:');
    console.log('- POST /api/tracking');
    console.log('- GET /api/test');
    console.log('- GET /* (static files)');
}); 