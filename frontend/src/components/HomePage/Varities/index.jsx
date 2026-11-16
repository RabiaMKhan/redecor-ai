import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button, SectionHeading } from '../../shared';
import { designStyles } from '../../../utils/DummyData';

// The ten design styles
const Varities = () => (
    <section className="container-page py-20 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
                eyebrow="Inspiration"
                title="Styles our designer knows by heart"
                text="You don't have to choose one. Redecor AI picks what suits your space, but if you love a style, mention it in your notes."
            />
            <Button to="/gallery" variant="secondary" iconRight={ArrowRight} className="shrink-0">
                See the gallery
            </Button>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {designStyles.map((style, index) => (
                <li key={style.id} className={index === 0 ? 'col-span-2 sm:col-span-1' : ''}>
                    <Link to="/gallery" className="group block">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
                            <img
                                src={style.image}
                                alt={`${style.name} interior`}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <span className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-paper/90 text-ink opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                        </div>
                        <h3 className="mt-3 font-display text-xl text-ink">{style.name}</h3>
                        <p className="text-sm text-muted">{style.tagline}</p>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

export default Varities;
