// routes/tracking.ts
import { Router } from 'express';
import axios from 'axios';
import { body, validationResult } from 'express-validator';
import NodeCache from 'node-cache';

// Create a tracking router
export const createTrackingRouter = (apiKey: string, apiUrl: string, cache: NodeCache): Router => {
    const router = Router();

    router.post('/', 
        body('searchTerm').trim().notEmpty(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { searchTerm } = req.body;
            const cacheKey = `tracking:${searchTerm}`;

            // Check cache
            const cachedData = cache.get<TrackingResponse>(cacheKey);
            if (cachedData) {
                return res.json(cachedData);
            }

            try {
                const response = await axios({
                    method: 'POST',
                    url: `${apiUrl}/shipments/search`,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Wonderment-Access-Token': apiKey
                    },
                    data: { query: searchTerm }
                });

                // Store in cache
                cache.set(cacheKey, response.data);
                res.json(response.data);
            } catch (error) {
                console.error('Tracking API Error:', error);
                res.status(error.response?.status || 500).json({
                    error: 'Failed to fetch tracking information'
                });
            }
        }
    );

    return router;
};