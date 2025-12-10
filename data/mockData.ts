

import { Product, CMSContent, NotificationTemplate, FormDefinition, BlogPost, BlogCategory } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Royal Canadian Mint Gold Bar',
    slug: 'rcm-gold-bar',
    description: 'The Royal Canadian Mint is known worldwide for its strict quality standards. This .9999 fine gold bar features the RCM logo and a unique serial number.',
    categories: ['Gold Bars'],
    tags: ['Best Seller', '99.99% Pure'],
    images: ['https://picsum.photos/id/101/600/600'],
    variants: [
      { id: 'v1-1', sku: 'RCM-1OZ', name: '1 oz', weight: 31.1035, purity: 99.99, mint: 'RCM', price: 2150.00, stock: 15 },
      { id: 'v1-2', sku: 'RCM-10OZ', name: '10 oz', weight: 311.035, purity: 99.99, mint: 'RCM', price: 21200.00, stock: 3 },
    ]
  },
  {
    id: 'p2',
    title: 'American Gold Eagle Coin',
    slug: 'american-gold-eagle',
    description: 'The official gold bullion coin of the United States. Minted with 22-karat gold, it is backed by the US government for weight and content.',
    categories: ['Coins'],
    tags: ['Sovereign Mint'],
    images: ['https://picsum.photos/id/102/600/600'],
    variants: [
      { id: 'v2-1', sku: 'AGE-2024-1OZ', name: '1 oz (2024)', weight: 31.1035, purity: 91.67, year: 2024, mint: 'US Mint', price: 2200.00, stock: 45 },
      { id: 'v2-2', sku: 'AGE-2023-1OZ', name: '1 oz (2023)', weight: 31.1035, purity: 91.67, year: 2023, mint: 'US Mint', price: 2180.00, stock: 8 },
    ]
  },
  {
    id: 'p3',
    title: 'Australian Gold Nugget (Raw)',
    slug: 'raw-gold-nugget',
    description: 'A genuine, natural gold nugget found in the rich goldfields of Western Australia. Each nugget is unique in shape and character.',
    categories: ['Raw Nuggets'],
    tags: ['Natural', 'One of a Kind'],
    images: ['https://picsum.photos/id/103/600/600'],
    variants: [
      { id: 'v3-1', sku: 'NUG-12G', name: '12.4g Specimen', weight: 12.4, purity: 96.00, price: 1100.00, stock: 1 },
      { id: 'v3-2', sku: 'NUG-5G', name: '5.1g Specimen', weight: 5.1, purity: 95.50, price: 450.00, stock: 1 },
    ]
  },
  {
    id: 'p4',
    title: 'Silver Britannia Coin',
    slug: 'silver-britannia',
    description: 'A classic British silver bullion coin. Features the legendary figure of Britannia and advanced security features.',
    categories: ['Silver', 'Coins'],
    tags: [],
    images: ['https://picsum.photos/id/104/600/600'],
    variants: [
      { id: 'v4-1', sku: 'SBR-2024-1OZ', name: '1 oz (2024)', weight: 31.1035, purity: 99.9, year: 2024, mint: 'Royal Mint', price: 32.50, stock: 500 },
    ]
  }
];

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

export const INITIAL_BLOGS: BlogPost[] = [
    {
        id: 'blog_1',
        title: 'Why Central Banks Are Buying Gold in Record Numbers',
        slug: 'central-banks-buying-gold',
        excerpt: 'Global central banks added a historic 1,136 tonnes of gold worth some $70 billion to their stockpiles in 2022, by far the most of any year in records going back to 1950.',
        content: `
            <h2>The Shift to Hard Assets</h2>
            <p>In a world of increasing geopolitical uncertainty and persistent inflation, central banks are turning back to the oldest form of money: Gold.</p>
            <p>Data from the World Gold Council indicates a massive shift in reserve management strategies. Emerging market economies, in particular, are diversifying away from the US dollar.</p>
            <h3>What This Means for Investors</h3>
            <p>Institutional demand provides a strong floor for gold prices. As sovereign entities continue to accumulate, the supply available for private investment shrinks, potentially driving long-term appreciation.</p>
        `,
        author: 'Chief Analyst',
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        categoryId: 'bc_market',
        tags: ['Central Banks', 'Economics', 'Geopolitics'],
        featuredImage: 'https://picsum.photos/id/20/800/400',
        readTimeMinutes: 5,
        seo: {
            metaTitle: 'Central Bank Gold Buying Spree Explained | Aureus Gold Corp',
            metaDescription: 'Why are central banks accumulating gold at record rates? Understand the impact on the global economy and your portfolio.'
        }
    },
    {
        id: 'blog_2',
        title: 'Understanding Gold Purity: Karat vs. Fineness',
        slug: 'understanding-gold-purity',
        excerpt: 'Confused by 24k vs .999? We break down the terminology used in the precious metals industry to help you make informed buying decisions.',
        content: `
            <h2>Karat System</h2>
            <p>The Karat (k) system measures purity out of 24 parts. 24k is 100% gold, while 18k is 75% gold (18/24).</p>
            <h2>Millesimal Fineness</h2>
            <p>This system measures purity in parts per thousand. Investment grade bullion is typically .999 (99.9%) or .9999 (99.99%).</p>
            <p>At Aureus Gold Corp, all our bullion bars meet the strict .9999 standard.</p>
        `,
        author: 'Education Team',
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
        categoryId: 'bc_edu',
        tags: ['Education', 'Beginner Guide'],
        featuredImage: 'https://picsum.photos/id/175/800/400',
        readTimeMinutes: 3,
        seo: {
            metaTitle: 'Gold Purity Guide: Karat vs Fineness',
            metaDescription: 'Learn the difference between Karat and Fineness in gold grading.'
        }
    }
];