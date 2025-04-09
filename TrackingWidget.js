"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingWidget = void 0;
// TrackingWidget.ts
class TrackingWidget {
    constructor(containerId, apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = container;
    }
    async track(searchTerm) {
        this.container.innerHTML = '<p>Loading tracking information...</p>';
        try {
            const data = await this.fetchTracking(searchTerm);
            this.render(data);
        }
        catch (error) {
            this.container.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }
    async fetchTracking(searchTerm) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerm })
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tracking data');
        }
        return response.json();
    }
    render(trackingData) {
        // Render logic...
    }
}
exports.TrackingWidget = TrackingWidget;
