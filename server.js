const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// API endpoint for tracking
app.post('/api/tracking', async (req, res) => {
    try {
        console.log('Tracking endpoint hit with body:', req.body);
        
        const { searchTerm } = req.body;
        if (!searchTerm) {
            console.log('Missing searchTerm in request');
            return res.status(400).json({ error: 'searchTerm is required' });
        }

        console.log('Making request to Wonderment API with searchTerm:', searchTerm);
        const apiUrl = 'https://api.wonderment.com/2022-10/shipments/search';
        const response = await axios({
            method: 'get',
            url: `${apiUrl}/${encodeURIComponent(searchTerm)}`,
            headers: {
                'Accept': 'application/json',
                'X-Wonderment-Access-Token': '' // ADD YOUR KEY HERE
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