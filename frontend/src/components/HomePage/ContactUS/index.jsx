import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../shared';
import bedroom from '../../../assets/images/bedroom.webp';

// Closing call-to-action band
const ContactUS = () => (
    <section className="container-page">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-clay text-paper md:grid-cols-[1.2fr_1fr]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-16">
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
            <img src={bedroom} alt="" loading="lazy" className="hidden h-full max-h-[440px] w-full object-cover md:block" />
        </div>
    </section>
);

export default ContactUS;
