import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';
import { BlogPost, BlogCategory } from '../../types';
import { SEO } from '../../components/SEO';
import { BlogJsonLd } from '../../components/Blog/BlogJsonLd';
import { Card, Button, Label, Input } from '../../components/ui';
import { Calendar, Clock, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import { formatDate, setCookie } from '../../lib/utils';
import { PublicFormRenderer } from '../../components/PublicFormRenderer';

export const BlogPostView = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [category, setCategory] = useState<BlogCategory | undefined>(undefined);
    const [related, setRelated] = useState<BlogPost[]>([]);
    const [newsletterForm, setNewsletterForm] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            if (!slug) return;
            const p = await api.blogs.get(slug);
            if (p) {
                setPost(p);
                // Track reading
                setCookie('last_read_blog', p.id, 7); // 7 days

                // Load extras
                const cats = await api.blogs.getCategories();
                setCategory(cats.find(c => c.id === p.categoryId));

                const allPosts = await api.blogs.list();
                setRelated(allPosts
                    .filter(b => b.id !== p.id && b.status === 'published' && b.categoryId === p.categoryId)
                    .slice(0, 3)
                );

                const form = await api.forms.get('frm_newsletter');
                setNewsletterForm(form);
            }
        };
        load();
    }, [slug]);

    if (!post) return <Layout><div className="min-h-screen flex items-center justify-center text-gray-500">Loading Article...</div></Layout>;

    return (
        <Layout>
            <SEO 
                title={post.seo?.metaTitle || post.title}
                description={post.seo?.metaDescription || post.excerpt}
                image={post.featuredImage}
                type="article"
            />
            <BlogJsonLd post={post} />

            <div className="bg-charcoal min-h-screen pb-20">
                {/* Hero */}
                <div className="relative h-[400px] md:h-[500px]">
                    <div className="absolute inset-0">
                        <img src={post.featuredImage || 'https://placehold.co/1200x600/1a1a1c/d4af37?text=No+Image'} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 max-w-4xl mx-auto">
                         <div className="flex gap-2 mb-4">
                            {category && (
                                <span className="bg-gold text-charcoal font-bold text-xs px-2 py-1 rounded uppercase tracking-wider">{category.name}</span>
                            )}
                            {post.tags.map(t => <span key={t} className="bg-charcoal/50 text-gray-300 border border-gray-600 text-xs px-2 py-1 rounded backdrop-blur">{t}</span>)}
                         </div>
                         <h1 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight drop-shadow-lg">{post.title}</h1>
                         <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                             <span className="flex items-center gap-2"><User className="w-4 h-4 text-gold" /> {post.author}</span>
                             <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold" /> {formatDate(post.publishedAt || '')}</span>
                             <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> {post.readTimeMinutes} min read</span>
                         </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <article className="lg:col-span-8">
                        <div className="text-xl text-gray-300 leading-relaxed font-serif mb-8 border-l-4 border-gold pl-6 italic">
                            {post.excerpt}
                        </div>
                        
                        <div 
                            className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-gold prose-a:text-gold prose-img:rounded-lg"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        <div className="mt-12 pt-8 border-t border-charcoal-lighter flex justify-between items-center">
                            <Link to="/blogs" className="text-gray-400 hover:text-white flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to News
                            </Link>
                            <button className="text-gold hover:text-white flex items-center gap-2" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied!');
                            }}>
                                <Share2 className="w-4 h-4" /> Share Article
                            </button>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Newsletter */}
                        {newsletterForm && (
                            <Card className="border-gold/30 bg-charcoal-light/50 sticky top-24">
                                <h3 className="font-serif text-xl text-white mb-2">Market Intelligence</h3>
                                <p className="text-gray-400 text-sm mb-6">Join 15,000+ investors receiving our weekly gold market analysis.</p>
                                <PublicFormRenderer form={newsletterForm} />
                            </Card>
                        )}

                        {/* Related */}
                        {related.length > 0 && (
                            <div>
                                <h3 className="font-serif text-xl text-white mb-6 border-b border-charcoal-lighter pb-2">Related Articles</h3>
                                <div className="space-y-6">
                                    {related.map(rel => (
                                        <Link key={rel.id} to={`/blogs/${rel.slug}`} className="group flex gap-4">
                                            <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-charcoal-light">
                                                <img src={rel.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            </div>
                                            <div>
                                                <h4 className="text-gray-200 font-medium leading-snug group-hover:text-gold transition-colors mb-2 line-clamp-2">
                                                    {rel.title}
                                                </h4>
                                                <span className="text-xs text-gray-500">{formatDate(rel.publishedAt || '')}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </Layout>
    );
};