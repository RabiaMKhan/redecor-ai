import { ArrowUpRight, ImageOff, Info, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '../../shared';
import BeforeAfter from '../BeforeAfter';
import GeneratingState from '../GeneratingState';

// The last section of a design: the AI-redesigned photo.
// status: pending | processing | ready | failed
const VisualResult = ({ design, busy, onGenerate }) => {
    const visual = design?.visual || { status: 'pending' };
    const working = busy || visual.status === 'processing';

    return (
        <section id="visual" className="scroll-mt-24">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="eyebrow">The visual result</p>
                    <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">Your space, redesigned</h2>
                    <p className="mt-2 max-w-xl text-muted">
                        The same photo with the suggested changes applied. Drag the handle to compare before and after.
                    </p>
                </div>
                {visual.status === 'ready' && !working && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Button href={visual.url} target="_blank" rel="noreferrer" variant="secondary" size="sm" iconRight={ArrowUpRight}>
                            Full size
                        </Button>
                        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onGenerate}>
                            Generate again
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-8">
                {working && (
                    <div className="relative overflow-hidden rounded-3xl">
                        {design?.original?.url && <img src={design.original.url} alt="" className="w-full scale-105 object-cover blur-md brightness-90" />}
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 p-4">
                            <div className="w-full max-w-sm rounded-2xl bg-paper/95 p-6 shadow-lift backdrop-blur">
                                <GeneratingState kind="visual" compact />
                                <p className="mt-4 text-sm text-muted">This usually takes 10 to 40 seconds.</p>
                            </div>
                        </div>
                    </div>
                )}

                {!working && visual.status === 'ready' && visual.url && (
                    <>
                        {visual.demo && (
                            <p className="mb-4 flex items-start gap-2.5 rounded-2xl border border-clay/20 bg-clay-light/60 px-4 py-3 text-sm text-clay-dark">
                                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                Demo preview: the server has no Replicate key, so this is your photo with a simple colour grade, not a real AI redesign.
                            </p>
                        )}
                        <BeforeAfter before={design.original?.url} after={visual.url} />
                    </>
                )}

                {!working && visual.status === 'failed' && (
                    <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-light text-danger">
                            <ImageOff className="h-6 w-6" />
                        </span>
                        <h3 className="font-display text-2xl text-ink">The visual could not be created</h3>
                        <p className="max-w-md text-muted">{visual.error || 'Something went wrong while creating the image.'} Your written plan above is saved.</p>
                        <Button icon={RotateCcw} onClick={onGenerate}>
                            Try again
                        </Button>
                    </div>
                )}

                {!working && visual.status === 'pending' && (
                    <div className="card flex flex-col items-center gap-4 px-6 py-12 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-light text-clay">
                            <Sparkles className="h-6 w-6" />
                        </span>
                        <h3 className="font-display text-2xl text-ink">See the redesign</h3>
                        <p className="max-w-md text-muted">Create an image of your space with these changes applied.</p>
                        <Button icon={Sparkles} onClick={onGenerate}>
                            Create the visual
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VisualResult;
