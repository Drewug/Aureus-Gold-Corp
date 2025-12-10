import React, { useState, useEffect, useRef } from 'react';
import { MediaAsset, CMSContent, Product } from '../types';
import { getAssets, saveAsset, deleteAsset, processFile, updateAsset } from '../lib/media';
import { api } from '../lib/api';
import { Button, Card, Input, Label, Badge } from './ui';
import { Upload, Search, Folder, Image as ImageIcon, Trash2, Copy, Replace, CheckCircle, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const MediaLibrary = ({ onSelect }: { onSelect?: (url: string) => void }) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceCount, setReplaceCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
    
    // Paste listener
    const handlePaste = (e: ClipboardEvent) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) {
            handleFiles(e.clipboardData.files);
        }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const loadAssets = () => {
    setAssets(getAssets());
  };

  const handleFiles = async (fileList: FileList) => {
    setIsUploading(true);
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    
    for (const file of files) {
        try {
            const asset = await processFile(file);
            saveAsset(asset);
        } catch (e) {
            console.error("Failed to process file", file.name, e);
        }
    }
    loadAssets();
    setIsUploading(false);
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to delete this asset?')) {
          deleteAsset(id);
          setSelectedAsset(null);
          loadAssets();
      }
  };

  const handleReplaceGlobal = async () => {
      if (!selectedAsset) return;
      
      const oldUrl = prompt("Enter the URL of the image you want to replace with this asset:");
      if (!oldUrl) return;

      if (oldUrl === selectedAsset.url) {
          alert("Old and new URL are the same.");
          return;
      }

      setReplaceMode(true);
      
      try {
          // 1. Fetch all data
          const [cms, products] = await Promise.all([api.cms.get(), api.products.list()]);
          
          let count = 0;

          // 2. Stringify and Replace
          const cmsStr = JSON.stringify(cms);
          const productsStr = JSON.stringify(products);
          
          // Naive count for feedback
          const escapedOldUrl = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedOldUrl, 'g');
          
          const newCmsStr = cmsStr.replace(regex, selectedAsset.url);
          const newProductsStr = productsStr.replace(regex, selectedAsset.url);

          const cmsChanges = (cmsStr.match(regex) || []).length;
          const productChanges = (productsStr.match(regex) || []).length;
          count = cmsChanges + productChanges;

          if (count > 0) {
             if(confirm(`Found ${count} occurrences. Replace all?`)) {
                 await api.cms.update(JSON.parse(newCmsStr));
                 
                 const newProducts: Product[] = JSON.parse(newProductsStr);
                 for (const p of newProducts) {
                     await api.products.update(p); 
                 }
                 
                 setReplaceCount(count);
                 await api.logs.create('system', 'Global Replace', `Replaced ${count} occurrences of image URL with asset ${selectedAsset.filename}`, {
                     author: 'Admin',
                     details: { oldUrl, newUrl: selectedAsset.url }
                 });
             }
          } else {
              alert("No occurrences found.");
          }

      } catch (e) {
          console.error(e);
          alert("Error performing replacement.");
      } finally {
          setReplaceMode(false);
      }
  };

  const filteredAssets = assets.filter(a => 
      a.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-charcoal-light rounded-lg border border-charcoal-lighter overflow-hidden"
         onDragOver={e => e.preventDefault()}
         onDrop={e => {
             e.preventDefault();
             handleFiles(e.dataTransfer.files);
         }}
    >
        {/* Toolbar */}
        <div className="p-4 border-b border-charcoal-lighter flex items-center justify-between gap-4 bg-charcoal">
            <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search media..." 
                    className="bg-transparent border-none text-white focus:ring-0 w-full"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={e => e.target.files && handleFiles(e.target.files)}
                />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                </Button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredAssets.map(asset => (
                        <div 
                            key={asset.id} 
                            className={`aspect-square rounded border cursor-pointer overflow-hidden group relative ${selectedAsset?.id === asset.id ? 'border-gold ring-2 ring-gold/20' : 'border-charcoal-lighter hover:border-gray-500'}`}
                            onClick={() => setSelectedAsset(asset)}
                        >
                            <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover bg-charcoal-lighter" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium truncate px-2">{asset.filename}</span>
                            </div>
                        </div>
                    ))}
                    {filteredAssets.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>No media found. Drag & Drop or Paste images here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Details */}
            {selectedAsset && (
                <div className="w-80 bg-charcoal border-l border-charcoal-lighter p-4 overflow-y-auto flex flex-col gap-6">
                    <div>
                        <div className="aspect-video bg-charcoal-lighter rounded border border-charcoal-lighter mb-4 flex items-center justify-center overflow-hidden">
                            <img src={selectedAsset.url} className="max-w-full max-h-full" alt="" />
                        </div>
                        <h3 className="text-white font-medium truncate mb-1" title={selectedAsset.filename}>{selectedAsset.filename}</h3>
                        <p className="text-xs text-gray-500 mb-4">{Math.round(selectedAsset.size / 1024)} KB &bull; {selectedAsset.width}x{selectedAsset.height}</p>
                        
                        <div className="flex gap-2 mb-6">
                             {onSelect && (
                                 <Button size="sm" className="flex-1" onClick={() => onSelect(selectedAsset.url)}>Select</Button>
                             )}
                             <Button variant="outline" size="sm" onClick={() => {
                                 navigator.clipboard.writeText(selectedAsset.url);
                                 alert('URL copied to clipboard');
                             }}>
                                 <Copy className="w-4 h-4" />
                             </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Tags</Label>
                            <Input 
                                placeholder="Add tags (comma separated)..." 
                                value={selectedAsset.tags.join(', ')}
                                onChange={(e) => {
                                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                    const updated = { ...selectedAsset, tags };
                                    setSelectedAsset(updated);
                                    updateAsset(updated);
                                }}
                            />
                        </div>

                        <div>
                            <Label>Manage</Label>
                             <Button variant="secondary" className="w-full mb-2 justify-start" onClick={handleReplaceGlobal}>
                                <Replace className="w-4 h-4 mr-2" /> Replace Occurrences
                            </Button>
                            <Button variant="danger" className="w-full justify-start" onClick={() => handleDelete(selectedAsset.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Asset
                            </Button>
                        </div>
                        
                        {replaceCount !== null && (
                            <div className="bg-green-900/20 text-green-400 p-3 rounded text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Replaced in {replaceCount} locations.
                            </div>
                        )}
                    </div>
                    
                    <button className="mt-auto text-gray-500 hover:text-white flex items-center justify-center" onClick={() => setSelectedAsset(null)}>
                        <X className="w-4 h-4 mr-2" /> Close Details
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};