import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal, Spinner } from '../../components/shared';
import AnalysisView from '../../components/AI/AnalysisView';
import VisualResult from '../../components/AI/VisualResult';
import { formatDate, getErrorCode, getErrorMessage } from '../../helpers/GlobalMethods';
import { usePageTitle } from '../../utils/utils';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';

const POLL_MS = 4000;
const POLL_LIMIT_MS = 3 * 60 * 1000;

const DesignPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [design, setDesign] = useState(location.state?.design?.id === id ? location.state.design : null);
    const [status, setStatus] = useState(design ? 'ready' : 'loading'); // loading | ready | missing | error
    const [busy, setBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const autoStarted = useRef(false);
    const pollTimer = useRef(null);
    usePageTitle(design?.analysis?.title || 'Design');

    const load = useCallback(async () => {
        try {
            const { data } = await axios.get(endPoints.design(id));
            setDesign(data.data);
            setStatus('ready');
            return data.data;
        } catch (error) {
            setStatus(error?.response?.status === 404 ? 'missing' : 'error');
            return null;
        }
    }, [id]);

    // Fetch on open, unless the studio already handed us the fresh design.
    // That hand-off lives in browser history, so clear it: a reload must fetch fresh
    // data, or a stale "pending" visual would be generated (and paid for) twice.
    useEffect(() => {
        if (location.state?.design) {
            navigate(location.pathname, { replace: true, state: null });
        }
        if (!design) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Someone else (another tab, or a reload mid-generation) is creating the visual: poll until it finishes
    const poll = useCallback(() => {
        const startedAt = Date.now();
        clearTimeout(pollTimer.current);
        const tick = async () => {
            const fresh = await load();
            if (fresh?.visual?.status === 'processing' && Date.now() - startedAt < POLL_LIMIT_MS) {
                pollTimer.current = setTimeout(tick, POLL_MS);
            }
        };
        pollTimer.current = setTimeout(tick, POLL_MS);
    }, [load]);

    useEffect(() => () => clearTimeout(pollTimer.current), []);

    const generate = useCallback(async () => {
        setBusy(true);
        try {
            const { data } = await axios.post(endPoints.visualize(id));
            setDesign(data.data);
        } catch (error) {
            const code = getErrorCode(error);
            if (code === 'VISUAL_IN_PROGRESS') {
                setDesign((d) => ({ ...d, visual: { ...d.visual, status: 'processing' } }));
                poll();
            } else if (code === 'VISUAL_DAILY_LIMIT' || code === 'RATE_LIMITED') {
                toast.error(getErrorMessage(error));
            } else {
                // The server saved the failure on the design; reload to show it
                toast.error(getErrorMessage(error, 'The visual could not be created.'));
                await load();
            }
        } finally {
            setBusy(false);
        }
    }, [id, load, poll]);

    // Create the visual automatically the first time a design is opened
    useEffect(() => {
        if (!design || autoStarted.current) return;
        if (design.visual?.status === 'pending') {
            autoStarted.current = true;
            generate();
        } else if (design.visual?.status === 'processing') {
            autoStarted.current = true;
            poll();
        }
    }, [design, generate, poll]);

    const remove = async () => {
        setDeleting(true);
        try {
            await axios.delete(endPoints.design(id));
            toast.success('Design deleted.');
            navigate('/profile', { replace: true });
        } catch (error) {
            toast.error(getErrorMessage(error));
            setDeleting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="container-page flex min-h-[50vh] items-center justify-center">
                <Spinner size="lg" label="Loading your design…" />
            </div>
        );
    }

    if (status === 'missing' || status === 'error') {
        return (
            <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <h1 className="font-display text-4xl text-ink">{status === 'missing' ? 'Design not found' : 'Could not load this design'}</h1>
                <p className="text-muted">{status === 'missing' ? 'It may have been deleted.' : 'Check your connection and try again.'}</p>
                <div className="flex gap-2">
                    {status === 'error' && (
                        <Button variant="secondary" onClick={load}>
                            Try again
                        </Button>
                    )}
                    <Button to="/profile">My designs</Button>
                </div>
            </div>
        );
    }

    const { analysis } = design;

    return (
        <div className="container-page pt-8 md:pt-12">
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                <ArrowLeft className="h-4 w-4" /> My designs
            </Link>

            <header className="mt-6 flex flex-col justify-between gap-6 border-b border-line pb-10 md:flex-row md:items-end">
                <div className="max-w-3xl">
                    <p className="eyebrow">
                        {analysis?.spaceType}
                        <span className="ml-2 font-normal normal-case tracking-normal text-muted">{formatDate(design.createdAt)}</span>
                    </p>
                    <h1 className="mt-3 font-display text-[40px] leading-[1.05] text-ink sm:text-6xl">{analysis?.title}</h1>
                    {design.notes && <p className="mt-4 text-muted">Your notes: “{design.notes}”</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button to="/ai" icon={Plus}>
                        New analysis
                    </Button>
                    <Button variant="secondary" icon={Trash2} onClick={() => setConfirmDelete(true)} aria-label="Delete design">
                        Delete
                    </Button>
                </div>
            </header>

            {design.demo?.analysis && (
                <p className="mt-8 flex items-start gap-2.5 rounded-2xl border border-clay/20 bg-clay-light/60 px-4 py-3 text-sm text-clay-dark">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    Demo analysis: the server is running without an Anthropic key, so this is a sample plan, not an analysis of your photo.
                </p>
            )}

            <div className="mt-12">
                <AnalysisView analysis={analysis} photoUrl={design.original?.url} />
            </div>

            <div className="mt-20 border-t border-line pt-16">
                <VisualResult design={design} busy={busy} onGenerate={generate} />
            </div>

            <Modal open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} title="Delete this design?" size="sm">
                <p className="text-muted">This removes the analysis, your photo and the visual. It can't be undone.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" icon={Trash2} onClick={remove} loading={deleting}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default DesignPage;
