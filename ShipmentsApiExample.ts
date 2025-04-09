import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { rateLimit } from 'express-rate-limit';
import NodeCache from 'node-cache';
import { body, validationResult } from 'express-validator';

// Usage examples:
/*
// Client-side
const widget = new TrackingWidget('tracking-widget', {
    apiEndpoint: '/api/tracking'
});
widget.track('867-5309');
*/




// Types
interface TrackingEvent {
    status: string;
    details: string;
    date: string;
    locationDisplay?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

interface LineItem {
    title: string;
    quantity: number;
    image?: {
        src: string;
        altText?: string;
    };
}

interface Shipment {
    trackingCode: string;
    trackingUrl: string | null;
    carrierName: string;
    date?: string;
    eta?: string;
    serviceLevel?: {
        name: string;
        token: string;
    };
    statusDetails: {
        status: string;
        substatus?: string;
        date: string;
        details: string;
    };
    lineItems: LineItem[];
    events: TrackingEvent[];
    order: {
        id: string;
        name: string;
    };
}

interface TrackingResponse {
    name?: string;
    shipments: Shipment[];
}

// Server-side implementation
export class ShipmentsTrackingServer {
    private app: express.Application;
    private cache: NodeCache;

    constructor(private apiKey: string, private apiUrl: string) {
        this.app = express();
        this.cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use('/api/tracking', limiter);
    }

    private setupRoutes(): void {
        this.app.post('/api/tracking',
            body('searchTerm').trim().notEmpty(),
            this.handleTrackingRequest.bind(this)
        );
    }

    private async handleTrackingRequest(req: express.Request, res: express.Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { searchTerm } = req.body;
        const cacheKey = `tracking:${searchTerm}`;
        const cachedData = this.cache.get(cacheKey);

        if (cachedData) {
            res.json(cachedData);
            return;
        }

        try {
            const response = await axios.post(`${this.apiUrl}/shipments/search`, {
                query: searchTerm
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wonderment-Access-Token': this.apiKey
                }
            });

            this.cache.set(cacheKey, response.data);
            res.json(response.data);
        } catch (error: any) {
            console.error('Tracking API Error:', error);
            res.status(error?.response?.status || 500).json({
                error: 'Failed to fetch tracking information'
            });
        }
    }

    public start(port: number = 3000): void {
        this.app.listen(port, () => {
            console.log(`Tracking server running on port ${port}`);
        });
    }
}



   // Usage examples:
   const server = new ShipmentsTrackingServer(
    '', // Add your API key here
    'https://api.wonderment.com'
);
server.start(3000);

