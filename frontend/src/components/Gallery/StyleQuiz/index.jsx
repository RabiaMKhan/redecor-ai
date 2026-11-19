import { useState } from 'react';
import { ArrowLeft, Compass, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '../../shared';
import { designStyles, getStyleById } from '../../../utils/DummyData';

// Each answer gives a point to the styles it lists; the top score wins.
export const quiz = [
    {
        question: 'Which room would you rather wake up in?',
        options: [
            { label: 'Bright and airy, with lots of white', styles: ['modern', 'french', 'high-tech'] },
            { label: 'Calm, with natural wood and plants', styles: ['japanese', 'zen'] },
            { label: 'Warm, with earthy textures', styles: ['african', 'fusion'] },
            { label: 'Rich colour and pattern everywhere', styles: ['indian', 'ottoman', 'gothic'] },
        ],
    },
    {
        question: 'Pick a palette',
        options: [
            { label: 'Soft neutrals', swatches: ['#F3EEE6', '#D8CFC0', '#B9B2A7', '#5B5A57'], styles: ['modern', 'zen', 'french'] },
            { label: 'Wood, sand and olive', swatches: ['#D9C3A0', '#A27B55', '#5C6B4E', '#2F2B28'], styles: ['japanese', 'african'] },
            { label: 'Jewel tones', swatches: ['#1F4E5F', '#B3412F', '#C99A3A', '#4A2430'], styles: ['ottoman', 'indian', 'gothic'] },
            { label: 'Cool greys and steel', swatches: ['#F2F3F4', '#BFC5CA', '#5A6670', '#3FA7D6'], styles: ['high-tech', 'modern'] },
        ],
    },
    {
        question: 'What matters most to you?',
        options: [
            { label: 'Less clutter, more calm', styles: ['zen', 'japanese', 'modern'] },
            { label: 'Pieces with a story', styles: ['fusion', 'african', 'french'] },
            { label: 'Drama and a wow factor', styles: ['gothic', 'ottoman', 'indian'] },
            { label: 'Smart, practical living', styles: ['high-tech', 'modern'] },
        ],
    },
];

// answers = option index per question. Ties go to the style picked earliest.
export const scoreQuiz = (answers) => {
    const scores = new Map();
    const firstSeen = [];
    answers.forEach((optionIndex, questionIndex) => {
        quiz[questionIndex].options[optionIndex].styles.forEach((id) => {
            scores.set(id, (scores.get(id) || 0) + 1);
            if (!firstSeen.includes(id)) firstSeen.push(id);
        });
    });
    const ranked = [...firstSeen, ...designStyles.map((s) => s.id).filter((id) => !firstSeen.includes(id))];
    return ranked.reduce((best, id) => ((scores.get(id) || 0) > (scores.get(best) || 0) ? id : best), ranked[0]);
};

const StyleQuiz = ({ onViewStyle }) => {
    const [answers, setAnswers] = useState([]);
    const done = answers.length === quiz.length;
    const result = done ? getStyleById(scoreQuiz(answers)) : null;
    const current = quiz[answers.length];

    return (
        <div className="card overflow-hidden">
            {!done ? (
                <div className="p-6 sm:p-10">
                    <div className="flex items-center justify-between gap-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-muted">
                            <Compass className="h-4 w-4 text-clay" /> Question {answers.length + 1} of {quiz.length}
                        </p>
                        <div className="flex gap-1.5" aria-hidden="true">
                            {quiz.map((q, i) => (
                                <span key={q.question} className={`h-1.5 w-8 rounded-full transition-colors ${i <= answers.length ? 'bg-clay' : 'bg-sand'}`} />
                            ))}
                        </div>
                    </div>
                    <h3 key={current.question} className="mt-6 animate-fade-up font-display text-3xl text-ink sm:text-4xl">
                        {current.question}
                    </h3>
                    <ul key={`options-${answers.length}`} className="mt-8 grid gap-3 sm:grid-cols-2">
                        {current.options.map((option, i) => (
                            <li key={option.label} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                                <button
                                    type="button"
                                    onClick={() => setAnswers((prev) => [...prev, i])}
                                    className="flex h-full w-full items-center justify-between gap-4 rounded-2xl border border-line bg-cream/60 px-5 py-4 text-left text-ink transition hover:-translate-y-0.5 hover:border-clay/50 hover:bg-paper hover:shadow-soft"
                                >
                                    <span className="font-medium">{option.label}</span>
                                    {option.swatches && (
                                        <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                                            {option.swatches.map((hex) => (
                                                <span key={hex} className="h-6 w-6 rounded-full ring-2 ring-paper" style={{ backgroundColor: hex }} />
                                            ))}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {answers.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setAnswers((prev) => prev.slice(0, -1))}
                            className="mt-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid animate-fade-in md:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative min-h-[260px] bg-sand">
                        <img src={result.image} alt={`${result.name} interior`} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-10" aria-live="polite">
                        <p className="eyebrow">Your style match</p>
                        <h3 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{result.name}</h3>
                        <p className="mt-1 text-lg italic text-clay">{result.tagline}</p>
                        <p className="mt-4 leading-relaxed text-muted">{result.description}</p>
                        <div className="mt-5 flex overflow-hidden rounded-xl">
                            {result.palette.map((hex) => (
                                <span key={hex} className="h-9 flex-1" style={{ backgroundColor: hex }} />
                            ))}
                        </div>
                        <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                            <Button to={`/ai?style=${result.id}`} icon={Sparkles}>
                                Try it on my room
                            </Button>
                            <Button variant="secondary" icon={Eye} onClick={() => onViewStyle(result.id)}>
                                View in gallery
                            </Button>
                            <Button variant="ghost" icon={RotateCcw} onClick={() => setAnswers([])}>
                                Retake
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StyleQuiz;
