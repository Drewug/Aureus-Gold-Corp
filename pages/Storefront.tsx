import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Product, CMSContent, BlogPost, BlogCategory } from '../types';
import { Layout } from '../components/Layout';
import { PageBuilder } from '../components/PageSections';
import { ProductList } from '../components/ProductList';
import { BlogCard } from '../components/Blog/BlogCard';
import { INITIAL_CMS } from '../data/mockData';
import { SEO } from '../components/SEO';
import { ArrowRight } from 'lucide-react';

export const Storefront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cms, setCms] = useState<CMSContent | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [p, c, b, cats] = await Promise.all([
          api.products.list(), 
          api.cms.get(),
          api.blogs.list(),
          api.blogs.getCategories()
      ]);
      setProducts(p);
      // Fallback if CMS is empty or error
      setCms(c && c.sections ? c : INITIAL_CMS);
      // Get latest 3 published blogs
      setBlogs(b.filter(post => post.status === 'published').sort((a,b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()).slice(0, 3));
      setCategories(cats);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <Layout><div className="min-h-[60vh] flex items-center justify-center text-gold">Loading Aureus...</div></Layout>;
  if (!cms) return <Layout><div className="p-12 text-center text-red-500">Failed to load content</div></Layout>;

  return (
    <Layout>
      <SEO 
        title={cms.global.seo?.metaTitle || "Aureus Gold Corp | Premium Bullion & Coins"}
        description={cms.global.seo?.metaDescription || cms.global.bannerMessage}
        image={cms.global.seo?.ogImage}
        url={window.location.href}
      />
      <PageBuilder content={cms} products={products} />
      
      {/* Latest News Section */}
      {blogs.length > 0 && (
          <div className="bg-charcoal relative z-10 border-t border-charcoal-lighter">
              <div className="max-w-7xl mx-auto px-4 py-16">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-serif text-white">Market Insights</h2>
                      <Link to="/blogs" className="text-gold flex items-center gap-2 hover:underline">
                          View All News <ArrowRight className="w-4 h-4" />
                      </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {blogs.map(post => (
                          <div key={post.id} className="h-full">
                              <BlogCard 
                                  post={post} 
                                  category={categories.find(c => c.id === post.categoryId)} 
                              />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="bg-charcoal border-t border-charcoal-lighter relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-16">
              <ProductList products={products} title="Complete Vault Inventory" />
          </div>
      </div>
    </Layout>
  );
};