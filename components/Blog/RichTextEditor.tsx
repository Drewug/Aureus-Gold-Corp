import React from 'react';
import { Bold, Italic, List, Heading1, Heading2, Image, Link as LinkIcon, Quote } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
    
    const insertTag = (tagOpen: string, tagClose: string) => {
        const textarea = document.getElementById('blog-editor-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newValue = `${before}${tagOpen}${selection}${tagClose}${after}`;
        onChange(newValue);
        
        // Restore focus next tick
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
        }, 0);
    };

    const tools = [
        { icon: Bold, action: () => insertTag('<b>', '</b>'), label: 'Bold' },
        { icon: Italic, action: () => insertTag('<i>', '</i>'), label: 'Italic' },
        { icon: Heading1, action: () => insertTag('<h2>', '</h2>'), label: 'H2' },
        { icon: Heading2, action: () => insertTag('<h3>', '</h3>'), label: 'H3' },
        { icon: Quote, action: () => insertTag('<blockquote>', '</blockquote>'), label: 'Quote' },
        { icon: List, action: () => insertTag('<ul>\n  <li>', '</li>\n</ul>'), label: 'List' },
        { icon: LinkIcon, action: () => {
            const url = prompt("Enter URL");
            if(url) insertTag(`<a href="${url}">`, '</a>');
        }, label: 'Link' },
        { icon: Image, action: () => {
            const url = prompt("Enter Image URL");
            if(url) insertTag(`<img src="${url}" alt="Image" className="w-full rounded-lg my-4" />`, '');
        }, label: 'Image' },
    ];

    return (
        <div className={`border border-charcoal-lighter rounded-md overflow-hidden bg-charcoal-light ${className}`}>
            <div className="flex items-center gap-1 p-2 bg-charcoal border-b border-charcoal-lighter">
                {tools.map((tool, idx) => (
                    <button 
                        key={idx}
                        type="button"
                        onClick={tool.action}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-charcoal-lighter rounded"
                        title={tool.label}
                    >
                        <tool.icon className="w-4 h-4" />
                    </button>
                ))}
            </div>
            <textarea
                id="blog-editor-textarea"
                className="w-full h-[500px] bg-charcoal-light p-4 text-gray-200 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};