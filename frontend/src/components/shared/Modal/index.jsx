import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };

const Modal = ({ open, onClose, title, children, size = 'md', hideTitle = false }) => {
    const panelRef = useRef(null);
    // Keep the latest onClose without re-running the effect on every parent render
    // (re-running it would pull focus out of inputs while the user types).
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return undefined;
        const previouslyFocused = document.activeElement;
        const onKey = (event) => event.key === 'Escape' && onCloseRef.current?.();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        // Let an autoFocus input inside keep focus; otherwise focus the dialog itself
        if (!panelRef.current?.contains(document.activeElement)) {
            panelRef.current?.focus();
        }
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            previouslyFocused?.focus?.();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                className={`relative max-h-[92vh] w-full ${widths[size] || widths.md} animate-fade-up overflow-y-auto rounded-t-3xl bg-paper shadow-lift focus:outline-none sm:rounded-3xl`}
            >
                <div className={`sticky top-0 z-10 flex items-center justify-between gap-4 bg-paper/95 px-5 py-4 backdrop-blur sm:px-7 ${hideTitle ? 'pointer-events-none absolute right-0 bg-transparent' : 'border-b border-line'}`}>
                    {!hideTitle && <h2 className="font-display text-xl text-ink">{title}</h2>}
                    <button
                        type="button"
                        onClick={onClose}
                        className="pointer-events-auto ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-muted hover:bg-sand hover:text-ink"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className={hideTitle ? '' : 'px-5 py-5 sm:px-7 sm:py-6'}>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
