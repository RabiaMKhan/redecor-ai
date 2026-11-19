import { ImageUp, ScanSearch, WandSparkles } from 'lucide-react';
import { Reveal, SectionHeading } from '../../shared';
import { howItWorks } from '../../../utils/DummyData';

const icons = [ImageUp, ScanSearch, WandSparkles];

// "How it works" – three steps
const Services = () => (
    <section className="border-b border-line bg-paper">
        <div className="container-page py-20 lg:py-24">
            <Reveal>
                <SectionHeading
                    eyebrow="How it works"
                    title="From a phone photo to a better room in three steps"
                    text="No design jargon and no style quiz. Redecor AI decides the best direction for your space, and you can steer it with a note."
                />
            </Reveal>
            <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
                <span aria-hidden="true" className="absolute left-[16%] right-[16%] top-[3.25rem] hidden border-t-2 border-dashed border-clay/25 md:block" />
                {howItWorks.map((item, index) => {
                    const Icon = icons[index];
                    return (
                        <Reveal as="li" key={item.step} delay={index * 120}>
                            <div className="group relative h-full rounded-3xl border border-line bg-cream/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-clay/30 hover:bg-paper hover:shadow-lift">
                                <div className="flex items-center justify-between">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-clay text-paper shadow-soft transition-transform duration-300 group-hover:-rotate-6">
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <span className="font-display text-6xl leading-none text-clay/15">{item.step}</span>
                                </div>
                                <h3 className="mt-6 font-display text-2xl text-ink">{item.title}</h3>
                                <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                            </div>
                        </Reveal>
                    );
                })}
            </ol>
        </div>
    </section>
);

export default Services;
