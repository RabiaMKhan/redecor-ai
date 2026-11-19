import { ArrowRight, ScanSearch, Sparkles } from 'lucide-react';
import { Button, GuestButton } from '../../shared';
import hero from '../../../assets/images/hero.webp';
import { getStyleById } from '../../../utils/DummyData';
import { useIsAuthentication } from '../../../utils/utils';

const modern = getStyleById('modern');

const LandingSection = () => {
    const isAuthenticated = useIsAuthentication();

    return (
        <div className="relative isolate overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-40 top-16 h-[460px] w-[460px] rounded-full bg-clay-light opacity-70 blur-3xl" />
                <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-sage-light opacity-80 blur-3xl" />
                <div className="dot-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
            </div>

            <section className="container-page grid items-center gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
                <div className="animate-fade-up">
                    <p className="inline-flex items-center gap-2 rounded-full border border-clay/20 bg-paper/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-clay shadow-soft backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" /> AI interior analysis &amp; redesign
                    </p>
                    <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[68px]">
                        Show us your room.{' '}
                        <em className="relative inline-block whitespace-nowrap font-normal text-clay">
                            See it better.
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 300 20"
                                preserveAspectRatio="none"
                                className="absolute -bottom-2 left-0 h-3 w-full text-clay/40"
                            >
                                <path d="M2 14 C 60 4, 120 4, 170 10 S 260 18, 298 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </em>
                    </h1>
                    <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted">
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
                    {!isAuthenticated && (
                        <p className="mt-4 flex flex-wrap items-center gap-x-1 text-sm text-muted">
                            Just looking?
                            <GuestButton
                                variant="ghost"
                                size="sm"
                                label="Try it as a guest"
                                className="!h-8 !px-2 !text-clay underline decoration-clay/30 underline-offset-4 hover:!bg-transparent hover:decoration-clay"
                            />
                            No sign-up needed.
                        </p>
                    )}
                    <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
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
                    <div aria-hidden="true" className="absolute -inset-3 translate-x-4 translate-y-4 rounded-arch border-2 border-clay/25" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-arch shadow-lift">
                        <img
                            src={hero}
                            alt="A bright modern living room with a grey sectional sofa and colourful cushions"
                            className="h-full w-full object-cover"
                            fetchpriority="high"
                        />
                        <span className="absolute bottom-4 right-4 rounded-full bg-clay px-3 py-1 text-xs font-medium text-paper">After</span>
                    </div>

                    <div className="absolute -left-2 bottom-12 w-60 animate-float rounded-2xl border border-line bg-paper/95 p-4 shadow-lift backdrop-blur [animation-delay:1.5s] sm:-left-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Suggested palette</p>
                        <div className="mt-3 flex overflow-hidden rounded-lg">
                            {modern.palette.map((hex) => (
                                <span key={hex} className="h-10 flex-1" style={{ backgroundColor: hex }} />
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-ink">Soft greige and charcoal with a terracotta accent.</p>
                    </div>

                    <div className="absolute -right-2 top-10 hidden w-64 animate-float rounded-2xl border border-line bg-paper/95 p-4 shadow-lift backdrop-blur sm:block lg:-right-8">
                        <div className="flex items-center justify-between">
                            <span className="font-display text-2xl leading-none text-clay/80">01</span>
                            <span className="rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-paper">High priority</span>
                        </div>
                        <p className="mt-3 font-display text-lg leading-snug text-ink">Layer the lighting</p>
                        <p className="mt-1 text-sm text-muted">One ceiling light leaves the corners dark. Add a floor lamp by the sofa and warm 2700K bulbs.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingSection;
