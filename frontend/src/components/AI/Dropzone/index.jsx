import { useRef, useState } from 'react';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 10 * 1024 * 1024;

export const checkImageFile = (file) => {
    if (!file) return 'Choose a photo of your space';
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP photo (iPhone HEIC photos are not supported yet)';
    if (file.size > MAX_BYTES) return 'That photo is over 10 MB. Try a smaller one.';
    return '';
};

const Dropzone = ({ previewUrl, fileName, onSelect, onClear, error, disabled }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const pick = () => inputRef.current?.click();

    const handleFiles = (files) => {
        const file = files?.[0];
        if (file) onSelect(file);
    };

    const onDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = '';
                }}
                aria-hidden="true"
            />
            {previewUrl ? (
                <div className="relative overflow-hidden rounded-2xl bg-sand">
                    <img src={previewUrl} alt="Your space" className="aspect-[4/3] w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-10">
                        <p className="truncate text-sm text-paper/90">{fileName}</p>
                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={pick}
                                disabled={disabled}
                                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-paper/95 px-3 text-sm font-medium text-ink hover:bg-white disabled:opacity-60"
                            >
                                <RefreshCw className="h-4 w-4" /> Replace
                            </button>
                            <button
                                type="button"
                                onClick={onClear}
                                disabled={disabled}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/95 text-ink hover:bg-white disabled:opacity-60"
                                aria-label="Remove photo"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={pick}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    disabled={disabled}
                    className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors ${dragging ? 'border-clay bg-clay-light/60' : error ? 'border-danger/60 bg-danger-light/40' : 'border-ink/15 bg-cream hover:border-clay/60 hover:bg-clay-light/30'
                        }`}
                >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper text-clay shadow-soft">
                        <ImagePlus className="h-6 w-6" />
                    </span>
                    <span className="font-display text-xl text-ink">Drop a photo of your space</span>
                    <span className="text-sm text-muted">
                        or <span className="font-medium text-clay underline underline-offset-4">browse your files</span> · JPG, PNG or WebP up to 10 MB
                    </span>
                </button>
            )}
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
    );
};

export default Dropzone;
