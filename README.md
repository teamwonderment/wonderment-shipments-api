# Shipment Tracking API Example

A minimal implementation of a headless tracking page using the Wonderment Tracking API. This example demonstrates how to create a simple tracking widget that can be embedded in any webpage.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A Wonderment API key

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/yourusername/shipment-api-example.git
cd shipment-api-example
```

2. Install dependencies:
```bash
npm install
```

3. Update the API key in `server.js`:
```javascript
// Replace with your Wonderment API key
'X-Wonderment-Access-Token': 'your_api_key_here'
```

4. Update the test tracking number in `index.html`:
```javascript
// Replace with your test tracking number
widget.track('your_test_tracking_number');
```

5. Start the server:
```bash
node server.js
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

- `server.js` - Express server handling API requests and static file serving
- `tracking-client.js` - Client-side tracking widget implementation
- `index.html` - Example implementation of the tracking widget

## API Endpoints

### POST /api/tracking

Fetches tracking information for a given tracking number.

Request body:
```json
{
    "searchTerm": "tracking_number_here"
}
```

Response:
```json
{
    "shipments": [
        {
            "statusDetails": {
                "status": "DELIVERED"
            },
            "events": [
                {
                    "date": "2024-04-09T14:30:00Z",
                    "status": "Delivered",
                    "locationDisplay": "New York, NY"
                }
                // ... more events
            ]
        }
    ]
}
```

## Implementing the Widget

1. Include the tracking widget script in your HTML:
```html
<script type="module">
    import { TrackingWidget } from './tracking-client.js';
    const widget = new TrackingWidget('tracking-container');
    widget.track('your_tracking_number');
</script>
```

2. Add a container element:
```html
<div id="tracking-container"></div>
```

## Development

The server uses Express.js and includes:
- CORS support
- JSON body parsing
- Static file serving
- Error handling
- Request logging

To modify the widget styling, update the CSS in the `render` method of `TrackingWidget` class in `tracking-client.js`.

## Testing

1. Start the server with `node server.js`
2. Use the example page at `http://localhost:3000`
3. Check the browser console and server logs for debugging information

## Common Issues

- **404 Not Found**: Ensure your API key is valid and the tracking number format is correct
- **CORS Errors**: The server includes CORS support by default. Modify the CORS configuration in `server.js` if needed
- **Module Errors**: Ensure you're using `type="module"` in your script tag when importing the tracking widget

## Security Notes

- Never expose your API key in client-side code
- The server includes basic error handling and logging
- Consider adding rate limiting for production use

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 