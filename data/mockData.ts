

import { Product, CMSContent, NotificationTemplate, FormDefinition, BlogPost, BlogCategory } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CMS: CMSContent = {
  version: '1.0',
  global: {
    bannerMessage: 'Global Shipping Insured • Secure Vault Storage Available • 24/7 Support',
    footerText: 'The premier destination for discerning investors seeking physical gold, silver, and rare specimens. Fully insured, authenticated, and secure.',
    footerLinks: [
      { label: 'Gold Bars', url: '#' },
      { label: 'Coins', url: '#' },
      { label: 'Vault Storage', url: '#' },
      { label: 'Contact Us', url: '#/contact' }
    ]
  },
  sections: [
    {
      id: 'sec-hero-1',
      type: 'hero',
      title: 'Main Hero',
      isVisible: true,
      content: {
        title: 'A Legacy of Pure Value',
        subtitle: 'Secure your future with certified bullion, coins, and rare specimens directly from the vault.',
        imageUrl: 'https://picsum.photos/id/106/1200/600',
        buttonText: 'View Collection'
      }
    },
    {
      id: 'sec-trust-1',
      type: 'trust',
      title: 'Trust Badges',
      isVisible: true,
      content: {
        badges: [
          { icon: 'truck', title: 'Fully Insured', text: "Every shipment backed by Lloyd's of London." },
          { icon: 'shield', title: 'Certified Authentic', text: "Guaranteed purity with physical certificates." },
          { icon: 'lock', title: 'Secure Storage', text: "Allocated vaulting options in Zurich & Singapore." }
        ]
      }
    },
    {
      id: 'sec-intro-1',
      type: 'intro',
      title: 'Homepage Intro',
      isVisible: true,
      content: {
        heading: 'The Gold Standard',
        text: 'For over a decade, Aureus Gold Corp has provided individuals and institutions with access to the highest quality precious metals. Our relationships with sovereign mints and major refineries ensure that you receive only authentic, investment-grade bullion.'
      }
    },
    {
      id: 'sec-catalog-1',
      type: 'catalog',
      title: 'Featured Inventory',
      isVisible: true,
      content: {
        heading: 'Current Inventory',
        limit: 8
      }
    },
    {
      id: 'sec-faq-1',
      type: 'faq',
      title: 'Common Questions',
      isVisible: true,
      content: {
        items: [
          { question: 'Is shipping insured?', answer: 'Yes, every package is fully insured for its full replacement value until signature upon delivery.' },
          { question: 'Can I store my gold with you?', answer: 'We offer segregated storage in our high-security vaults located in Zurich, Singapore, and New York.' }
        ]
      }
    }
  ]
};

export const INITIAL_NOTIFICATIONS: NotificationTemplate[] = [
    {
        id: 'tpl_email_order_conf',
        type: 'email',
        event: 'order_confirmation',
        name: 'Order Confirmation Email',
        subject: 'Order #{{orderId}} Confirmed - Aureus Gold Corp',
        body: `<h1>Order Confirmed</h1>
<p>Dear {{customerName}},</p>
<p>Thank you for your investment with Aureus Gold Corp. Your order <strong>#{{orderId}}</strong> has been secured.</p>
<p>Total: {{totalAmount}}</p>
<p>We will notify you once your assets are dispatched via armored transport.</p>`,
        isActive: true,
        variables: ['{{customerName}}', '{{orderId}}', '{{totalAmount}}'],
        updatedAt: new Date().toISOString()
    },
    {
        id: 'tpl_sms_order_conf',
        type: 'sms',
        event: 'order_confirmation',
        name: 'Order Confirmation SMS',
        body: 'Aureus Gold: Order #{{orderId}} confirmed. We are preparing your secure shipment. Thank you, {{customerName}}.',
        isActive: true,
        variables: ['{{customerName}}', '{{orderId}}'],
        updatedAt: new Date().toISOString()
    },
    {
        id: 'tpl_email_ship_upd',
        type: 'email',
        event: 'shipping_update',
        name: 'Shipping Update Email',
        subject: 'Shipment Dispatched: Order #{{orderId}}',
        body: `<h1>Your Assets are on the Move</h1>
<p>Hello {{customerName}},</p>
<p>Order #{{orderId}} has been handed over to our secure courier partners.</p>
<p>Tracking Number: <strong>{{trackingNumber}}</strong></p>
<p>Please ensure you are available to sign for this delivery.</p>`,
        isActive: true,
        variables: ['{{customerName}}', '{{orderId}}', '{{trackingNumber}}'],
        updatedAt: new Date().toISOString()
    }
];

export const INITIAL_FORMS: FormDefinition[] = [
    {
        id: 'frm_contact',
        title: 'General Contact Us',
        submitLabel: 'Send Message',
        successMessage: 'Thank you for contacting Aureus Gold Corp. A relationship manager will respond shortly.',
        createdAt: new Date().toISOString(),
        fields: [
            { id: 'f_name', type: 'text', label: 'Full Name', required: true, placeholder: 'John Doe' },
            { id: 'f_email', type: 'email', label: 'Email Address', required: true, placeholder: 'name@example.com' },
            { id: 'f_subject', type: 'select', label: 'Topic', required: true, options: ['General Inquiry', 'Vault Storage', 'Selling Gold', 'Support'] },
            { id: 'f_msg', type: 'textarea', label: 'Message', required: true, placeholder: 'How can we assist you?' }
        ]
    },
    {
        id: 'frm_newsletter',
        title: 'Market Newsletter',
        submitLabel: 'Subscribe',
        successMessage: 'You are now subscribed to our weekly market analysis.',
        createdAt: new Date().toISOString(),
        fields: [
            { id: 'f_email', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' }
        ]
    }
];

export const INITIAL_BLOG_CATEGORIES: BlogCategory[] = [
    { id: 'bc_market', name: 'Market Analysis', slug: 'market-analysis' },
    { id: 'bc_edu', name: 'Education', slug: 'education' },
    { id: 'bc_news', name: 'Company News', slug: 'company-news' },
];

export const INITIAL_BLOGS: BlogPost[] = [];
