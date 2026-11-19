import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Compass, Heart, Sparkles } from 'lucide-react';
import { Button, Reveal, SectionHeading } from '../../components/shared';
import RoomCard from '../../components/Gallery/RoomCard';
import RoomLightbox from '../../components/Gallery/RoomLightbox';
import StyleQuiz from '../../components/Gallery/StyleQuiz';
import StyleSpotlight from '../../components/Gallery/StyleSpotlight';
import { designStyles, getStyleById, styleMoods } from '../../utils/DummyData';
import { usePageTitle } from '../../utils/utils';
import boho from '../../assets/images/boho.webp';
import bedroom from '../../assets/images/bedroom.webp';
import hero from '../../assets/images/hero.webp';

const extras = [
    { id: 'zen', key: 'boho', image: boho, caption: 'Rattan, linen and pampas in a calm neutral room' },
    { id: 'french', key: 'bedroom', image: bedroom, caption: 'Soft blush bedroom with a tufted headboard' },
    { id: 'modern', key: 'hero', image: hero, caption: 'Grey sectional with warm, patterned accents' },
];

// Every room carries its style's details so cards and the lightbox can show them
const toItem = ({ id, key, image, caption }) => {
    const style = getStyleById(id);
    return { ...style, key, image, caption: caption || style.tagline };
};

const items = [...designStyles.map((style) => toItem({ id: style.id, key: style.id, image: style.image })), ...extras.map(toItem)];

const SAVED_KEY = 'redecor:saved-rooms';

const readSaved = () => {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : [];
    } catch {
        return [];
    }
};

