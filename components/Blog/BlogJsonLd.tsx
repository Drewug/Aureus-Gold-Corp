import React from 'react';
import { BlogPost } from '../../types';

interface BlogJsonLdProps {
    post: BlogPost;
}

export const BlogJsonLd: React.FC<BlogJsonLdProps> = ({ post }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "image": [post.featuredImage],
        "datePublished": post.publishedAt,
        "dateModified": post.publishedAt, // Simplified
        "author": [{
            "@type": "Person",
            "name": post.author,
            "url": "https://aureus.demo/about"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Aureus Gold Corp",
            "logo": {
                "@type": "ImageObject",
                "url": "https://aureus.demo/logo.png"
            }
        },
        "description": post.excerpt
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};