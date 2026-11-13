/**
 * Builds a sized URL for Unsplash photos so lists never download full-resolution images.
 * Any other URL (uploads, data URLs) is returned untouched.
 */
export function photo(url: string, width: number, height?: number) {
  if (!url.startsWith('https://images.unsplash.com/')) return url;
  const sized = new URL(url);
  sized.searchParams.set('auto', 'format');
  sized.searchParams.set('fit', 'crop');
  sized.searchParams.set('q', '70');
  sized.searchParams.set('w', String(width));
  if (height) sized.searchParams.set('h', String(height));
  return sized.toString();
}

/** Downscales an image file in the browser before upload, so uploads stay small. */
export async function resizeImage(file: File, maxSize = 1200, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process this image.'))), 'image/jpeg', quality),
  );
}
