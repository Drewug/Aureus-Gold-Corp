import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, BlogCategory } from '../../types';
import { Card } from '../ui';
import { Clock, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface BlogCardProps {
    post: BlogPost;
    category?: BlogCategory;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, category }) => {
    return (
        <Link to={`/blogs/${post.slug}`} className="group block h-full">
            <Card className="h-full p-0 overflow-hidden border-charcoal-lighter group-hover:border-gold/50 transition-all duration-300 flex flex-col bg-charcoal-light">
                <div className="aspect-[16/9] relative overflow-hidden bg-charcoal">
                    <img 
                        src={post.featuredImage || 'https://placehold.co/800x450/1a1a1c/d4af37?text=No+Image'} 
                        alt={post.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                    />
                    {category && (
                        <div className="absolute top-4 left-4 bg-charcoal/90 text-gold text-xs font-bold px-3 py-1 rounded uppercase tracking-wider backdrop-blur">
                            {category.name}
                        </div>
                    )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.publishedAt || '')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTimeMinutes} min read</span>
                    </div>
                    
                    <h3 className="font-serif text-xl text-white mb-3 leading-tight group-hover:text-gold transition-colors">
                        {post.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed flex-1">
                        {post.excerpt}
                    </p>

                    <div className="text-gold text-sm font-medium flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                        Read Article &rarr;
                    </div>
                </div>
            </Card>
        </Link>
    );
};