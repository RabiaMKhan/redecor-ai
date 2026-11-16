import { ArrowRight, ScanSearch } from 'lucide-react';
import { Button } from '../../shared';
import hero from '../../../assets/images/hero.webp';
import { getStyleById } from '../../../utils/DummyData';

const modern = getStyleById('modern');

const LandingSection = () => (
    <section className="container-page grid items-center gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
        <div className="animate-fade-up">
            <p className="eyebrow">AI interior analysis &amp; redesign</p>
            <h1 className="mt-5 font-display text-[44px] leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[68px]">
                Show us your room. <em className="font-normal text-clay">See it better.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                Upload a photo of any room or corner of your home. Redecor AI explains what to change for a better
                interior, step by step, and then shows you the redesigned space.
            </p>
            <div className="mt-9 flex flex-col gap-3 xs:flex-row">
                <Button to="/ai" size="lg" icon={ScanSearch}>
                    Analyse my space
                </Button>
                <Button to="/gallery" size="lg" variant="secondary" iconRight={ArrowRight}>
                    Get inspired
                </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
                {[
                    ['Any', 'room or corner'],
                    ['4–8', 'clear changes'],
                    ['1', 'visual result'],
                ].map(([value, label]) => (
                    <div key={label}>
                        <dt className="sr-only">{label}</dt>
                        <dd className="font-display text-3xl text-ink">{value}</dd>
                        <dd className="mt-1 text-sm text-muted">{label}</dd>
                    </div>
                ))}
            </dl>
        </div>

        <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:120ms]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-arch shadow-lift">
                <img
                    src={hero}
                    alt="A bright modern living room with a grey sectional sofa and colourful cushions"
                    className="h-full w-full object-cover"
                    fetchpriority="high"
                />
                <span className="absolute bottom-4 right-4 rounded-full bg-clay px-3 py-1 text-xs font-medium text-paper">After</span>
            </div>

            <div className="absolute -left-2 bottom-12 w-60 rounded-2xl border border-line bg-paper/95 p-4 shadow-lift backdrop-blur sm:-left-10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Suggested palette</p>
                <div className="mt-3 flex overflow-hidden rounded-lg">
                    {modern.palette.map((hex) => (
                        <span key={hex} className="h-10 flex-1" style={{ backgroundColor: hex }} />
                    ))}
                </div>
                <p className="mt-3 text-sm text-ink">Soft greige and charcoal with a terracotta accent.</p>
            </div>

            <div className="absolute -right-2 top-10 hidden w-64 rounded-2xl border border-line bg-paper/95 p-4 shadow-lift backdrop-blur sm:block lg:-right-8">
                <div className="flex items-center justify-between">
                    <span className="font-display text-2xl leading-none text-clay/80">01</span>
                    <span className="rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-paper">High priority</span>
                </div>
                <p className="mt-3 font-display text-lg leading-snug text-ink">Layer the lighting</p>
                <p className="mt-1 text-sm text-muted">One ceiling light leaves the corners dark. Add a floor lamp by the sofa and warm 2700K bulbs.</p>
            </div>
        </div>
    </section>
);

export default LandingSection;
