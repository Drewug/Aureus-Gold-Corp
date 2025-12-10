

import { Product, Order, CMSContent, LogEntry, ScheduledTask, AutomationSettings, NotificationTemplate, AdminBroadcast, MultiCurrencySettings, RateHistoryPoint, SeoGlobalConfig, FormDefinition, LeadSubmission, BlogPost, BlogCategory } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CMS, INITIAL_NOTIFICATIONS, INITIAL_FORMS, INITIAL_BLOGS, INITIAL_BLOG_CATEGORIES } from '../data/mockData';

const KEYS = {
  PRODUCTS: 'aureus_products_v1',
  ORDERS: 'aureus_orders',
  CMS: 'aureus_cms_v1',
  LOGS: 'aureus_logs',
  MEDIA: 'aureus_media_v1',
  TASKS: 'aureus_tasks_v1',
  AUTO_SETTINGS: 'aureus_auto_settings_v1',
  FEEDS_GOOGLE: 'aureus_feed_google_v1',
  FEEDS_PINTEREST: 'aureus_feed_pinterest_v1',
  NOTIF_TEMPLATES: 'aureus_notif_templates_v1',
  BROADCASTS: 'aureus_broadcasts_v1',
  CURRENCY: 'aureus_currency_v1',
  RATE_HISTORY: 'aureus_rate_history_v1',
  SEO_CONFIG: 'aureus_seo_config_v1',
  FORMS: 'aureus_forms_v1',
  LEADS: 'aureus_leads_v1',
  BLOGS: 'aureus_blogs_v1',
  BLOG_CATS: 'aureus_blog_categories_v1',
  BLOG_DRAFTS: 'aureus_blog_drafts_v1'
};

