import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Home, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '../../shared';

const copyHex = async (hex) => {
    try {
        await navigator.clipboard.writeText(hex);
        toast.success(`Copied ${hex}`);
    } catch {
        toast.error('Could not copy. Your browser blocked the clipboard.');
    }
};

const NavButton = ({ side, onClick, label }) => {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-soft backdrop-blur transition hover:scale-105 hover:bg-paper ${side === 'left' ? 'left-3 sm:left-4' : 'right-3 sm:right-4'}`}
        >
            <Icon className="h-5 w-5" />
        </button>
    );
};

// Big view of one room: style notes, palette you can copy, save, and a link to try it.
// `position`/`total` are null when the room is not in the current filter (no prev/next then).
const RoomLightbox = ({ item, position, total, onClose, onStep, saved, onToggleSave }) => {
    const canStep = item && position !== null && total > 1;

    useEffect(() => {
        if (!canStep) return undefined;
        const onKey = (event) => {
            if (event.key === 'ArrowRight') onStep(1);
            if (event.key === 'ArrowLeft') onStep(-1);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [canStep, onStep]);

    return (
        <Modal open={Boolean(item)} onClose={onClose} title={item ? `${item.name} interior` : ''} size="lg" hideTitle>
            {item && (
                <div>
                    <div className="relative bg-ink">
                        <img
                            key={item.key}
                            src={item.image}
                            alt={`${item.name} interior: ${item.caption}`}
                            className="max-h-[58vh] w-full animate-fade-in object-cover"
                        />
                        {canStep && (
                            <>
                                <NavButton side="left" onClick={() => onStep(-1)} label="Previous room" />
                                <NavButton side="right" onClick={() => onStep(1)} label="Next room" />
                                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/60 px-3 py-1 text-xs font-medium text-paper backdrop-blur">
                                    {position + 1} / {total}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.25fr_1fr]">
                        <div>
                            <p className="eyebrow">
                                {item.name} style · {item.mood}
                            </p>
                            <p className="mt-2 font-display text-2xl leading-snug text-ink">{item.caption}</p>
                            <p className="mt-3 leading-relaxed text-ink/80">{item.description}</p>
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1.5 text-sm text-muted">
                                    <Home className="h-4 w-4" /> Best for
                                </span>
                                {item.bestFor.map((room) => (
                                    <span key={room} className="rounded-full bg-sand px-3 py-1 text-sm text-ink">
                                        {room}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Palette · tap a colour to copy</p>
                            <div className="mt-3 grid grid-cols-5 gap-2">
                                {item.palette.map((hex) => (
                                    <button key={hex} type="button" onClick={() => copyHex(hex)} className="group text-left" aria-label={`Copy colour ${hex}`}>
                                        <span
                                            className="block h-14 rounded-xl ring-1 ring-ink/10 transition-transform group-hover:-translate-y-0.5 group-hover:shadow-soft"
                                            style={{ backgroundColor: hex }}
                                        />
                                        <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-wide text-muted group-hover:text-ink">{hex}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                        <Button
                            variant="secondary"
                            onClick={onToggleSave}
                            aria-pressed={saved}
                            icon={(props) => <Heart {...props} className={`${props.className} ${saved ? 'fill-clay text-clay' : ''}`} />}
                        >
                            {saved ? 'Saved' : 'Save room'}
                        </Button>
                        <Button to={`/ai?style=${item.id}`} icon={Sparkles}>
                            Try this style on my room
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default RoomLightbox;
