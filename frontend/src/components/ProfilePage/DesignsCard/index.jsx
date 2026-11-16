import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanSearch, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal } from '../../shared';
import { formatDate, getErrorMessage } from '../../../helpers/GlobalMethods';
import axios from '../../../redux/https';
import { endPoints } from '../../../redux/constants';

const statusLabel = {
    pending: 'Visual not created yet',
    processing: 'Creating visual…',
    failed: 'Visual failed',
};

const DesignsCard = () => {
    const [designs, setDesigns] = useState([]);
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [confirm, setConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setStatus('loading');
        try {
            const { data } = await axios.get(endPoints.designs);
            setDesigns(data.data || []);
            setStatus('ready');
        } catch (error) {
            setStatus('error');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const remove = async () => {
        if (!confirm) return;
        setDeleting(true);
        try {
            await axios.delete(endPoints.design(confirm.id));
            setDesigns((list) => list.filter((d) => d.id !== confirm.id));
            setConfirm(null);
            toast.success('Design deleted.');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card overflow-hidden">
                        <div className="skeleton aspect-[4/3] rounded-none" />
                        <div className="space-y-2 p-5">
                            <div className="skeleton h-5 w-2/3" />
                            <div className="skeleton h-4 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="card flex flex-col items-center gap-4 p-10 text-center">
                <p className="text-muted">We couldn't load your designs.</p>
                <Button variant="secondary" onClick={load}>
                    Try again
                </Button>
            </div>
        );
    }

    if (!designs.length) {
        return (
            <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-light text-clay">
                    <ScanSearch className="h-6 w-6" />
                </span>
                <h2 className="font-display text-3xl text-ink">No designs yet</h2>
                <p className="max-w-sm text-muted">Upload a photo of any room or corner of your home. Every analysis is saved here.</p>
                <Button to="/ai" icon={ScanSearch} className="mt-2">
                    Analyse a space
                </Button>
            </div>
        );
    }

    return (
        <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {designs.map((design) => {
                    const ready = design.visual?.status === 'ready' && design.visual?.url;
                    const cover = ready ? design.visual.url : design.original?.url;
                    return (
                        <li key={design.id} className="card group relative overflow-hidden">
                            <Link to={`/designs/${design.id}`} className="block">
                                <div className="relative overflow-hidden bg-sand">
                                    {cover && (
                                        <img src={cover} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 flex h-2.5">
                                        {(design.analysis?.palette || []).map((c) => (
                                            <span key={c.hex + c.name} className="flex-1" style={{ backgroundColor: c.hex }} />
                                        ))}
                                    </div>
                                    <div className="absolute left-3 top-3 flex gap-1.5">
                                        {ready && <span className="rounded-full bg-clay px-2.5 py-1 text-xs font-medium text-paper">After</span>}
                                        {!ready && design.visual?.status && (
                                            <span className="rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-muted">{statusLabel[design.visual.status]}</span>
                                        )}
                                        {(design.demo?.analysis || design.demo?.visual) && (
                                            <span className="rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-clay-dark">Demo</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5 pr-14">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{design.analysis?.spaceType}</p>
                                    <p className="mt-1 line-clamp-2 font-display text-xl leading-snug text-ink">{design.analysis?.title}</p>
                                    <p className="mt-1 text-sm text-muted">{formatDate(design.createdAt)}</p>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setConfirm(design)}
                                className="absolute bottom-5 right-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-light hover:text-danger"
                                aria-label={`Delete ${design.analysis?.title || 'design'}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </li>
                    );
                })}
            </ul>

            <Modal open={Boolean(confirm)} onClose={() => !deleting && setConfirm(null)} title="Delete this design?" size="sm">
                <p className="text-muted">This removes the analysis, your photo and the visual. It can't be undone.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setConfirm(null)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" icon={Trash2} onClick={remove} loading={deleting}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default DesignsCard;
