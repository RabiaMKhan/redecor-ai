import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button, Reveal, SectionHeading } from '../../shared';
import { designStyles } from '../../../utils/DummyData';

// The ten design styles, framed like arched windows
const Varities = () => (
    <section className="container-page py-20 lg:py-28">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
                eyebrow="Inspiration"
                title="Styles our designer knows by heart"
                text="You don't have to choose one. Redecor AI picks what suits your space, but if you love a style, mention it in your notes."
            />
            <Button to="/gallery" variant="secondary" iconRight={ArrowRight} className="shrink-0">
                See the gallery
            </Button>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {designStyles.map((style, index) => (
                <Reveal as="li" key={style.id} delay={(index % 5) * 80}>
                    <Link to="/gallery" className="group block">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-arch bg-sand shadow-soft ring-1 ring-ink/5 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift">
                            <img
                                src={style.image}
                                alt={`${style.name} interior`}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-all duration-500 group-hover:-translate-y-1 group-hover:opacity-100">
                                {style.palette.map((hex) => (
                                    <span key={hex} className="h-3.5 w-3.5 rounded-full ring-2 ring-paper/80" style={{ backgroundColor: hex }} />
                                ))}
                            </span>
                            <span className="absolute right-3 top-1/4 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink opacity-0 transition-all group-hover:opacity-100">
                                <ArrowUpRight className="h-4 w-4" />
                            </span>
                        </div>
                        <h3 className="mt-3 text-center font-display text-xl text-ink">{style.name}</h3>
                        <p className="text-center text-sm text-muted">{style.tagline}</p>
                    </Link>
                </Reveal>
            ))}
        </ul>
    </section>
);

export default Varities;
