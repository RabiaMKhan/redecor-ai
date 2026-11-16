import {
    Archive,
    BrickWall,
    Check,
    Copy,
    Frame,
    Grid3x3,
    Lamp,
    Layers,
    LayoutGrid,
    Palette,
    Sofa,
    Sprout,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { changeAreas } from '../../../utils/DummyData';

const areaIcons = {
    layout: LayoutGrid,
    colour: Palette,
    lighting: Lamp,
    furniture: Sofa,
    textiles: Layers,
    storage: Archive,
    decor: Frame,
    flooring: Grid3x3,
    walls: BrickWall,
    plants: Sprout,
};

const priorityStyles = {
    high: 'bg-clay text-paper',
    medium: 'bg-clay-light text-clay-dark',
    low: 'bg-sand text-muted',
};

const priorityText = { high: 'High priority', medium: 'Medium priority', low: 'Low priority' };
const budgetText = { low: 'Low budget', medium: 'Medium budget', high: 'Higher budget' };

// Pick dark or light text for a swatch so the hex code stays readable
const textOn = (hex = '#000000') => {
    const value = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) || 0);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#2A2421' : '#FCFAF6';
};

const copyHex = async (hex) => {
    try {
        await navigator.clipboard.writeText(hex);
        toast.success(`Copied ${hex}`);
    } catch {
        toast.error('Could not copy. Select the code instead.');
    }
};

const SectionTitle = ({ eyebrow, title }) => (
    <div className="mb-6">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
    </div>
);

// The written part of a design: overview, direction, changes, keep, summary.
const AnalysisView = ({ analysis, photoUrl }) => {
    if (!analysis) return null;
    const changes = analysis.changes || [];
    const [lead, ...rest] = analysis.overview || [];

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            {/* Your space */}
            <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
                {photoUrl && (
                    <figure className="relative self-start overflow-hidden rounded-3xl bg-sand lg:sticky lg:top-24">
                        <img src={photoUrl} alt="Your space as it is today" className="w-full object-cover" />
                        <figcaption className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium">Your photo</figcaption>
                    </figure>
                )}
                <div>
                    <SectionTitle eyebrow="What we see" title="The space today" />
                    {lead && <p className="font-display text-xl leading-relaxed text-ink sm:text-2xl">{lead}</p>}
                    {rest.map((paragraph, index) => (
                        <p key={index} className="mt-5 text-lg leading-relaxed text-ink/80">
                            {paragraph}
                        </p>
                    ))}
                    {analysis.keep?.length > 0 && (
                        <div className="mt-8 rounded-2xl bg-sage-light/70 p-6">
                            <h3 className="font-display text-xl text-ink">Already working</h3>
                            <ul className="mt-3 space-y-2">
                                {analysis.keep.map((item) => (
                                    <li key={item} className="flex gap-2.5 leading-relaxed text-ink/90">
                                        <Check className="mt-1 h-4 w-4 shrink-0 text-sage" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            {/* Direction + palette */}
            {analysis.direction && (
                <section className="overflow-hidden rounded-[2rem] bg-ink text-paper">
                    <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/60">Suggested direction</p>
                            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{analysis.direction.name}</h2>
                            <p className="mt-5 text-lg leading-relaxed text-paper/80">{analysis.direction.description}</p>
                        </div>
                        {analysis.palette?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/60">Colour palette</p>
                                <ul className="mt-4 space-y-2">
                                    {analysis.palette.map((color) => (
                                        <li key={`${color.hex}-${color.name}`}>
                                            <button
                                                type="button"
                                                onClick={() => copyHex(color.hex)}
                                                className="group flex w-full items-center gap-4 rounded-2xl p-1.5 pr-4 text-left transition-colors hover:bg-paper/5"
                                                aria-label={`Copy ${color.name} ${color.hex}`}
                                            >
                                                <span
                                                    className="flex h-14 w-20 shrink-0 items-end rounded-xl p-2 font-mono text-[10px] uppercase ring-1 ring-paper/10"
                                                    style={{ backgroundColor: color.hex, color: textOn(color.hex) }}
                                                >
                                                    {color.hex}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block font-medium">{color.name}</span>
                                                    <span className="block text-sm text-paper/60">{color.usage}</span>
                                                </span>
                                                <Copy className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Changes */}
            {changes.length > 0 && (
                <section>
                    <SectionTitle eyebrow={`${changes.length} changes`} title="What to change, and why" />
                    <ol className="grid gap-5 md:grid-cols-2">
                        {changes.map((change, index) => {
                            const Icon = areaIcons[change.area] || LayoutGrid;
                            return (
                                <li key={`${change.title}-${index}`} className="card flex flex-col p-6 sm:p-7">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="font-display text-3xl leading-none text-clay/80">{String(index + 1).padStart(2, '0')}</span>
                                        <div className="flex flex-wrap justify-end gap-1.5">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[change.priority] || priorityStyles.low}`}>
                                                {priorityText[change.priority] || priorityText.low}
                                            </span>
                                            <span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted">
                                                {budgetText[change.budget] || budgetText.low}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                                        <Icon className="h-3.5 w-3.5" /> {changeAreas[change.area] || change.area}
                                    </p>
                                    <h3 className="mt-1.5 font-display text-2xl leading-snug text-ink">{change.title}</h3>
                                    <p className="mt-3 leading-relaxed text-ink/80">{change.why}</p>
                                    {change.steps?.length > 0 && (
                                        <ul className="mt-5 space-y-2 border-t border-line pt-5">
                                            {change.steps.map((step) => (
                                                <li key={step} className="flex gap-2.5 text-[15px] leading-relaxed text-ink/90">
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </section>
            )}

            {/* Summary */}
            {analysis.summary && (
                <section className="mx-auto max-w-3xl text-center">
                    <p className="eyebrow">In short</p>
                    <p className="mt-4 font-display text-2xl leading-relaxed text-ink sm:text-3xl">{analysis.summary}</p>
                </section>
            )}
        </div>
    );
};

export default AnalysisView;
