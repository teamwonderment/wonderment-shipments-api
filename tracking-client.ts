interface TrackingEvent {
    status: string;
    details: string;
    date: string;
    locationDisplay?: string;
}

export class TrackingWidget {
    private container: HTMLElement;

    constructor(containerId: string) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = element;
    }

    async track(searchTerm: string): Promise<void> {
        try {
            const response = await fetch('/api/tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ searchTerm })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tracking data');
            }

            const data = await response.json();
            this.render(data);
        } catch (error: any) {
            console.error('Error:', error);
            this.container.innerHTML = `<p>Error: ${error.message || 'Unknown error occurred'}</p>`;
        }
    }

    private render(data: any): void {
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
                    ${shipment.events.map((event: TrackingEvent) => `
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