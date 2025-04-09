// TrackingWidget.ts
export class TrackingWidget {
    private container: HTMLElement;

    constructor(containerId: string) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = element;
    }

    async track(trackingNumber: string): Promise<void> {
        try {
            const response = await fetch('/api/tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ trackingNumber })
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
        // Implement rendering logic here
        this.container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
}