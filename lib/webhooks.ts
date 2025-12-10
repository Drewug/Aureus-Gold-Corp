import { api } from './api';
import { localDb } from './localDb';

export const webhookSystem = {
    trigger: async (event: string, payload: any) => {
        const settings = localDb.getAutomationSettings();
        
        // Check if event is enabled
        if (event === 'low_stock' && !settings.enabledEvents.lowStock) return;
        if (event === 'order_created' && !settings.enabledEvents.orderCreated) return;
        
        if (!settings.webhookUrl) return;

        // Simulate network latency (200ms - 1500ms)
        const latency = Math.floor(Math.random() * 1300) + 200;
        await new Promise(r => setTimeout(r, latency));

        // Random success/fail rate (85% success)
        const isSuccess = Math.random() > 0.15; 

        if (isSuccess) {
             await api.logs.create('webhook', 'Trigger', `Webhook Sent: [${event}] to ${settings.webhookUrl} (${latency}ms)`, {
                 author: 'System',
                 details: { event, payload, latency }
             });
        } else {
             await api.logs.create('webhook', 'Failure', `Webhook Failed: [${event}] endpoint ${settings.webhookUrl} returned 500 Internal Server Error`, {
                 author: 'System',
                 details: { event, error: '500 Server Error' }
             });
        }
    }
};