const INITIAL_CURRENCY_SETTINGS: MultiCurrencySettings = {
    mode: 'live_simulated',
    baseCurrency: 'USD',
    lastUpdated: new Date().toISOString(),
    currencies: [
        { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1, marginPercent: 0, taxPercent: 0, rounding: 'decimals_2', isActive: true, isBase: true },
        { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92, marginPercent: 1.5, taxPercent: 20, rounding: 'decimals_2', isActive: true },
        { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.79, marginPercent: 2, taxPercent: 20, rounding: 'decimals_2', isActive: true },
        { code: 'AED', symbol: 'AED', name: 'UAE Dirham', exchangeRate: 3.67, marginPercent: 0, taxPercent: 5, rounding: 'decimals_2', isActive: true },
        { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', exchangeRate: 3800, marginPercent: 5, taxPercent: 0, rounding: 'nearest_100', isActive: true }
    ]
};

const INITIAL_SEO_CONFIG: SeoGlobalConfig = {
    titleTemplate: "{{title}} | Aureus Gold Corp",
    descriptionTemplate: "Buy {{title}} online. Secure, insured shipping and guaranteed purity from Aureus Gold Corp.",
    defaultOgImage: "",
    separator: "|"
};

export const localDb = {
  initialize: () => {
    if (typeof window === 'undefined') return;
    
    // Seed Products if empty
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.CMS)) {
      localStorage.setItem(KEYS.CMS, JSON.stringify(INITIAL_CMS));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.LOGS)) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.MEDIA)) {
      localStorage.setItem(KEYS.MEDIA, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.TASKS)) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.AUTO_SETTINGS)) {
      const defaultSettings: AutomationSettings = {
          webhookUrl: '',
          enabledEvents: { lowStock: true, orderCreated: true, dailySummary: false }
      };
      localStorage.setItem(KEYS.AUTO_SETTINGS, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(KEYS.NOTIF_TEMPLATES)) {
        localStorage.setItem(KEYS.NOTIF_TEMPLATES, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(KEYS.BROADCASTS)) {
        localStorage.setItem(KEYS.BROADCASTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.CURRENCY)) {
        localStorage.setItem(KEYS.CURRENCY, JSON.stringify(INITIAL_CURRENCY_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.RATE_HISTORY)) {
        localStorage.setItem(KEYS.RATE_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.SEO_CONFIG)) {
        localStorage.setItem(KEYS.SEO_CONFIG, JSON.stringify(INITIAL_SEO_CONFIG));
    }
    if (!localStorage.getItem(KEYS.FORMS)) {
        localStorage.setItem(KEYS.FORMS, JSON.stringify(INITIAL_FORMS));
    }
    if (!localStorage.getItem(KEYS.LEADS)) {
        localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.BLOGS)) {
        localStorage.setItem(KEYS.BLOGS, JSON.stringify(INITIAL_BLOGS));
    }
    if (!localStorage.getItem(KEYS.BLOG_CATS)) {
        localStorage.setItem(KEYS.BLOG_CATS, JSON.stringify(INITIAL_BLOG_CATEGORIES));
    }
  },

  getProducts: (): Product[] => {
    return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  getOrders: (): Order[] => {
    return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  },

  saveOrder: (order: Order) => {
    const orders = localDb.getOrders();
    orders.unshift(order);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrder: (order: Order) => {
    const orders = localDb.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  getCms: (): CMSContent => {
    return JSON.parse(localStorage.getItem(KEYS.CMS) || JSON.stringify(INITIAL_CMS));
  },

  saveCms: (cms: CMSContent) => {
    localStorage.setItem(KEYS.CMS, JSON.stringify(cms));
  },

  getLogs: (): LogEntry[] => {
    return JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  },

  addLog: (log: LogEntry) => {
    const logs = localDb.getLogs();
    logs.unshift(log);
    // Keep only last 100 logs
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  getMedia: (): any[] => {
    return JSON.parse(localStorage.getItem(KEYS.MEDIA) || '[]');
  },

  saveMedia: (media: any[]) => {
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(media));
  },

  getScheduledTasks: (): ScheduledTask[] => {
    return JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
  },

  saveScheduledTasks: (tasks: ScheduledTask[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  getAutomationSettings: (): AutomationSettings => {
      const stored = localStorage.getItem(KEYS.AUTO_SETTINGS);
      return stored ? JSON.parse(stored) : { webhookUrl: '', enabledEvents: { lowStock: true, orderCreated: true, dailySummary: false } };
  },

  saveAutomationSettings: (settings: AutomationSettings) => {
      localStorage.setItem(KEYS.AUTO_SETTINGS, JSON.stringify(settings));
  },

  saveFeedSnapshot: (type: 'google' | 'pinterest', content: string) => {
      const key = type === 'google' ? KEYS.FEEDS_GOOGLE : KEYS.FEEDS_PINTEREST;
      localStorage.setItem(key, content);
  },

  getFeedSnapshot: (type: 'google' | 'pinterest'): string | null => {
      const key = type === 'google' ? KEYS.FEEDS_GOOGLE : KEYS.FEEDS_PINTEREST;
      return localStorage.getItem(key);
  },

  getNotificationTemplates: (): NotificationTemplate[] => {
      return JSON.parse(localStorage.getItem(KEYS.NOTIF_TEMPLATES) || JSON.stringify(INITIAL_NOTIFICATIONS));
  },

  saveNotificationTemplates: (templates: NotificationTemplate[]) => {
      localStorage.setItem(KEYS.NOTIF_TEMPLATES, JSON.stringify(templates));
  },

  getBroadcasts: (): AdminBroadcast[] => {
      return JSON.parse(localStorage.getItem(KEYS.BROADCASTS) || '[]');
  },

  saveBroadcasts: (broadcasts: AdminBroadcast[]) => {
      localStorage.setItem(KEYS.BROADCASTS, JSON.stringify(broadcasts));
  },

  getCurrencySettings: (): MultiCurrencySettings => {
      return JSON.parse(localStorage.getItem(KEYS.CURRENCY) || JSON.stringify(INITIAL_CURRENCY_SETTINGS));
  },

  saveCurrencySettings: (settings: MultiCurrencySettings) => {
      localStorage.setItem(KEYS.CURRENCY, JSON.stringify(settings));
  },

  getRateHistory: (): RateHistoryPoint[] => {
      return JSON.parse(localStorage.getItem(KEYS.RATE_HISTORY) || '[]');
  },

  addRateHistoryPoints: (points: RateHistoryPoint[]) => {
      const history = localDb.getRateHistory();
      history.push(...points);
      // Keep last 500 points
      if (history.length > 500) {
          history.splice(0, history.length - 500);
      }
      localStorage.setItem(KEYS.RATE_HISTORY, JSON.stringify(history));
  },

  getSeoConfig: (): SeoGlobalConfig => {
      return JSON.parse(localStorage.getItem(KEYS.SEO_CONFIG) || JSON.stringify(INITIAL_SEO_CONFIG));
  },

  saveSeoConfig: (config: SeoGlobalConfig) => {
      localStorage.setItem(KEYS.SEO_CONFIG, JSON.stringify(config));
  },

  getForms: (): FormDefinition[] => {
      return JSON.parse(localStorage.getItem(KEYS.FORMS) || JSON.stringify(INITIAL_FORMS));
  },

  saveForms: (forms: FormDefinition[]) => {
      localStorage.setItem(KEYS.FORMS, JSON.stringify(forms));
  },

  getLeads: (): LeadSubmission[] => {
      return JSON.parse(localStorage.getItem(KEYS.LEADS) || '[]');
  },

  addLead: (lead: LeadSubmission) => {
      const leads = localDb.getLeads();
      leads.unshift(lead);
      localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  saveLeads: (leads: LeadSubmission[]) => {
      localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  getBlogs: (): BlogPost[] => {
      return JSON.parse(localStorage.getItem(KEYS.BLOGS) || '[]');
  },

  saveBlogs: (blogs: BlogPost[]) => {
      localStorage.setItem(KEYS.BLOGS, JSON.stringify(blogs));
  },

  getBlogCategories: (): BlogCategory[] => {
      return JSON.parse(localStorage.getItem(KEYS.BLOG_CATS) || '[]');
  },

  saveBlogCategories: (cats: BlogCategory[]) => {
      localStorage.setItem(KEYS.BLOG_CATS, JSON.stringify(cats));
  },
  
  saveBlogDraft: (id: string, draft: Partial<BlogPost>) => {
      const drafts = JSON.parse(localStorage.getItem(KEYS.BLOG_DRAFTS) || '{}');
      drafts[id] = draft;
      localStorage.setItem(KEYS.BLOG_DRAFTS, JSON.stringify(drafts));
  },

  getBlogDraft: (id: string): Partial<BlogPost> | null => {
      const drafts = JSON.parse(localStorage.getItem(KEYS.BLOG_DRAFTS) || '{}');
      return drafts[id] || null;
  },

  clearBlogDraft: (id: string) => {
      const drafts = JSON.parse(localStorage.getItem(KEYS.BLOG_DRAFTS) || '{}');
      delete drafts[id];
      localStorage.setItem(KEYS.BLOG_DRAFTS, JSON.stringify(drafts));
  }
};