import { api } from './api';
import { localDb } from './localDb';
import { webhookSystem } from './webhooks';
import { ScheduledTask } from '../types';

export const runCronJobs = async () => {
  const products = localDb.getProducts();
  const settings = localDb.getAutomationSettings();
  
  // 1. Stock Check & Webhook Trigger
  let lowStockVariants: string[] = [];
  products.forEach(p => {
    p.variants.forEach(v => {
      if (v.stock <= (v.lowStockThreshold || 5)) {
          lowStockVariants.push(`${v.sku} (${v.stock})`);
      }
    });
  });

  if (lowStockVariants.length > 0) {
    if (Math.random() > 0.7) {
       await api.logs.create('cron', 'Stock Check', `Stock Alert: ${lowStockVariants.length} variants below threshold.`, {
           author: 'System',
           details: { variants: lowStockVariants }
       });
       await webhookSystem.trigger('low_stock', { variants: lowStockVariants, timestamp: new Date().toISOString() });
    }
  }

  // 2. Feed Regeneration
  if (Math.random() > 0.6) {
    await api.feeds.generateGoogleShoppingXML();
    await api.feeds.generatePinterestXML();
    await api.logs.create('cron', 'Feed Gen', 'System Task: XML Feeds regenerated and cached.', { author: 'System' });
  }

  // 3. Scheduler Execution
  const tasks = localDb.getScheduledTasks();
  const now = new Date();
  let tasksUpdated = false;

  for (const task of tasks) {
      if (task.status === 'pending' && new Date(task.scheduledFor) <= now) {
          try {
              await executeTask(task);
              task.status = 'completed';
              await api.logs.create('system', 'Task Exec', `Scheduled Task executed: ${task.name}`, {
                  author: 'Scheduler',
                  resourceType: 'task',
                  resourceId: task.id
              });
          } catch (e: any) {
              task.status = 'failed';
              await api.logs.create('system', 'Task Fail', `Scheduled Task failed: ${task.name} - ${e.message}`, {
                  author: 'Scheduler',
                  resourceType: 'task',
                  resourceId: task.id,
                  details: { error: e.message }
              });
          }
          tasksUpdated = true;
      }
  }

  if (tasksUpdated) {
      localDb.saveScheduledTasks(tasks);
  }
};

const executeTask = async (task: ScheduledTask) => {
    if (task.type === 'price_update') {
        const products = localDb.getProducts();
        let updated = false;
        
        products.forEach(p => {
            const v = p.variants.find(v => v.id === task.targetId);
            if (v) {
                v.price = Number(task.payload.price);
                updated = true;
            }
        });

        if (updated) {
            localDb.saveProducts(products);
        } else {
            throw new Error('Target variant not found');
        }
    } else if (task.type === 'content_swap') {
        const cms = localDb.getCms();
        const section = cms.sections.find(s => s.id === task.targetId);
        if (section) {
            section.content = task.payload.content;
            localDb.saveCms(cms);
        } else {
            throw new Error('Target CMS section not found');
        }
    }
};