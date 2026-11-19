import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderHeart, Lock, ScanSearch, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, GuestButton, TextField } from '../../components/shared';
import Dropzone, { checkImageFile } from '../../components/AI/Dropzone';
import GeneratingState from '../../components/AI/GeneratingState';
import { useIsAuthentication, usePageTitle } from '../../utils/utils';
import { getStyleById } from '../../utils/DummyData';
import { getErrorMessage } from '../../helpers/GlobalMethods';
import resizeImage from '../../helpers/resizeImage';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';

const NOTES_MAX = 500;

const ideas = ['Feels dark and small', 'Needs more storage', 'I love warm wood', 'Keep the sofa', 'Small budget', 'I like Japanese style'];

const Step = ({ number, title, hint, children }) => (
    <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-lg text-clay">{number}</span>
            <span className="font-display text-xl text-ink">{title}</span>
            {hint && <span className="text-sm text-muted">{hint}</span>}
        </legend>
        {children}
    </fieldset>
);

const AI = () => {
    usePageTitle('Studio');
    const isAuthenticated = useIsAuthentication();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [searchParams] = useSearchParams();
    // Coming from the gallery ("Try this style on my room") pre-fills the notes
    const [notes, setNotes] = useState(() => {
        const style = getStyleById(searchParams.get('style'));
        return style ? `I love the ${style.name} style, please lean that way.` : '';
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(null);

    // Free the object URL when the photo changes or the page closes
    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

    const selectFile = (selected) => {
        const problem = checkImageFile(selected);
        if (problem) return setError(problem);
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
        setError('');
    };

    const addIdea = (idea) => {
        setNotes((current) => {
            const next = current.trim() ? `${current.trim().replace(/[.,]$/, '')}. ${idea}` : idea;
            return next.slice(0, NOTES_MAX);
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) {
            toast('Sign in to analyse your space and save the result.', { icon: '🔒' });
            navigate('/login', { state: { from: '/ai' } });
            return;
        }
        const problem = checkImageFile(file);
        if (problem) return setError(problem);

        setLoading(true);
        requestAnimationFrame(() => loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        try {
            // Shrink big phone photos first (Vercel's upload limit is 4.5 MB; the AI only needs ~1600 px)
            const upload = await resizeImage(file).catch(() => file);
            const formData = new FormData();
            formData.append('image', upload);
            if (notes.trim()) formData.append('notes', notes.trim());
            const { data } = await axios.post(endPoints.analyze, formData);
            navigate(`/designs/${data.data.id}`, { state: { design: data.data } });
        } catch (err) {
            toast.error(getErrorMessage(err, 'We could not analyse this photo. Please try again.'));
            setLoading(false);
        }
    };

    return (
        <div className="container-page pb-10 pt-10 md:pt-14">
            <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <p className="eyebrow">Studio</p>
                    <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">What should we look at?</h1>
                    <p className="mt-3 max-w-xl text-lg text-muted">
                        Upload a photo of a room or any part of your home. Redecor AI explains what to change and then shows you the result.
                    </p>
                </div>
                {isAuthenticated && (
                    <Button to="/profile" variant="secondary" icon={FolderHeart} className="self-start md:self-auto">
                        My designs
                    </Button>
                )}
            </header>

            {!isAuthenticated && (
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-3 text-ink">
                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                        <span>Sign in to analyse a photo, or try it straight away as a guest (no sign-up, kept for 24 hours).</span>
                    </p>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <GuestButton to="/ai" size="sm" />
                        <Button to="/login" state={{ from: '/ai' }} variant="ghost" size="sm">
                            Sign in
                        </Button>
                        <Button to="/signup" state={{ from: '/ai' }} size="sm">
                            Create account
                        </Button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-8">
                <div className="card grid gap-10 p-5 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
                    <Step number="01" title="Your space" hint="a room, a corner, a hallway, a balcony…">
                        <Dropzone previewUrl={previewUrl} fileName={file?.name} onSelect={selectFile} onClear={() => { setFile(null); setPreviewUrl(''); }} error={error} disabled={loading} />
                        <p className="flex items-start gap-2 text-sm text-muted">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                            Your photo is sent to our AI partners to create the plan, then kept privately with your design. Delete it any time.
                        </p>
                    </Step>

                    <div className="flex flex-col gap-8">
                        <Step number="02" title="Tell us more" hint="optional">
                            <TextField
                                multiline
                                rows={5}
                                value={notes}
                                maxLength={NOTES_MAX}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What bothers you about this space? What must stay? Any style you love, or a budget?"
                                hint={`${notes.length}/${NOTES_MAX}`}
                                aria-label="Notes for the designer"
                                disabled={loading}
                            />
                            <div className="flex flex-wrap gap-2">
                                {ideas.map((idea) => (
                                    <button
                                        key={idea}
                                        type="button"
                                        onClick={() => addIdea(idea)}
                                        disabled={loading}
                                        className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-60"
                                    >
                                        + {idea}
                                    </button>
                                ))}
                            </div>
                        </Step>

                        <div className="mt-auto rounded-2xl bg-sand/60 p-5">
                            <p className="font-display text-lg text-ink">What you'll get</p>
                            <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                                <li>· A written analysis of the space as it is</li>
                                <li>· The changes that matter most, with priority and budget</li>
                                <li>· A colour palette and a suggested direction</li>
                                <li>· A visual of your redesigned space at the end</li>
                            </ul>
                        </div>

                        <Button type="submit" size="lg" icon={ScanSearch} loading={loading} fullWidth>
                            {loading ? 'Analysing…' : isAuthenticated ? 'Analyse my space' : 'Sign in to analyse'}
                        </Button>
                    </div>
                </div>
            </form>

            <div ref={loadingRef} className="mt-10">
                {loading && <GeneratingState kind="analysis" />}
            </div>
        </div>
    );
};

export default AI;
