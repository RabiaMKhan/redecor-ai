import { Check, Palette, ScanSearch, Sparkles } from 'lucide-react';
import { Reveal, SectionHeading } from '../../shared';
import boho from '../../../assets/images/boho.webp';

const palette = [
    { hex: '#EFE6DA', name: 'Oat linen' },
    { hex: '#D8C3A5', name: 'Rattan' },
    { hex: '#A68A64', name: 'Sand dune' },
    { hex: '#7C8B6F', name: 'Olive leaf' },
    { hex: '#3E3530', name: 'Walnut' },
];

const features = [
    { icon: ScanSearch, title: 'An honest analysis', text: 'A few clear paragraphs on what the space is like today, what already works, and what holds it back.' },
    { icon: Palette, title: 'The changes, step by step', text: 'Each change explains why it helps, with a priority, a budget level, and a palette to tie it together.' },
    { icon: Sparkles, title: 'A visual of the result', text: 'At the end, your own photo is redesigned with the changes applied. Slide to compare before and after.' },
];

// "What you get" – a static example of a result
const ResultPreview = () => (
    <section className="bg-sand/60">
        <div className="container-page grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
            <Reveal className="relative order-2 lg:order-1">
                <img src={boho} alt="A neutral boho living room with a rattan sofa and pampas grass" loading="lazy" className="aspect-[5/4] w-full rounded-3xl object-cover shadow-lift" />
                <div className="card absolute -bottom-10 left-4 right-4 animate-float p-5 sm:left-auto sm:right-6 sm:w-80">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Sample plan · Living room</p>
                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                        {palette.map((color) => (
                            <div key={color.hex}>
                                <span className="block h-12 rounded-lg ring-1 ring-ink/5" style={{ backgroundColor: color.hex }} />
                                <span className="mt-1 block truncate text-[10px] text-muted">{color.name}</span>
                            </div>
                        ))}
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                        {['Keep the rattan sofa, it already works', 'Add a jute rug, 200 × 300 cm', 'Swap the ceiling light for a paper pendant'].map((tip) => (
                            <li key={tip} className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </Reveal>

            <Reveal delay={120} className="order-1 lg:order-2">
                <SectionHeading
                    eyebrow="What you get"
                    title="Words that explain it, and a picture that shows it"
                    text="Claude, Anthropic's vision model, studies your photo: the light, the layout and the furniture already there. Then an image model redesigns the same photo."
                />
                <ul className="mt-10 space-y-7">
                    {features.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="flex gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-clay shadow-soft">
                                <Icon className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="font-display text-xl text-ink">{title}</h3>
                                <p className="mt-1 leading-relaxed text-muted">{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Reveal>
        </div>
    </section>
);

export default ResultPreview;
