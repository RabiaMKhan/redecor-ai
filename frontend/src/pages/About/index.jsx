import { ArrowRight, Brain, Code2, Database, GraduationCap, ShieldCheck, Wand2 } from 'lucide-react';
import { Button } from '../../components/shared';
import { usePageTitle } from '../../utils/utils';
import japanese from '../../assets/images/styles/japanese.webp';
import zen from '../../assets/images/styles/zen.webp';

const stack = [
    { icon: Code2, title: 'React front end', text: 'React with Redux Toolkit and Redux-Saga for state, React Router for pages and Tailwind CSS for the design.' },
    { icon: Database, title: 'Node.js API', text: 'Express and MongoDB, with JWT sign-in, email verification codes and password reset.' },
    { icon: Brain, title: 'Claude analysis', text: 'Claude, Anthropic\'s vision model, reads the photo and returns a structured plan: overview, direction, changes, palette and what to keep.' },
    { icon: Wand2, title: 'Replicate visual', text: 'FLUX Kontext on Replicate edits your own photo with the suggested changes, keeping the walls, windows and camera angle.' },
    { icon: ShieldCheck, title: 'Private by default', text: 'Photos are stored privately with your design and only shown through short-lived signed links. Delete a design and its images go too.' },
];

const About = () => {
    usePageTitle('About');
    return (
        <div className="pt-10 md:pt-14">
            <section className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
                <div>
                    <p className="eyebrow">About Redecor AI</p>
                    <h1 className="mt-4 font-display text-[44px] leading-[1.05] text-ink sm:text-6xl">
                        Good interior advice shouldn't need a big budget.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                        Hiring a designer is expensive, and design inspiration online rarely matches the room you actually live in.
                        Redecor AI closes that gap: it looks at your actual space, explains what to change and why, and shows you the result.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <img src={japanese} alt="Japanese style living room with wooden screens" className="aspect-[3/4] w-full rounded-arch object-cover" />
                    <img src={zen} alt="Zen style room with low seating" className="mt-12 aspect-[3/4] w-full rounded-arch object-cover" />
                </div>
            </section>

            <section className="container-page mt-24">
                <div className="grid gap-10 rounded-[2rem] bg-paper p-8 shadow-soft sm:p-12 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-clay-light text-clay">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                        <h2 className="mt-5 font-display text-3xl text-ink">The story</h2>
                    </div>
                    <div className="space-y-4 text-lg leading-relaxed text-ink/85">
                        <p>
                            Redecor AI grew out of Redecor, my final-year project for a BS in Computer Science at Superior University,
                            Lahore, which was graded A+. That first version used an image model I trained in Python on a dataset I collected myself.
                        </p>
                        <p>
                            Redecor AI is a new project built on that idea. Instead of a single filtered image, it gives you a written
                            analysis you can act on, then a realistic redesign of your own photo, all saved to your account.
                        </p>
                        <p className="text-base text-muted">Rabia Khan · Full-stack developer</p>
                    </div>
                </div>
            </section>

            <section className="container-page mt-24">
                <p className="eyebrow">Under the hood</p>
                <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight text-ink sm:text-4xl">How Redecor AI is built</h2>
                <ul className="mt-10 grid gap-6 sm:grid-cols-2">
                    {stack.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="card flex gap-4 p-6">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-clay">
                                <Icon className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="font-display text-xl text-ink">{title}</h3>
                                <p className="mt-1.5 leading-relaxed text-muted">{text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="mt-12 flex flex-col gap-3 xs:flex-row">
                    <Button to="/ai" iconRight={ArrowRight}>
                        Try the studio
                    </Button>
                    <Button to="/contact-us" variant="secondary">
                        Get in touch
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default About;
