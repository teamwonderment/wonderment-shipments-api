export class TrackingWidget {
    constructor(containerId) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = element;
    }
    async track(trackingData) {
        const [searchTerm, token] = trackingData.split('?t=');


        if (!searchTerm) {
            console.error('Missing searchTerm in tracking data');
            alert('Search term is required.');
            return;
        }
        if (!token) {
            console.error('Missing token (t) in tracking data');
            alert('Token (t) is required.');
            return;
        }

        try {
            const response = await fetch(`/api/tracking/${searchTerm}?t=${encodeURIComponent(token)}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch tracking data');
            }
            const data = await response.json();
            this.render(data);
        }
        catch (error) {
            console.error('Error:', error);
            this.container.innerHTML = `<p>Error: ${error.message || 'Unknown error occurred'}</p>`;
        }
    }
    render(data) {
        if (!data.shipments || data.shipments.length === 0) {
            this.container.innerHTML = '<div>No tracking information found.</div>';
            return;
        }
        const shipment = data.shipments[0];
        this.container.innerHTML = `
            <div class="tracking-container">
                <div class="status-header">
                    <h2>Tracking Status</h2>
                    <div class="status-tag status-${shipment.statusDetails.status.toUpperCase()}">
                        ${shipment.statusDetails.status}
                    </div>
                </div>
                <table class="tracking-table">
                    <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Location</th>
                    </tr>
                    ${shipment.events.map((event) => `
                        <tr>
                            <td>${event.date}</td>
                            <td>${event.status}</td>
                            <td>${event.locationDisplay || ''}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }
}
