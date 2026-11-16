import { useEffect, useState } from 'react';
import { ScanSearch, Sparkles } from 'lucide-react';

const sets = {
    analysis: {
        icon: ScanSearch,
        title: 'Analysing your space',
        messages: [
            'Looking at the light and layout…',
            'Spotting what already works…',
            'Choosing the best direction…',
            'Listing the changes that matter most…',
            'Writing your plan…',
        ],
    },
    visual: {
        icon: Sparkles,
        title: 'Creating your visual',
        messages: [
            'Keeping your walls, windows and layout…',
            'Applying the new colours and materials…',
            'Placing the new furniture and lighting…',
            'Adding the finishing touches…',
        ],
    },
};

const GeneratingState = ({ kind = 'analysis', compact = false }) => {
    const { icon: Icon, title, messages } = sets[kind] || sets.analysis;
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndex((i) => Math.min(i + 1, messages.length - 1)), 5000);
        return () => clearInterval(timer);
    }, [messages.length]);

    return (
        <div className={`flex flex-col gap-6 ${compact ? '' : 'card p-6 sm:p-8'}`} aria-live="polite">
            <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-clay-light text-clay">
                    <Icon className="h-5 w-5 animate-pulse" />
                </span>
                <div>
                    <p className="font-display text-xl text-ink">{title}</p>
                    <p className="text-sm text-muted">{messages[index]}</p>
                </div>
            </div>
            {!compact && (
                <div className="space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                    <div className="skeleton h-4 w-2/3" />
                </div>
            )}
        </div>
    );
};

export default GeneratingState;
