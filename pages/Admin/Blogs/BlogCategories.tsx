import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { api } from '../../../lib/api';
import { BlogCategory } from '../../../types';
import { Button, Card, PageHeader, Input, Label } from '../../../components/ui';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const BlogCategories = () => {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [editing, setEditing] = useState<BlogCategory | null>(null); // null = create mode
    const [formState, setFormState] = useState({ name: '', slug: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setCategories(await api.blogs.getCategories());
    };

    const handleEdit = (cat: BlogCategory) => {
        setEditing(cat);
        setFormState({ name: cat.name, slug: cat.slug });
    };

    const handleCancel = () => {
        setEditing(null);
        setFormState({ name: '', slug: '' });
    };

    const handleSave = async () => {
        if (!formState.name) return;
        const slug = formState.slug || formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const category: BlogCategory = {
            id: editing ? editing.id : `bc_${uuidv4()}`,
            name: formState.name,
            slug
        };

        await api.blogs.saveCategory(category);
        loadData();
        handleCancel();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this category?')) {
            await api.blogs.deleteCategory(id);
            loadData();
        }
    };

    return (
        <AdminLayout>
            <PageHeader title="Blog Categories" subtitle="Organize your content structure." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <h3 className="text-white font-medium mb-4">{editing ? 'Edit Category' : 'New Category'}</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input 
                                    value={formState.name} 
                                    onChange={e => setFormState({...formState, name: e.target.value})} 
                                    placeholder="e.g. Market Analysis"
                                />
                            </div>
                            <div>
                                <Label>Slug</Label>
                                <Input 
                                    value={formState.slug} 
                                    onChange={e => setFormState({...formState, slug: e.target.value})} 
                                    placeholder="auto-generated"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" /> {editing ? 'Update' : 'Create'}
                                </Button>
                                {editing && (
                                    <Button variant="secondary" onClick={handleCancel}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="p-0 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-charcoal-lighter text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Slug</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-charcoal-lighter">
                                {categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-charcoal-lighter/50">
                                        <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">{cat.slug}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-gold p-1">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">No categories found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};