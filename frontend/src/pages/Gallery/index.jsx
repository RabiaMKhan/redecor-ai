import { useState } from 'react';
import { Maximize2, Sparkles } from 'lucide-react';
import { Button, Modal, SectionHeading } from '../../components/shared';
import { designStyles } from '../../utils/DummyData';
import { usePageTitle } from '../../utils/utils';
import boho from '../../assets/images/boho.webp';
import bedroom from '../../assets/images/bedroom.webp';
import hero from '../../assets/images/hero.webp';

const extras = [
    { id: 'zen', key: 'boho', name: 'Zen', image: boho, caption: 'Rattan, linen and pampas in a calm neutral room' },
    { id: 'french', key: 'bedroom', name: 'French', image: bedroom, caption: 'Soft blush bedroom with a tufted headboard' },
    { id: 'modern', key: 'hero', name: 'Modern', image: hero, caption: 'Grey sectional with warm, patterned accents' },
];

const items = [
    ...designStyles.map((style) => ({ id: style.id, key: style.id, name: style.name, image: style.image, caption: style.tagline })),
    ...extras,
];

const Gallery = () => {
    usePageTitle('Gallery');
    const [filter, setFilter] = useState('all');
    const [open, setOpen] = useState(null);
    const visible = filter === 'all' ? items : items.filter((item) => item.id === filter);
    const openStyle = open && designStyles.find((style) => style.id === open.id);

    return (
        <div className="container-page pt-10 md:pt-14">
            <SectionHeading
                as="h1"
                eyebrow="Gallery"
                title="Find the style that feels like home"
                text="Browse rooms in ten styles. Found one you love? Mention it in your notes and Redecor AI will lean that way for your space."
            />

            <div className="no-scrollbar -mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
                <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="tablist" aria-label="Filter by style">
                    {[{ id: 'all', name: 'All styles' }, ...designStyles].map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            role="tab"
                            aria-selected={filter === style.id}
                            onClick={() => setFilter(style.id)}
                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${filter === style.id ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink/30'
                                }`}
                        >
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>

            <ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
                {visible.map((item) => (
                    <li key={item.key} className="break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => setOpen(item)}
                            className="group relative block w-full overflow-hidden rounded-2xl bg-sand text-left"
                        >
                            <img src={item.image} alt={`${item.name} interior: ${item.caption}`} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                            <span className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 text-paper">
                                <span>
                                    <span className="block font-display text-xl">{item.name}</span>
                                    <span className="block text-sm text-paper/80">{item.caption}</span>
                                </span>
                                <Maximize2 className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open ? `${open.name} interior` : ''} size="lg" hideTitle>
                {open && (
                    <div>
                        <img src={open.image} alt={`${open.name} interior: ${open.caption}`} className="max-h-[60vh] w-full object-cover" />
                        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                            <div className="max-w-lg">
                                <p className="eyebrow">{open.name} style</p>
                                <p className="mt-2 leading-relaxed text-ink/90">{openStyle?.description}</p>
                                {openStyle && (
                                    <div className="mt-4 flex gap-1.5">
                                        {openStyle.palette.map((hex) => (
                                            <span key={hex} title={hex} className="h-7 w-7 rounded-full ring-1 ring-ink/10" style={{ backgroundColor: hex }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button to="/ai" icon={Sparkles} className="shrink-0">
                                Redesign my space
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Gallery;
