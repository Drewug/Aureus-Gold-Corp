

export interface Variant {
  id: string;
  sku: string;
  name: string; // e.g., "1oz", "10g"
  weight: number; // in grams
  purity: number; // percentage, e.g. 99.99
  mint?: string;
  year?: number;
  price: number;
  stock: number;
  lowStockThreshold?: number; // Default 5 if undefined
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface SeoGlobalConfig {
    titleTemplate: string; // e.g., "{{title}} | Aureus Gold Corp"
    descriptionTemplate: string; // e.g., "Buy {{title}} online. Secure shipping..."
    defaultOgImage: string;
    separator: string; // e.g. "|", "-", "•"
}

export interface KeywordOpportunity {
    keyword: string;
    volume: string; // e.g. "High", "Med"
    difficulty: number; // 0-100
    relevance: number; // 0-100
    currentRank?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  categories: string[];
  tags?: string[]; // For badges like "New 2025", "High Purity"
  taxonomyIdOverride?: number; // Manual override for Google Product Category
  images: string[];
  variants: Variant[];
  seo?: SeoSettings;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productTitle: string;
  variantName: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';

export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  shippingAddress: Address;
  shippingOption: 'standard' | 'express';
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO date
  notes?: string;
  currencyCode?: string; // Currency used for payment
  exchangeRateSnapshot?: number; // Rate at time of purchase
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'cron' | 'order' | 'system' | 'ingest' | 'webhook' | 'notification' | 'product' | 'cms' | 'auth' | 'currency' | 'seo' | 'leads' | 'blog';
  action: string;     // e.g. "Create", "Update", "Delete", "Sync"
  message: string;
  author: string;     // e.g. "Admin", "System", "Cron"
  resourceType?: string; // e.g. "product", "order"
  resourceId?: string;
  details?: {
    before?: any;
    after?: any;
    [key: string]: any;
  };
}

// --- Automation Types ---

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'content_swap' | 'price_update';
  targetId: string; // sectionId (CMS) or variantId (Product)
  payload: any; // { content: ... } or { price: 100 }
  scheduledFor: string; // ISO date
  status: 'pending' | 'completed' | 'failed';
}

export interface AutomationSettings {
  webhookUrl: string;
  enabledEvents: {
    lowStock: boolean;
    orderCreated: boolean;
    dailySummary: boolean;
  };
}

// --- CMS Types ---

export interface CMSSection {
  id: string;
  type: 'hero' | 'intro' | 'catalog' | 'trust' | 'faq';
  title: string; // Internal admin label
  isVisible: boolean;
  content: any; // Type-specific content
}

export interface GlobalCMSSettings {
  bannerMessage: string;
  footerText: string;
  footerLinks: { label: string; url: string }[];
  seo?: SeoSettings;
}

export interface CMSContent {
  version: string;
  global: GlobalCMSSettings;
  sections: CMSSection[];
}

// --- Blog Types ---

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string; // HTML/Markdown
    author: string;
    status: BlogPostStatus;
    publishedAt: string | null;
    categoryId: string;
    tags: string[];
    featuredImage: string;
    seo?: SeoSettings;
    readTimeMinutes?: number;
}

// --- Theme Types ---

export interface ThemeSettings {
  colors: {
    background: string;
    backgroundLight: string;
    backgroundLighter: string;
    primary: string; // Gold
    primaryLight: string;
    primaryDim: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    mode: 'full' | 'boxed';
    radius: number; // px
  };
}

// --- Media Types ---

export interface MediaAsset {
  id: string;
  url: string; // Base64 data URL
  filename: string;
  mimeType: string;
  size: number; // bytes
  width: number;
  height: number;
  tags: string[];
  folder: string;
  createdAt: string;
}

export interface CartItem extends OrderItem {}

// --- Notification Types ---

export type NotificationType = 'email' | 'sms';
export type NotificationEvent = 'order_confirmation' | 'shipping_update' | 'order_cancelled' | 'refund_processed';

export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    event: NotificationEvent;
    name: string;
    subject?: string; // Only for email
    body: string;
    isActive: boolean;
    variables: string[]; // List of available variables e.g. ['{{orderId}}']
    updatedAt: string;
}

export interface AdminBroadcast {
    id: string;
    message: string;
    createdAt: string;
    priority: 'normal' | 'high';
    author: string;
}

// --- Currency Types ---

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'UGX';

export interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    name: string;
    exchangeRate: number; // Relative to USD (Base)
    marginPercent: number; // Added markup (e.g. 2%)
    taxPercent: number; // e.g. 20% VAT
    rounding: 'none' | 'nearest_1' | 'nearest_5' | 'decimals_2' | 'nearest_100';
    isActive: boolean;
    isBase?: boolean;
}

export interface RateHistoryPoint {
    timestamp: string;
    code: CurrencyCode;
    rate: number;
}

export interface MultiCurrencySettings {
    mode: 'manual' | 'live_simulated';
    baseCurrency: CurrencyCode;
    currencies: CurrencyConfig[];
    lastUpdated: string;
}

// --- Forms & Leads Types ---

export type FormFieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'number' | 'radio' | 'date' | 'file';

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // Comma separated for editing, array for rendering
}

export interface FormDefinition {
    id: string;
    title: string;
    fields: FormField[];
    submitLabel: string;
    successMessage: string;
    createdAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface LeadSubmission {
    id: string;
    formId: string;
    formTitle: string;
    data: Record<string, string>; // key is field label or id
    status: LeadStatus;
    createdAt: string;
    notes?: string;
    trackerId?: string;
}