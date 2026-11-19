import { ArrowUpRight } from 'lucide-react';
import { designStyles } from '../../../utils/DummyData';

// A different style is featured each day; the next two fill the collage.
export const styleOfTheDay = (date = new Date()) => {
    const day = Math.floor(date.getTime() / 86400000);
    const index = day % designStyles.length;
    return [0, 1, 2].map((offset) => designStyles[(index + offset) % designStyles.length]);
};

const StyleSpotlight = ({ onOpen }) => {
    const [featured, second, third] = styleOfTheDay();

    return (
        <div className="relative mx-auto w-full max-w-lg animate-fade-up pb-10 [animation-delay:120ms] lg:max-w-none">
            <div className="grid gap-4 sm:grid-cols-[1.45fr_1fr]">
                <button
                    type="button"
                    onClick={() => onOpen(featured.id)}
                    className="group relative aspect-[3/4] overflow-hidden rounded-arch bg-sand shadow-lift sm:aspect-auto sm:h-full sm:min-h-[420px]"
                    aria-label={`Open the style of the day: ${featured.name}`}
                >
                    <img src={featured.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                </button>
                <div className="hidden flex-col gap-4 pt-14 sm:flex">
                    {[second, third].map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => onOpen(style.id)}
                            className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand shadow-soft"
                            aria-label={`Open ${style.name} style`}
                        >
                            <img src={style.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
                                {style.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute -bottom-1 left-3 right-3 animate-float rounded-2xl border border-line bg-paper/95 p-4 shadow-lift backdrop-blur sm:-left-6 sm:right-auto sm:w-72">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Style of the day</p>
                    <button
                        type="button"
                        onClick={() => onOpen(featured.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper transition-transform hover:rotate-45"
                        aria-label={`View ${featured.name} style`}
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-1 font-display text-2xl text-ink">{featured.name}</p>
                <p className="text-sm text-muted">{featured.tagline}</p>
                <div className="mt-3 flex overflow-hidden rounded-lg">
                    {featured.palette.map((hex) => (
                        <span key={hex} className="h-7 flex-1" style={{ backgroundColor: hex }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StyleSpotlight;
