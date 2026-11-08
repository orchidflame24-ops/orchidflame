/**
 * Compresses and resizes image files using an HTML5 Canvas.
 * Prevents LocalStorage QuotaExceededError by keeping base64 strings under 80KB.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.78
): Promise<string> => {
  return new Promise((resolve) => {
    // If it's not an image, resolve fallback
    if (!file.type.startsWith('image/')) {
      resolve('/bgof.png');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        resolve('/bgof.png');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }

          // Use white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas image compression failed, using original:', err);
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src || '/bgof.png');
      };

      img.src = src;
    };

    reader.onerror = () => {
      resolve('/bgof.png');
    };

    reader.readAsDataURL(file);
  });
};
