import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/AdminLayout';
import { api } from '../../../lib/api';
import { BlogPost, BlogCategory } from '../../../types';
import { Button, Card, Input, Label, Badge } from '../../../components/ui';
import { RichTextEditor } from '../../../components/Blog/RichTextEditor';
import { SeoEditor } from '../../../components/SeoEditor';
import { MediaLibrary } from '../../../components/MediaLibrary';
import { Save, ArrowLeft, Image as ImageIcon, Globe, Clock, RotateCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const BlogEditor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [showMedia, setShowMedia] = useState(false);
    const [showSeo, setShowSeo] = useState(false);
    
    // Form State
    const [post, setPost] = useState<BlogPost>({
        id: uuidv4(),
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Admin',
        status: 'draft',
        publishedAt: null,
        categoryId: '',
        tags: [],
        featuredImage: '',
        readTimeMinutes: 5,
        seo: {}
    });

    useEffect(() => {
        const init = async () => {
            const cats = await api.blogs.getCategories();
            setCategories(cats);
            
            if (id && id !== 'new') {
                // Check for draft first
                const draft = api.blogs.getDraft(id);
                const existing = await api.blogs.get(id);
                
                if (draft && existing) {
                    if (confirm('A local draft exists for this post. Restore it?')) {
                        setPost({ ...existing, ...draft });
                        return;
                    }
                }
                
                if (existing) setPost(existing);
            }
        };
        init();
    }, [id]);

    // Auto-save draft
    useEffect(() => {
        if (id && id !== 'new') {
            const timer = setTimeout(() => {
                api.blogs.saveDraft(id, post);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [post, id]);

    const handleChange = (field: keyof BlogPost, value: any) => {
        setPost(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (status: 'draft' | 'published') => {
        setLoading(true);
        const toSave = {
            ...post,
            status,
            publishedAt: status === 'published' && !post.publishedAt ? new Date().toISOString() : post.publishedAt
        };
        
        // Auto-generate slug if empty
        if (!toSave.slug) {
            toSave.slug = toSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        // Estimate reading time (avg 200 words/min)
        const wordCount = toSave.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
        toSave.readTimeMinutes = Math.ceil(wordCount / 200) || 1;

        await api.blogs.update(toSave);
        setLoading(false);
        navigate('/admin/blogs');
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/blogs')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-serif text-white">{post.title || 'Untitled Post'}</h1>
                        <div className="flex items-center gap-2 mt-1">
                             <Badge variant={post.status === 'published' ? 'success' : 'warning'}>{post.status}</Badge>
                             {post.id && <span className="text-xs text-gray-500">Draft saved locally</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleSave('draft')} isLoading={loading}>
                        <Save className="w-4 h-4 mr-2" /> Save Draft
                    </Button>
                    <Button onClick={() => handleSave('published')} isLoading={loading}>
                        {post.status === 'published' ? 'Update' : 'Publish'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="space-y-4">
                            <div>
                                <Label>Title</Label>
                                <Input 
                                    value={post.title} 
                                    onChange={e => handleChange('title', e.target.value)} 
                                    placeholder="Enter blog title" 
                                    className="text-lg font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Slug</Label>
                                    <Input 
                                        value={post.slug} 
                                        onChange={e => handleChange('slug', e.target.value)} 
                                        placeholder="auto-generated-slug" 
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <Label>Author</Label>
                                    <Input 
                                        value={post.author} 
                                        onChange={e => handleChange('author', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="min-h-[600px] flex flex-col">
                        <Label className="mb-2">Content</Label>
                        <RichTextEditor 
                            value={post.content} 
                            onChange={val => handleChange('content', val)} 
                            placeholder="Write your story..."
                            className="flex-1"
                        />
                    </Card>
                    
                    <Card>
                        <Label>Excerpt (Summary)</Label>
                        <textarea 
                            className="w-full h-24 bg-charcoal-lighter border border-charcoal-light rounded p-3 text-sm text-gray-200 focus:border-gold outline-none resize-none"
                            value={post.excerpt}
                            onChange={e => handleChange('excerpt', e.target.value)}
                            placeholder="Short summary for listing pages..."
                        />
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-white font-medium mb-4">Organization</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Category</Label>
                                <select 
                                    className="w-full h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                                    value={post.categoryId}
                                    onChange={e => handleChange('categoryId', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Tags (Comma separated)</Label>
                                <Input 
                                    value={post.tags.join(', ')} 
                                    onChange={e => handleChange('tags', e.target.value.split(',').map(t => t.trim()))} 
                                    placeholder="Gold, Economics, News"
                                />
                            </div>
                            {post.publishedAt && (
                                <div>
                                    <Label>Publish Date</Label>
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {new Date(post.publishedAt).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <Label>Featured Image</Label>
                        <div 
                            className="mt-2 aspect-video bg-charcoal-lighter border border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500 cursor-pointer hover:border-gold hover:text-gold transition-colors overflow-hidden group relative"
                            onClick={() => setShowMedia(true)}
                        >
                            {post.featuredImage ? (
                                <>
                                    <img src={post.featuredImage} alt="Featured" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                        Change Image
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span>Select Image</span>
                                </div>
                            )}
                        </div>
                        {post.featuredImage && (
                            <Button size="sm" variant="outline" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); handleChange('featuredImage', ''); }}>
                                Remove Image
                            </Button>
                        )}
                    </Card>

                    <Card>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-medium">SEO Settings</h3>
                            {post.seo?.metaTitle && <Globe className="w-4 h-4 text-green-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Customize how this post appears in search results.</p>
                        <Button variant="secondary" className="w-full" onClick={() => setShowSeo(true)}>
                            Configure SEO
                        </Button>
                    </Card>
                </div>
            </div>

            {showMedia && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-8">
                     <div className="bg-charcoal-light w-full max-w-4xl h-[80vh] rounded-lg border border-charcoal-lighter flex flex-col shadow-2xl relative">
                        <div className="absolute top-4 right-4 z-10">
                            <Button size="sm" variant="secondary" onClick={() => setShowMedia(false)}>Close</Button>
                        </div>
                        <div className="flex-1 overflow-hidden p-4">
                            <MediaLibrary onSelect={(url) => { handleChange('featuredImage', url); setShowMedia(false); }} />
                        </div>
                    </div>
                </div>
            )}

            {showSeo && (
                <SeoEditor 
                    initialSettings={post.seo} 
                    onSave={(s) => { handleChange('seo', s); setShowSeo(false); }}
                    onCancel={() => setShowSeo(false)}
                    titleOverride={post.title}
                    descOverride={post.excerpt}
                />
            )}
        </AdminLayout>
    );
};