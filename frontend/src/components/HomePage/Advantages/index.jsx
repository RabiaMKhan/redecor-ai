import { SectionHeading } from '../../shared';
import { advantages } from '../../../utils/DummyData';

const Advantages = () => (
    <section className="container-page py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHeading
                eyebrow="Why Redecor AI"
                title="Design help that starts with what you already have"
                text="Redecor AI grew out of my final-year Computer Science project. The goal is the same: make good interior advice easy to reach."
            />
            <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
                {advantages.map((item, index) => (
                    <div key={item.title} className="border-t border-line pt-5">
                        <dt className="flex items-baseline gap-3 font-display text-xl text-ink">
                            <span className="text-sm text-clay">0{index + 1}</span>
                            {item.title}
                        </dt>
                        <dd className="mt-2 leading-relaxed text-muted">{item.text}</dd>
                    </div>
                ))}
            </dl>
        </div>
    </section>
);

export default Advantages;
