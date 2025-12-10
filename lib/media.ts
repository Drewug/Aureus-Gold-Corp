import { MediaAsset } from '../types';
import { localDb } from './localDb';
import { v4 as uuidv4 } from 'uuid';

const MAX_DIMENSION = 1200;
const COMPRESSION_QUALITY = 0.8;

export const processFile = (file: File): Promise<MediaAsset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if necessary
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG for photos to save space (or keep original mime if transparency needed, but simplifying here)
        // Using file.type if valid image type, else default to jpeg
        const mimeType = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, COMPRESSION_QUALITY);

        // Approximate size of base64 string
        const size = Math.round((dataUrl.length * 3) / 4);

        const asset: MediaAsset = {
          id: uuidv4(),
          url: dataUrl,
          filename: file.name,
          mimeType,
          size,
          width,
          height,
          tags: [],
          folder: 'uploads',
          createdAt: new Date().toISOString()
        };

        resolve(asset);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const saveAsset = (asset: MediaAsset) => {
  const assets = localDb.getMedia();
  assets.unshift(asset);
  localDb.saveMedia(assets);
};

export const deleteAsset = (id: string) => {
  const assets = localDb.getMedia();
  const filtered = assets.filter((a: MediaAsset) => a.id !== id);
  localDb.saveMedia(filtered);
};

export const getAssets = (): MediaAsset[] => {
  return localDb.getMedia();
};

export const updateAsset = (asset: MediaAsset) => {
    const assets = localDb.getMedia();
    const index = assets.findIndex((a: MediaAsset) => a.id === asset.id);
    if(index !== -1) {
        assets[index] = asset;
        localDb.saveMedia(assets);
    }
}
