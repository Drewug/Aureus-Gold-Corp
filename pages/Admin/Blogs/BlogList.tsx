import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../../components/AdminLayout';
import { api } from '../../../lib/api';
import { BlogPost, BlogCategory } from '../../../types';
import { Button, Card, PageHeader, Badge, Input } from '../../../components/ui';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const BlogList = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [p, c] = await Promise.all([api.blogs.list(), api.blogs.getCategories()]);
        setPosts(p);
        setCategories(c);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this post?')) {
            await api.blogs.delete(id);
            loadData();
        }
    };

    const filtered = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getCatName = (id: string) => categories.find(c => c.id === id)?.name || 'Uncategorized';

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="Blog Manager" subtitle="Manage news, articles, and educational content." />
                <div className="flex gap-2">
                    <Link to="/admin/blogs/categories">
                        <Button variant="secondary">Manage Categories</Button>
                    </Link>
                    <Link to="/admin/blogs/new">
                        <Button><Plus className="w-4 h-4 mr-2" /> New Post</Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            className="pl-9" 
                            placeholder="Search articles..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="h-10 rounded-md border border-charcoal-lighter bg-charcoal-light px-3 text-sm text-gray-100 focus:ring-2 focus:ring-gold outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Author</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Published</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-charcoal-lighter">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">No posts found.</td></tr>
                                ) : (
                                    filtered.map(post => (
                                        <tr key={post.id} className="hover:bg-charcoal-lighter/50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{post.title}</div>
                                                <div className="text-xs text-gray-500">/{post.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{post.author}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="default">{getCatName(post.categoryId)}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={post.status === 'published' ? 'success' : post.status === 'draft' ? 'warning' : 'default'}>
                                                    {post.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {post.publishedAt ? formatDate(post.publishedAt) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/blogs/${post.slug}`} target="_blank">
                                                        <Button size="sm" variant="secondary" title="View"><Eye className="w-4 h-4" /></Button>
                                                    </Link>
                                                    <Link to={`/admin/blogs/${post.id}`}>
                                                        <Button size="sm" variant="secondary" title="Edit"><Edit className="w-4 h-4" /></Button>
                                                    </Link>
                                                    <Button size="sm" variant="danger" title="Delete" onClick={() => handleDelete(post.id)}><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
};