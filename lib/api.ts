

import { Product, Order, CMSContent, LogEntry, OrderItem, Address, OrderStatus, NotificationTemplate, AdminBroadcast, MultiCurrencySettings, RateHistoryPoint, CurrencyConfig, SeoGlobalConfig, KeywordOpportunity, FormDefinition, LeadSubmission, LeadStatus, BlogPost, BlogCategory } from '../types';
import { localDb } from './localDb';
import { v4 as uuidv4 } from 'uuid';

// Simulating network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  products: {
    list: async (): Promise<Product[]> => {
      await delay(200);
      return localDb.getProducts();
    },
    get: async (slug: string): Promise<Product | undefined> => {
      await delay(100);
      const products = localDb.getProducts();
      return products.find(p => p.slug === slug);
    },
    create: async (product: Product): Promise<void> => {
      await delay(300);
      const products = localDb.getProducts();
      if (!product.id) product.id = uuidv4();
      products.push(product);
      localDb.saveProducts(products);
      await api.logs.create('product', 'Create', `Created product: ${product.title}`, {
          author: 'Admin',
          resourceType: 'product',
          resourceId: product.id,
          details: { after: product }
      });
    },
    bulkCreate: async (newProducts: Product[]): Promise<void> => {
        await delay(500);
        const products = localDb.getProducts();
        products.push(...newProducts);
        localDb.saveProducts(products);
        await api.logs.create('ingest', 'Bulk Import', `Bulk imported ${newProducts.length} products.`, {
            author: 'Admin',
            resourceType: 'product',
            details: { count: newProducts.length }
        });
    },
    bulkUpdate: async (updatedProducts: Product[]): Promise<void> => {
        await delay(500);
        const products = localDb.getProducts();
        let updateCount = 0;
        
        updatedProducts.forEach(updated => {
            const index = products.findIndex(p => p.id === updated.id);
            if (index !== -1) {
                products[index] = updated;
                updateCount++;
            }
        });
        
        localDb.saveProducts(products);
        await api.logs.create('product', 'Bulk Update', `Bulk updated ${updateCount} products.`, {
            author: 'Admin',
            resourceType: 'product',
            details: { count: updateCount }
        });
    },
    update: async (product: Product): Promise<void> => {
      await delay(300);
      const products = localDb.getProducts();
      const index = products.findIndex(p => p.id === product.id);
      
      if (index !== -1) {
        const before = products[index];
        products[index] = product;
        localDb.saveProducts(products);
        
        await api.logs.create('product', 'Update', `Updated product: ${product.title}`, {
            author: 'Admin',
            resourceType: 'product',
            resourceId: product.id,
            details: { before, after: product }
        });
      } else {
        // Fallback create
        products.push(product);
        localDb.saveProducts(products);
        await api.logs.create('product', 'Create', `Created product (fallback): ${product.title}`, { author: 'Admin' });
      }
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      const products = localDb.getProducts();
      const product = products.find(p => p.id === id);
      const filtered = products.filter(p => p.id !== id);
      localDb.saveProducts(filtered);
      
      await api.logs.create('product', 'Delete', `Deleted product ID: ${id}`, {
          author: 'Admin',
          resourceType: 'product',
          resourceId: id,
          details: { deletedProduct: product }
      });
    },
    importCSV: async (csvText: string): Promise<{updated: number, errors: string[]}> => {
        await delay(500);
        const lines = csvText.split('\n');
        const products = localDb.getProducts();
        let updated = 0;
        const errors: string[] = [];

        lines.forEach((line, idx) => {
            const [sku, stockStr] = line.split(',').map(s => s.trim());
            if (!sku || !stockStr) return;
            
            const stock = parseInt(stockStr);
            if (isNaN(stock)) {
                errors.push(`Line ${idx + 1}: Invalid stock value for SKU ${sku}`);
                return;
            }

            let found = false;
            products.forEach(p => {
                const v = p.variants.find(v => v.sku === sku);
                if (v) {
                    v.stock = stock;
                    found = true;
                    updated++;
                }
            });
            if (!found) errors.push(`Line ${idx + 1}: SKU ${sku} not found`);
        });

        if (updated > 0) {
            localDb.saveProducts(products);
            await api.logs.create('ingest', 'Stock Update', `Bulk stock update via CSV: ${updated} variants.`, {
                author: 'Admin',
                details: { updatedCount: updated }
            });
        }
        return { updated, errors };
    }
  },

  orders: {
    create: async (
      customerEmail: string,
      shippingAddress: Address,
      shippingOption: 'standard' | 'express',
      items: OrderItem[],
      total: number
    ): Promise<Order> => {
      await delay(800);
      
      const products = localDb.getProducts();
      
      // 1. Validate Stock first (Atomic Check)
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        
        if (!variant) throw new Error(`Product variant not found: ${item.variantName}`);
        
        if (variant.stock < item.quantity) {
             throw new Error(`Insufficient stock for ${product?.title} - ${variant.name}. Only ${variant.stock} left.`);
        }
      }

      // 2. Decrement Stock
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        const variant = product!.variants.find(v => v.id === item.variantId);
        if (variant) {
           variant.stock -= item.quantity;
        }
      }
      localDb.saveProducts(products);

      // 3. Create Order
      const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        customerEmail,
        shippingAddress,
        shippingOption,
        items,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      localDb.saveOrder(newOrder);
      await api.logs.create('order', 'Create', `New order created: ${newOrder.id}`, {
          author: 'Customer', // Or 'System'
          resourceType: 'order',
          resourceId: newOrder.id,
          details: { total: newOrder.total, email: customerEmail }
      });

      // 4. Trigger Simulation
      api.webhooks.simulateLifecycle(newOrder.id);

      return newOrder;
    },
    list: async (): Promise<Order[]> => {
      await delay(200);
      return localDb.getOrders();
    },
    update: async (order: Order): Promise<void> => {
      await delay(200);
      const orders = localDb.getOrders();
      const oldOrder = orders.find(o => o.id === order.id);
      
      localDb.updateOrder(order);
      await api.logs.create('order', 'Update', `Order updated: ${order.id} status set to ${order.status}`, {
          author: 'Admin',
          resourceType: 'order',
          resourceId: order.id,
          details: { before: oldOrder, after: order }
      });
    },
    clearAll: async (): Promise<void> => {
      await delay(500);
      localStorage.setItem('aureus_orders', JSON.stringify([]));
      await api.logs.create('system', 'Reset', 'All test orders cleared from database.', { author: 'Admin' });
    }
  },

  cms: {
    get: async (): Promise<CMSContent> => {
      await delay(100);
      return localDb.getCms();
    },
    update: async (content: CMSContent): Promise<void> => {
      await delay(300);
      const oldContent = localDb.getCms();
      localDb.saveCms(content);
      await api.logs.create('cms', 'Update', 'CMS content updated', {
          author: 'Admin',
          details: { version: content.version }
      });
    }
  },

  logs: {
    list: async (): Promise<LogEntry[]> => {
      return localDb.getLogs();
    },
    create: async (
        type: LogEntry['type'], 
        action: string, 
        message: string, 
        meta: { author?: string, resourceType?: string, resourceId?: string, details?: any } = {}
    ) => {
      const log: LogEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type,
        action,
        message,
        author: meta.author || 'System',
        resourceType: meta.resourceType,
        resourceId: meta.resourceId,
        details: meta.details
      };
      localDb.addLog(log);
    },
    clear: async () => {
       localStorage.setItem('aureus_logs', JSON.stringify([]));
    }
  },

  webhooks: {
    processOrder: async (orderId: string) => {
      api.webhooks.simulateLifecycle(orderId);
    },
    simulateLifecycle: (orderId: string) => {
       // Step 1: Processing (after 5s)
       setTimeout(async () => {
           await api.webhooks.updateStatus(orderId, 'processing', 'Processing payment and verifying inventory.');
           
           // Step 2: Shipped (after 10s more)
           setTimeout(async () => {
               await api.webhooks.updateStatus(orderId, 'shipped', 'Order has been picked up by secure courier.');

               // Step 3: Delivered (after 10s more)
               setTimeout(async () => {
                   // 10% chance of failure for simulation purposes
                   const isSuccess = Math.random() > 0.1; 
                   const status: OrderStatus = isSuccess ? 'delivered' : 'failed';
                   const msg = isSuccess ? 'Package delivered to customer.' : 'Delivery attempt failed. Returning to vault.';
                   await api.webhooks.updateStatus(orderId, status, msg);
               }, 10000);

           }, 10000);
       }, 5000);
    },
    updateStatus: async (orderId: string, status: OrderStatus, logMsg: string) => {
        const orders = localDb.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            if (order.status === 'delivered' || order.status === 'failed') return;
            
            const oldStatus = order.status;
            order.status = status;
            localDb.updateOrder(order);
            
            await api.logs.create('webhook', 'Status Update', `Webhook: Order ${orderId} -> ${status}. ${logMsg}`, {
                author: 'System',
                resourceType: 'order',
                resourceId: orderId,
                details: { from: oldStatus, to: status }
            });
        }
    }
  },

  ingestion: {
    parseAndSave: async (jsonString: string) => { return {success:false, message: "Use products.bulkCreate"} }
  },

  feeds: {
      generateGoogleShoppingXML: async (): Promise<string> => {
          const products = localDb.getProducts();
           let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Aureus Gold Corp</title>
<link>https://aureus.demo</link>
<description>Luxury Bullion, Coins and Rare Specimens</description>
`;
        products.forEach(p => {
            p.variants.forEach(v => {
                xml += `
<item>
<g:id>${v.sku}</g:id>
<g:title>${p.title} - ${v.name}</g:title>
<g:description>${p.description}</g:description>
<g:link>https://aureus.demo/#/product/${p.slug}</g:link>
<g:image_link>${p.images[0] || ''}</g:image_link>
<g:brand>${v.mint || 'Aureus'}</g:brand>
<g:condition>new</g:condition>
<g:availability>${v.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
<g:price>${v.price.toFixed(2)} USD</g:price>
<g:product_type>${p.categories.join(' > ')}</g:product_type>
<g:google_product_category>178</g:google_product_category>
</item>`;
            });
        });
        xml += `</channel></rss>`;

        localDb.saveFeedSnapshot('google', xml);
        return xml;
      },
      generatePinterestXML: async (): Promise<string> => {
          const products = localDb.getProducts();
          let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Aureus Gold Corp Catalog</title>
<link>https://aureus.demo</link>
<description>Premium Precious Metals</description>
`;
        products.forEach(p => {
            p.variants.forEach(v => {
                 xml += `
<item>
<g:id>${v.sku}</g:id>
<g:title>${p.title}</g:title>
<g:description>${p.description}</g:description>
<g:link>https://aureus.demo/#/product/${p.slug}</g:link>
<g:image_link>${p.images[0] || ''}</g:image_link>
<g:brand>${v.mint || 'Aureus'}</g:brand>
<g:condition>new</g:condition>
<g:availability>${v.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
<g:price>${v.price.toFixed(2)} USD</g:price>
<g:product_type>${p.categories[0] || 'Bullion'}</g:product_type>
<g:item_group_id>${p.id}</g:item_group_id>
</item>`;
            });
        });
        xml += `</channel></rss>`;
        
        localDb.saveFeedSnapshot('pinterest', xml);
        return xml;
      }
  },

  notifications: {
      getTemplates: async (): Promise<NotificationTemplate[]> => {
          await delay(100);
          return localDb.getNotificationTemplates();
      },
      saveTemplate: async (template: NotificationTemplate): Promise<void> => {
          await delay(200);
          const templates = localDb.getNotificationTemplates();
          const index = templates.findIndex(t => t.id === template.id);
          if (index !== -1) {
              const before = templates[index];
              templates[index] = { ...template, updatedAt: new Date().toISOString() };
              localDb.saveNotificationTemplates(templates);
              await api.logs.create('notification', 'Update Template', `Updated template: ${template.name}`, {
                  author: 'Admin',
                  details: { before, after: template }
              });
          }
      },
      getBroadcasts: async (): Promise<AdminBroadcast[]> => {
          return localDb.getBroadcasts();
      },
      createBroadcast: async (message: string, priority: 'normal' | 'high'): Promise<void> => {
          await delay(200);
          const broadcasts = localDb.getBroadcasts();
          const newBroadcast: AdminBroadcast = {
              id: uuidv4(),
              message,
              priority,
              author: 'Admin', 
              createdAt: new Date().toISOString()
          };
          broadcasts.unshift(newBroadcast);
          localDb.saveBroadcasts(broadcasts);
          await api.logs.create('notification', 'Broadcast', `Admin Broadcast Sent: ${message.substring(0, 30)}...`, { author: 'Admin' });
      },
      deleteBroadcast: async (id: string): Promise<void> => {
          await delay(100);
          const broadcasts = localDb.getBroadcasts();
          const filtered = broadcasts.filter(b => b.id !== id);
          localDb.saveBroadcasts(filtered);
      }
  },

  currency: {
      getSettings: async (): Promise<MultiCurrencySettings> => {
          await delay(100);
          return localDb.getCurrencySettings();
      },
      updateSettings: async (settings: MultiCurrencySettings): Promise<void> => {
          await delay(300);
          localDb.saveCurrencySettings(settings);
          await api.logs.create('currency', 'Config Update', 'Currency rates/rules updated', { author: 'Admin' });
      },
      getHistory: async (): Promise<RateHistoryPoint[]> => {
          return localDb.getRateHistory();
      },
      simulateLiveRates: async (): Promise<void> => {
          // Simulation logic for "Live" mode
          const settings = localDb.getCurrencySettings();
          if (settings.mode !== 'live_simulated') return;

          const updatedCurrencies = settings.currencies.map(c => {
              if (c.isBase) return c;
              
              // Random fluctuation +/- 0.5%
              const drift = (Math.random() - 0.5) * 0.01; 
              const newRate = c.exchangeRate * (1 + drift);
              return { ...c, exchangeRate: parseFloat(newRate.toFixed(4)) };
          });

          const historyPoints: RateHistoryPoint[] = updatedCurrencies
            .filter(c => !c.isBase)
            .map(c => ({
                timestamp: new Date().toISOString(),
                code: c.code,
                rate: c.exchangeRate
            }));

          localDb.addRateHistoryPoints(historyPoints);
          localDb.saveCurrencySettings({ ...settings, currencies: updatedCurrencies, lastUpdated: new Date().toISOString() });
      }
  },

  seo: {
      getConfig: async (): Promise<SeoGlobalConfig> => {
          await delay(100);
          return localDb.getSeoConfig();
      },
      updateConfig: async (config: SeoGlobalConfig): Promise<void> => {
          await delay(200);
          localDb.saveSeoConfig(config);
          await api.logs.create('seo', 'Update', 'Global SEO Templates Updated', { author: 'Admin' });
      },
      analyzeKeywords: async (productTitle: string): Promise<KeywordOpportunity[]> => {
          await delay(800);
          // Mock logic based on keywords in title
          const base = [
              { keyword: 'Buy Gold Online', volume: 'High', difficulty: 85, relevance: 90 },
              { keyword: 'Gold Bullion Investment', volume: 'Med', difficulty: 60, relevance: 95 },
              { keyword: 'Secure Gold Storage', volume: 'Low', difficulty: 40, relevance: 80 }
          ];
          
          if (productTitle.toLowerCase().includes('coin')) {
              base.push({ keyword: 'Rare Gold Coins', volume: 'Med', difficulty: 70, relevance: 95 });
              base.push({ keyword: 'Numismatic Value', volume: 'Low', difficulty: 50, relevance: 85 });
          }
          if (productTitle.toLowerCase().includes('bar')) {
              base.push({ keyword: 'Gold Bars for Sale', volume: 'High', difficulty: 80, relevance: 98 });
              base.push({ keyword: '1oz Gold Price', volume: 'High', difficulty: 90, relevance: 85 });
          }
          return base.map(k => ({...k, currentRank: Math.floor(Math.random() * 50) + 1}));
      },
      simulatePageSpeed: async (): Promise<{ lcp: number, cls: number, fid: number }> => {
          await delay(1500);
          return {
              lcp: parseFloat((Math.random() * 2 + 1.0).toFixed(1)), // 1.0s - 3.0s
              cls: parseFloat((Math.random() * 0.15).toFixed(3)), // 0 - 0.15
              fid: Math.floor(Math.random() * 100) + 10 // 10ms - 110ms
          };
      }
  },

  forms: {
      list: async (): Promise<FormDefinition[]> => {
          await delay(200);
          return localDb.getForms();
      },
      get: async (id: string): Promise<FormDefinition | undefined> => {
          await delay(100);
          return localDb.getForms().find(f => f.id === id);
      },
      update: async (form: FormDefinition): Promise<void> => {
          await delay(200);
          const forms = localDb.getForms();
          const index = forms.findIndex(f => f.id === form.id);
          if (index !== -1) {
              forms[index] = form;
              localDb.saveForms(forms);
              await api.logs.create('system', 'Form Update', `Updated form definition: ${form.title}`, { author: 'Admin' });
          } else {
              forms.push(form);
              localDb.saveForms(forms);
              await api.logs.create('system', 'Form Create', `Created new form: ${form.title}`, { author: 'Admin' });
          }
      },
      delete: async (id: string): Promise<void> => {
          await delay(200);
          const forms = localDb.getForms();
          const filtered = forms.filter(f => f.id !== id);
          localDb.saveForms(filtered);
      }
  },

  leads: {
      list: async (): Promise<LeadSubmission[]> => {
          await delay(200);
          return localDb.getLeads();
      },
      submit: async (formId: string, data: Record<string, string>, trackerId?: string): Promise<void> => {
          await delay(800);
          const forms = localDb.getForms();
          const form = forms.find(f => f.id === formId);
          if (!form) throw new Error('Form not found');

          const submission: LeadSubmission = {
              id: uuidv4(),
              formId,
              formTitle: form.title,
              data,
              status: 'new',
              createdAt: new Date().toISOString(),
              trackerId
          };
          localDb.addLead(submission);
          await api.logs.create('leads', 'Submission', `New lead from ${form.title}`, { 
              resourceType: 'lead', 
              resourceId: submission.id,
              details: { trackerId }
          });
      },
      updateStatus: async (id: string, status: LeadStatus, notes?: string): Promise<void> => {
          await delay(200);
          const leads = localDb.getLeads();
          const index = leads.findIndex(l => l.id === id);
          if (index !== -1) {
              leads[index] = { ...leads[index], status, notes: notes ?? leads[index].notes };
              localDb.saveLeads(leads);
          }
      }
  },

  blogs: {
      list: async (): Promise<BlogPost[]> => {
          await delay(100);
          return localDb.getBlogs();
      },
      get: async (idOrSlug: string): Promise<BlogPost | undefined> => {
          await delay(100);
          const blogs = localDb.getBlogs();
          return blogs.find(b => b.id === idOrSlug || b.slug === idOrSlug);
      },
      update: async (blog: BlogPost): Promise<void> => {
          await delay(200);
          const blogs = localDb.getBlogs();
          const index = blogs.findIndex(b => b.id === blog.id);
          if (index !== -1) {
              blogs[index] = blog;
              localDb.saveBlogs(blogs);
              await api.logs.create('blog', 'Update', `Updated blog post: ${blog.title}`, {
                  author: 'Admin',
                  resourceType: 'blog',
                  resourceId: blog.id
              });
              localDb.clearBlogDraft(blog.id);
          } else {
              // Create
              blogs.unshift(blog);
              localDb.saveBlogs(blogs);
              await api.logs.create('blog', 'Create', `Created blog post: ${blog.title}`, {
                  author: 'Admin',
                  resourceType: 'blog',
                  resourceId: blog.id
              });
          }
      },
      delete: async (id: string): Promise<void> => {
          await delay(200);
          const blogs = localDb.getBlogs();
          const filtered = blogs.filter(b => b.id !== id);
          localDb.saveBlogs(filtered);
          await api.logs.create('blog', 'Delete', `Deleted blog post ID: ${id}`, { author: 'Admin' });
      },
      saveDraft: (id: string, draft: Partial<BlogPost>) => {
          localDb.saveBlogDraft(id, draft);
      },
      getDraft: (id: string): Partial<BlogPost> | null => {
          return localDb.getBlogDraft(id);
      },
      getCategories: async (): Promise<BlogCategory[]> => {
          return localDb.getBlogCategories();
      },
      saveCategory: async (category: BlogCategory): Promise<void> => {
          await delay(100);
          const cats = localDb.getBlogCategories();
          const idx = cats.findIndex(c => c.id === category.id);
          if (idx !== -1) cats[idx] = category;
          else cats.push(category);
          localDb.saveBlogCategories(cats);
      },
      deleteCategory: async (id: string): Promise<void> => {
          await delay(100);
          const cats = localDb.getBlogCategories();
          const filtered = cats.filter(c => c.id !== id);
          localDb.saveBlogCategories(filtered);
      }
  }
};