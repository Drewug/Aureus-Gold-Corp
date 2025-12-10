import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Storefront } from './pages/Storefront';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Admin/Dashboard';
import { Products } from './pages/Admin/Products';
import { Orders } from './pages/Admin/Orders';
import { Inventory } from './pages/Admin/Inventory';
import { Ingest } from './pages/Admin/Ingest';
import { Feeds } from './pages/Admin/Feeds';
import { Logs } from './pages/Admin/Logs';
import { CMS } from './pages/Admin/CMS';
import { Theme } from './pages/Admin/Theme';
import { Media } from './pages/Admin/Media';
import { BulkEdit } from './pages/Admin/BulkEdit';
import { Automation } from './pages/Admin/Automation';
import { Notifications } from './pages/Admin/Notifications';
import { Currency } from './pages/Admin/Currency';
import { SEO } from './pages/Admin/SEO';
import { Leads } from './pages/Admin/Leads';
import { DevTools } from './pages/Admin/DevTools';
import { BlogList } from './pages/Admin/Blogs/BlogList';
import { BlogEditor } from './pages/Admin/Blogs/BlogEditor';
import { BlogCategories } from './pages/Admin/Blogs/BlogCategories';
import { BlogIndex } from './pages/Blogs/BlogIndex';
import { BlogPostView } from './pages/Blogs/BlogPost';
import { CartProvider } from './lib/cartContext';
import { CurrencyProvider } from './lib/currencyContext';
import { localDb } from './lib/localDb';
import { runCronJobs } from './lib/cron.ts';
import { getTheme, applyTheme } from './lib/theme';

// Initialize data
localDb.initialize();

const App = () => {
  useEffect(() => {
    // Apply theme on app start
    const theme = getTheme();
    applyTheme(theme);

    // Simulate Cron Jobs running every 30 seconds
    const cronInterval = setInterval(() => {
       runCronJobs();
    }, 30000);
    return () => clearInterval(cronInterval);
  }, []);

  return (
    <CurrencyProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            
            {/* Blog Public Routes */}
            <Route path="/blogs" element={<BlogIndex />} />
            <Route path="/blogs/:slug" element={<BlogPostView />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/cms" element={<CMS />} />
            <Route path="/admin/media" element={<Media />} />
            <Route path="/admin/bulk-edit" element={<BulkEdit />} />
            <Route path="/admin/theme" element={<Theme />} />
            <Route path="/admin/automation" element={<Automation />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/currency" element={<Currency />} />
            <Route path="/admin/seo" element={<SEO />} />
            <Route path="/admin/leads" element={<Leads />} />
            <Route path="/admin/ingest" element={<Ingest />} />
            <Route path="/admin/feeds" element={<Feeds />} />
            <Route path="/admin/logs" element={<Logs />} />
            <Route path="/admin/devtools" element={<DevTools />} />
            
            {/* Admin Blog Routes */}
            <Route path="/admin/blogs" element={<BlogList />} />
            <Route path="/admin/blogs/new" element={<BlogEditor />} />
            <Route path="/admin/blogs/categories" element={<BlogCategories />} />
            <Route path="/admin/blogs/:id" element={<BlogEditor />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CartProvider>
    </CurrencyProvider>
  );
};

export default App;