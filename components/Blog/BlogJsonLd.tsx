import React, { useEffect } from 'react';
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
            "url": "https://www.aureusgoldcorp.com/about"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Aureus Gold Corp",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.aureusgoldcorp.com/logo.png"
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