import { ArrowRight, Sparkles } from 'lucide-react';
import { Button, Reveal } from '../../shared';
import bedroom from '../../../assets/images/bedroom.webp';

// Closing call-to-action band
const ContactUS = () => (
    <section className="container-page">
        <Reveal className="relative grid overflow-hidden rounded-[2rem] bg-clay text-paper shadow-lift md:grid-cols-[1.2fr_1fr]">
            {/* Concentric arches echo the logo */}
            <svg aria-hidden="true" viewBox="0 0 400 400" className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] text-paper/10">
                {[190, 150, 110, 70].map((r) => (
                    <path key={r} d={`M ${200 - r} 400 V 200 A ${r} ${r} 0 0 1 ${200 + r} 200 V 400`} fill="none" stroke="currentColor" strokeWidth="2" />
                ))}
            </svg>
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-16">
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-paper/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-paper/90">
                    <Sparkles className="h-3.5 w-3.5" /> Free to try
                </p>
                <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">Ready to see your room differently?</h2>
                <p className="max-w-md text-lg text-paper/80">
                    Bring one photo. You get a written plan and a picture of the result.
                </p>
                <div className="flex flex-col gap-3 xs:flex-row">
                    <Button to="/ai" size="lg" variant="dark" icon={Sparkles}>
                        Analyse my space
                    </Button>
                    <Button to="/contact-us" size="lg" variant="ghost" iconRight={ArrowRight} className="!text-paper hover:!bg-paper/10">
                        Ask a question
                    </Button>
                </div>
            </div>
            <div className="relative hidden md:block">
                <img src={bedroom} alt="" loading="lazy" className="h-full max-h-[460px] w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-clay to-transparent" />
            </div>
        </Reveal>
    </section>
);

export default ContactUS;
