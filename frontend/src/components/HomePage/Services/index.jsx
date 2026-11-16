import { SectionHeading } from '../../shared';
import { howItWorks } from '../../../utils/DummyData';

// "How it works" – three steps
const Services = () => (
    <section className="border-y border-line bg-paper">
        <div className="container-page py-20 lg:py-24">
            <SectionHeading
                eyebrow="How it works"
                title="From a phone photo to a better room in three steps"
                text="No design jargon and no style quiz. Redecor AI decides the best direction for your space, and you can steer it with a note."
            />
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                {howItWorks.map((item) => (
                    <li key={item.step} className="relative border-t border-ink/15 pt-6">
                        <span className="font-display text-5xl text-clay/80">{item.step}</span>
                        <h3 className="mt-4 font-display text-2xl text-ink">{item.title}</h3>
                        <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default Services;
