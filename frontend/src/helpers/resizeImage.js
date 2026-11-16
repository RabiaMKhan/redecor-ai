// Shrinks a photo in the browser before upload.
// Why: Vercel functions reject request bodies over 4.5 MB, and phone photos are often 5–12 MB.
// The AI only needs ~1600 px anyway, so this also makes uploads much faster.

const loadBitmap = async (file) => {
    if (typeof createImageBitmap === 'function') {
        // 'from-image' respects the EXIF rotation of phone photos
        return createImageBitmap(file, { imageOrientation: 'from-image' });
    }
    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
    } finally {
        URL.revokeObjectURL(url);
    }
};

/**
 * Returns a JPEG File no larger than maxSize px on its longest edge.
 * Small files that are already within the limits are returned unchanged.
 */
export const resizeImage = async (file, { maxSize = 1600, quality = 0.85, skipBelowBytes = 600 * 1024 } = {}) => {
    const bitmap = await loadBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;
    const scale = Math.min(1, maxSize / Math.max(width, height));

    if (scale === 1 && file.size <= skipBelowBytes) {
        bitmap.close?.();
        return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d');
    // White background so transparent PNGs don't turn black as JPEG
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Could not process the photo'))), 'image/jpeg', quality);
    });
    const name = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
};

export default resizeImage;
