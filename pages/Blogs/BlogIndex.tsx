import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';
import { BlogPost, BlogCategory } from '../../types';
import { BlogCard } from '../../components/Blog/BlogCard';
import { Button, Card, Input } from '../../components/ui';
import { Search, Filter, BookOpen } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const BlogIndex = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('all');

    useEffect(() => {
        const load = async () => {
            const [p, c] = await Promise.all([api.blogs.list(), api.blogs.getCategories()]);
            // Filter only published
            setPosts(p.filter(post => post.status === 'published').sort((a,b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()));
            setCategories(c);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
        const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat;
        return matchesSearch && matchesCat;
    });

    return (
        <Layout>
            <SEO 
                title="Gold Investment News & Insights | Aureus Gold Corp"
                description="Expert analysis, market updates, and educational guides on precious metals investment."
            />
            
            <div className="bg-charcoal min-h-screen">
                {/* Header */}
                <div className="bg-charcoal-light border-b border-charcoal-lighter py-16 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Market Insights & News</h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                            Stay informed with the latest analysis on precious metals, economic trends, and wealth preservation strategies.
                        </p>
                        
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3 rounded-full bg-charcoal border border-charcoal-lighter text-gray-200 focus:border-gold outline-none shadow-lg"
                                placeholder="Search articles..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 justify-center mb-12">
                        <button 
                            onClick={() => setSelectedCat('all')}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${selectedCat === 'all' ? 'bg-gold text-charcoal border-gold' : 'border-charcoal-lighter text-gray-400 hover:text-white hover:border-gray-500'}`}
                        >
                            All Posts
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${selectedCat === cat.id ? 'bg-gold text-charcoal border-gold' : 'border-charcoal-lighter text-gray-400 hover:text-white hover:border-gray-500'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Blog Grid */}
                    {loading ? (
                        <div className="text-center text-gold py-20">Loading Insights...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-charcoal-light rounded-lg border border-charcoal-lighter">
                            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl text-white mb-2">No articles found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map(post => (
                                <BlogCard 
                                    key={post.id} 
                                    post={post} 
                                    category={categories.find(c => c.id === post.categoryId)} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};