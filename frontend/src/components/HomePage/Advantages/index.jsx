import { Eye, Home, ListOrdered, Wallet } from 'lucide-react';
import { Reveal, SectionHeading } from '../../shared';
import { advantages } from '../../../utils/DummyData';

const icons = [Wallet, Eye, Home, ListOrdered];

const Advantages = () => (
    <section className="container-page py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeading
                    eyebrow="Why Redecor AI"
                    title="Design help that starts with what you already have"
                    text="Redecor AI grew out of my final-year Computer Science project. The goal is the same: make good interior advice easy to reach."
                />
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2">
                {advantages.map((item, index) => {
                    const Icon = icons[index];
                    return (
                        <Reveal as="li" key={item.title} delay={index * 90} className={index % 2 === 1 ? 'sm:translate-y-8' : ''}>
                            <div className="group h-full rounded-3xl border border-line bg-paper p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-clay/30 hover:shadow-lift">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-clay-light text-clay transition-colors duration-300 group-hover:bg-clay group-hover:text-paper">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h3 className="mt-5 font-display text-xl text-ink">{item.title}</h3>
                                <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                            </div>
                        </Reveal>
                    );
                })}
            </ul>
        </div>
    </section>
);

export default Advantages;
