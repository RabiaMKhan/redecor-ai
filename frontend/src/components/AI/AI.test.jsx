import { fireEvent, render, screen, within } from '@testing-library/react';
import AnalysisView from './AnalysisView';
import BeforeAfter from './BeforeAfter';
import VisualResult from './VisualResult';
import { MemoryRouter } from 'react-router-dom';

const analysis = {
    title: 'A warmer, calmer living room',
    spaceType: 'Living room',
    overview: ['Lead paragraph about the room.', 'Second paragraph about what holds it back.'],
    direction: { name: 'Warm minimal', description: 'Soft neutrals and natural wood.' },
    changes: [
        { title: 'Layer the lighting', area: 'lighting', priority: 'high', budget: 'low', why: 'One ceiling light leaves corners dark.', steps: ['Add a floor lamp', 'Use 2700K bulbs'] },
        { title: 'Float the sofa', area: 'layout', priority: 'medium', budget: 'low', why: 'Pulling it off the wall makes a conversation area.', steps: ['Move it 40 cm forward'] },
    ],
    palette: [
        { name: 'Oat', hex: '#EFE6DA', usage: 'Walls' },
        { name: 'Walnut', hex: '#3E3530', usage: 'Accents' },
    ],
    keep: ['The big window'],
    summary: 'Small changes, big difference.',
};

describe('AnalysisView', () => {
    it('renders every part of the analysis', () => {
        render(<AnalysisView analysis={analysis} photoUrl="before.jpg" />);
        expect(screen.getByText('Lead paragraph about the room.')).toBeInTheDocument();
        expect(screen.getByText('Second paragraph about what holds it back.')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Warm minimal' })).toBeInTheDocument();
        expect(screen.getByText('2 changes')).toBeInTheDocument();
        expect(screen.getByText('The big window')).toBeInTheDocument();
        expect(screen.getByText('Small changes, big difference.')).toBeInTheDocument();
        expect(screen.getByAltText('Your space as it is today')).toHaveAttribute('src', 'before.jpg');
    });

    it('shows priority, budget, area and steps on each change', () => {
        render(<AnalysisView analysis={analysis} />);
        const card = screen.getByRole('heading', { name: 'Layer the lighting' }).closest('li');
        expect(within(card).getByText('High priority')).toBeInTheDocument();
        expect(within(card).getByText('Low budget')).toBeInTheDocument();
        expect(within(card).getByText('Lighting')).toBeInTheDocument();
        expect(within(card).getByText('Use 2700K bulbs')).toBeInTheDocument();
    });

    it('renders nothing without an analysis', () => {
        const { container } = render(<AnalysisView analysis={null} />);
        expect(container).toBeEmptyDOMElement();
    });
});

describe('BeforeAfter', () => {
    it('clips the before photo to the slider position', () => {
        render(<BeforeAfter before="before.jpg" after="after.jpg" />);
        const before = screen.getByAltText('Original space');
        expect(before.style.clipPath).toBe('inset(0 50% 0 0)');
        fireEvent.change(screen.getByLabelText(/compare before and after/i), { target: { value: '80' } });
        expect(before.style.clipPath).toBe('inset(0 20% 0 0)');
    });
});

describe('VisualResult', () => {
    const base = { id: '1', original: { url: 'before.jpg' } };
    const renderVisual = (props) => render(<MemoryRouter><VisualResult onGenerate={() => { }} {...props} /></MemoryRouter>);

    it('shows the slider and a demo note when ready', () => {
        renderVisual({ design: { ...base, visual: { status: 'ready', url: 'after.jpg', demo: true } } });
        expect(screen.getByAltText('Redesigned space')).toHaveAttribute('src', 'after.jpg');
        expect(screen.getByText(/Demo preview/)).toBeInTheDocument();
    });

    it('shows a loading state while processing', () => {
        renderVisual({ design: { ...base, visual: { status: 'processing' } } });
        expect(screen.getByText('Creating your visual')).toBeInTheDocument();
    });

    it('offers a retry when it failed', () => {
        const onGenerate = jest.fn();
        renderVisual({ design: { ...base, visual: { status: 'failed', error: 'Timed out.' } }, onGenerate });
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(onGenerate).toHaveBeenCalledTimes(1);
    });
});
