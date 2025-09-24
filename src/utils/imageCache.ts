import { isExternalUrl } from './imageUtils';

const buildKey = (animalId: number) => `animal:image:${animalId}`;

export const cacheAnimalImage = async (animalId: number, imageUrl: string) => {
  if (!imageUrl) return;
  
  try {
    // For external URLs, we can't cache them due to CORS restrictions
    // We'll just validate that the URL exists but won't cache the content
    if (isExternalUrl(imageUrl)) {
      console.log(`[ImageCache] Skipping cache for external URL: ${imageUrl}`);
      
      // Try to validate the external URL exists (using no-cors mode)
      try {
        await fetch(imageUrl, { 
          mode: 'no-cors',
          cache: 'no-store'
        });
        console.log(`[ImageCache] External URL validated: ${imageUrl}`);
      } catch (error) {
        console.warn(`[ImageCache] External URL validation failed: ${imageUrl}`, error);
      }
      return;
    }

    // For local/same-origin URLs, proceed with normal caching
    const response = await fetch(imageUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.warn(`[ImageCache] Failed to fetch image: ${response.status} ${response.statusText}`);
      return;
    }
    
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem(buildKey(animalId), reader.result as string);
        console.log(`[ImageCache] Successfully cached image for animal ${animalId}`);
      } catch (error) {
        console.warn(`[ImageCache] Failed to store in localStorage:`, error);
      }
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.warn(`[ImageCache] Error caching image for animal ${animalId}:`, error);
  }
};

export const getCachedAnimalImage = (animalId: number): string | null => {
  try {
    return localStorage.getItem(buildKey(animalId));
  } catch {
    return null;
  }
};

export const removeCachedAnimalImage = (animalId: number) => {
  try {
    localStorage.removeItem(buildKey(animalId));
  } catch {
    // ignore
  }
};