const Gallery = () => {
    usePageTitle('Gallery');
    const [filter, setFilter] = useState('all');
    const [openKey, setOpenKey] = useState(null);
    const [saved, setSaved] = useState(readSaved);

    useEffect(() => {
        try {
            window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
        } catch {
            // Storage can be blocked (private mode); saving then lasts for this visit only
        }
    }, [saved]);

    const toggleSave = (key) => setSaved((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

    const visible = useMemo(() => {
        if (filter === 'all') return items;
        if (filter === 'saved') return items.filter((item) => saved.includes(item.key));
        return items.filter((item) => item.mood === filter);
    }, [filter, saved]);

    const filters = [
        { id: 'all', label: 'All rooms', count: items.length },
        ...styleMoods.map((mood) => ({ id: mood, label: mood, count: items.filter((item) => item.mood === mood).length })),
        { id: 'saved', label: 'Saved', count: saved.length, icon: Heart },
    ];

    const openItem = openKey ? items.find((item) => item.key === openKey) : null;
    const position = openKey ? visible.findIndex((item) => item.key === openKey) : -1;

    const step = useCallback(
        (direction) => {
            setOpenKey((key) => {
                const index = visible.findIndex((item) => item.key === key);
                if (index === -1) return key;
                return visible[(index + direction + visible.length) % visible.length].key;
            });
        },
        [visible]
    );

    // From the spotlight or quiz: show every room so prev/next works from there
    const openStyle = (styleId) => {
        setFilter('all');
        setOpenKey(styleId);
    };

    return (
        <>
            {/* Header with today's featured style */}
            <section className="relative isolate overflow-hidden">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-clay-light opacity-70 blur-3xl" />
                    <div className="absolute -right-24 top-40 h-[380px] w-[380px] rounded-full bg-sage-light opacity-80 blur-3xl" />
                    <div className="dot-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
                </div>
                <div className="container-page grid items-center gap-14 pb-16 pt-10 md:pt-14 lg:grid-cols-2 lg:gap-16 lg:pb-24">
                    <div className="animate-fade-up">
                        <p className="eyebrow">Gallery</p>
                        <h1 className="mt-4 font-display text-[42px] leading-[1.04] tracking-tight text-ink sm:text-6xl">
                            Find the style that <em className="font-normal text-clay">feels like home.</em>
                        </h1>
                        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
                            Browse rooms in ten styles, save the ones you love, and copy their colours. Not sure where to start? Take the
                            30-second style quiz.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 xs:flex-row">
                            <Button href="#style-quiz" size="lg" icon={Compass}>
                                Find my style
                            </Button>
                            <Button href="#rooms" size="lg" variant="secondary" iconRight={ArrowRight}>
                                Browse rooms
                            </Button>
                        </div>
                        <dl className="mt-10 grid max-w-sm grid-cols-3 gap-6 border-t border-line pt-6">
                            {[
                                [designStyles.length, 'styles'],
                                [items.length, 'rooms'],
                                [designStyles.length * 5, 'colours'],
                            ].map(([value, label]) => (
                                <div key={label}>
                                    <dt className="sr-only">{label}</dt>
                                    <dd className="font-display text-3xl text-ink">{value}</dd>
                                    <dd className="mt-1 text-sm text-muted">{label}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <StyleSpotlight onOpen={openStyle} />
                </div>
            </section>

            {/* Mood filters stay in reach while scrolling */}
            <div id="rooms" className="sticky top-[72px] z-30 scroll-mt-[72px] border-y border-line bg-cream/90 backdrop-blur-md">
                <div className="container-page flex items-center gap-4 py-3">
                    <div className="no-scrollbar -mx-4 flex-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                        <div className="flex w-max gap-2" role="tablist" aria-label="Filter rooms by mood">
                            {filters.map(({ id, label, count, icon: Icon }) => {
                                const active = filter === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setFilter(id)}
                                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink/30'}`}
                                    >
                                        {Icon && <Icon className={`h-3.5 w-3.5 ${active ? 'fill-paper' : count ? 'fill-clay text-clay' : ''}`} />}
                                        {label}
                                        <span className={`text-xs ${active ? 'text-paper/60' : 'text-muted'}`}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <section className="container-page pt-8" aria-label="Rooms">
                {visible.length > 0 ? (
                    <ul key={filter} className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                        {visible.map((item, index) => (
                            <RoomCard
                                key={item.key}
                                item={item}
                                index={index}
                                saved={saved.includes(item.key)}
                                onOpen={() => setOpenKey(item.key)}
                                onToggleSave={() => toggleSave(item.key)}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-light text-clay">
                            <Heart className="h-6 w-6" />
                        </span>
                        <h2 className="mt-4 font-display text-2xl text-ink">No saved rooms yet</h2>
                        <p className="mt-2 max-w-sm text-muted">Tap the heart on any room to keep it here. Saved rooms stay in this browser.</p>
                        <Button variant="secondary" className="mt-6" onClick={() => setFilter('all')}>
                            Browse all rooms
                        </Button>
                    </div>
                )}
            </section>

            {/* Style quiz */}
            <section id="style-quiz" className="container-page scroll-mt-28 pt-20 lg:pt-28">
                <Reveal>
                    <SectionHeading
                        eyebrow="Style quiz"
                        title="Not sure which style is yours?"
                        text="Answer three quick questions and we'll match you with a style. Then try it on a photo of your own room."
                    />
                </Reveal>
                <Reveal delay={100} className="mt-10">
                    <StyleQuiz onViewStyle={openStyle} />
                </Reveal>
            </section>

            {/* Closing call to action */}
            <section className="container-page pt-20 lg:pt-28">
                <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-center text-paper sm:px-12 sm:py-16">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex justify-center">
                        {designStyles.slice(0, 5).map((style, i) => (
                            <span
                                key={style.id}
                                className="mx-[-2%] h-full w-1/4 bg-cover bg-center opacity-50"
                                style={{ backgroundImage: `url(${style.image})`, transform: `rotate(${(i - 2) * 4}deg) scale(1.2)` }}
                            />
                        ))}
                        <span className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink/95" />
                    </div>
                    <div className="relative">
                        <h2 className="mx-auto max-w-2xl font-display text-4xl leading-[1.08] sm:text-5xl">Love a style? See it in your own room.</h2>
                        <p className="mx-auto mt-4 max-w-lg text-lg text-paper/70">Upload one photo. Redecor AI writes the plan and shows you the result.</p>
                        <Button to="/ai" size="lg" icon={Sparkles} className="mt-8">
                            Redesign my space
                        </Button>
                    </div>
                </Reveal>
            </section>

            <RoomLightbox
                item={openItem}
                position={position === -1 ? null : position}
                total={visible.length}
                onClose={() => setOpenKey(null)}
                onStep={step}
                saved={openItem ? saved.includes(openItem.key) : false}
                onToggleSave={() => openItem && toggleSave(openItem.key)}
            />
        </>
    );
};

export default Gallery;
