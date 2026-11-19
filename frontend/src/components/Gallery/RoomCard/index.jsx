import { Heart } from 'lucide-react';

// One room in the gallery grid: opens the lightbox, and has its own save button.
const RoomCard = ({ item, saved, onOpen, onToggleSave, index = 0 }) => (
    <li className="mb-5 break-inside-avoid animate-fade-up" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
        <div className="group relative overflow-hidden rounded-3xl bg-sand shadow-soft ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-lift">
            <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Open ${item.name} room: ${item.caption}`}>
                <img
                    src={item.image}
                    alt={`${item.name} interior: ${item.caption}`}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-paper/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink backdrop-blur">
                    {item.mood}
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-paper">
                    <span className="min-w-0">
                        <span className="block font-display text-2xl leading-tight">{item.name}</span>
                        <span className="mt-0.5 block text-sm text-paper/80">{item.caption}</span>
                    </span>
                    <span className="flex shrink-0 -space-x-1.5 transition-all duration-300 group-hover:space-x-0.5" aria-hidden="true">
                        {item.palette.map((hex) => (
                            <span key={hex} className="h-5 w-5 rounded-full ring-2 ring-paper/80" style={{ backgroundColor: hex }} />
                        ))}
                    </span>
                </span>
            </button>
            <button
                type="button"
                onClick={onToggleSave}
                aria-pressed={saved}
                aria-label={saved ? `Remove ${item.name} room from saved: ${item.caption}` : `Save ${item.name} room: ${item.caption}`}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-paper/85 text-ink shadow-soft backdrop-blur transition-transform hover:scale-110 active:scale-95"
            >
                <Heart className={`h-[18px] w-[18px] transition-colors ${saved ? 'fill-clay text-clay' : ''}`} />
            </button>
        </div>
    </li>
);

export default RoomCard;
