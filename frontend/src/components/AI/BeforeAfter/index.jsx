import { useId, useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

// Drag (or use arrow keys) to compare the original photo with the redesign.
// A native range input does the work, so it is keyboard and screen-reader friendly.
const BeforeAfter = ({ before, after, beforeLabel = 'Before', afterLabel = 'After' }) => {
    const [position, setPosition] = useState(50);
    const id = useId();

    return (
        <div className="relative select-none overflow-hidden rounded-3xl bg-sand shadow-lift">
            <img src={after} alt="Redesigned space" className="block w-full" draggable="false" />
            <img
                src={before}
                alt="Original space"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
                draggable="false"
            />

            <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }} aria-hidden="true">
                <div className="absolute inset-y-0 -ml-px w-0.5 bg-paper shadow-[0_0_12px_rgba(0,0,0,0.35)]" />
                <div className="absolute top-1/2 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-lift">
                    <ChevronsLeftRight className="h-5 w-5" />
                </div>
            </div>

            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-paper">{beforeLabel}</span>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-clay px-3 py-1 text-xs font-medium text-paper">{afterLabel}</span>

            <label htmlFor={id} className="sr-only">
                Compare before and after. Slide to reveal more of the original photo.
            </label>
            <input
                id={id}
                type="range"
                min="0"
                max="100"
                step="1"
                value={position}
                onChange={(event) => setPosition(Number(event.target.value))}
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
        </div>
    );
};

export default BeforeAfter;
