import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StyleQuiz, { quiz, scoreQuiz } from './StyleQuiz';
import Gallery from '../../pages/Gallery';

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('scoreQuiz', () => {
    it('picks the style that matches most answers', () => {
        // calm wood + wood/sand/olive palette + less clutter
        expect(scoreQuiz([1, 1, 0])).toBe('japanese');
        // rich colour + jewel tones + drama: three-way tie, the first style listed wins
        expect(scoreQuiz([3, 2, 2])).toBe('indian');
        // bright + cool greys + smart living
        expect(scoreQuiz([0, 3, 3])).toBe('modern');
    });

    it('always returns a known style for every answer combination', () => {
        const ids = new Set(['modern', 'french', 'gothic', 'indian', 'african', 'fusion', 'japanese', 'zen', 'high-tech', 'ottoman']);
        quiz[0].options.forEach((_, a) =>
            quiz[1].options.forEach((__, b) => quiz[2].options.forEach((___, c) => expect(ids.has(scoreQuiz([a, b, c]))).toBe(true)))
        );
    });
});

describe('StyleQuiz', () => {
    it('walks through the questions and shows a match', () => {
        renderWithRouter(<StyleQuiz onViewStyle={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: /Calm, with natural wood/ }));
        fireEvent.click(screen.getByRole('button', { name: /Wood, sand and olive/ }));
        fireEvent.click(screen.getByRole('button', { name: /Less clutter/ }));
        expect(screen.getByRole('heading', { name: 'Japanese' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Try it on my room/ })).toHaveAttribute('href', '/ai?style=japanese');
    });
});

describe('Gallery', () => {
    beforeEach(() => window.localStorage.clear());

    it('saves a room and shows it under the Saved filter', () => {
        renderWithRouter(<Gallery />);
        fireEvent.click(screen.getByRole('button', { name: 'Save Gothic room: Dramatic, dark and artful' }));
        expect(JSON.parse(window.localStorage.getItem('redecor:saved-rooms'))).toEqual(['gothic']);

        fireEvent.click(screen.getByRole('tab', { name: /Saved/ }));
        expect(screen.getAllByRole('button', { name: /^Open .* room/ })).toHaveLength(1);
        expect(screen.getByRole('button', { name: 'Open Gothic room: Dramatic, dark and artful' })).toBeInTheDocument();
    });

    it('filters rooms by mood', () => {
        renderWithRouter(<Gallery />);
        fireEvent.click(screen.getByRole('tab', { name: /Dark & dramatic/ }));
        expect(screen.getAllByRole('button', { name: /^Open .* room/ })).toHaveLength(1);
    });
});
