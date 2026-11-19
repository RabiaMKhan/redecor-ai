import modern from '../../assets/images/styles/modern.webp';
import french from '../../assets/images/styles/french.webp';
import gothic from '../../assets/images/styles/gothic.webp';
import indian from '../../assets/images/styles/indian.webp';
import african from '../../assets/images/styles/african.webp';
import fusion from '../../assets/images/styles/fusion.webp';
import japanese from '../../assets/images/styles/japanese.webp';
import zen from '../../assets/images/styles/zen.webp';
import highTech from '../../assets/images/styles/high-tech.webp';
import ottoman from '../../assets/images/styles/ottoman.webp';

// Style ids must match the backend list (GET /ai/styles).
export const designStyles = [
    {
        id: 'modern',
        mood: 'Light & airy',
        bestFor: ['Living rooms', 'Kitchens', 'Small flats'],
        name: 'Modern',
        tagline: 'Clean lines, calm neutrals',
        description:
            'Modern design focuses on clean lines, minimal clutter and a neutral palette with one or two confident accents, for a sleek and easy-to-live-in home.',
        image: modern,
        palette: ['#E9E4DC', '#B9B2A7', '#3F3D3A', '#C7613C', '#7D8B76'],
    },
    {
        id: 'french',
        mood: 'Light & airy',
        bestFor: ['Bedrooms', 'Dining rooms'],
        name: 'French',
        tagline: 'Soft tones, vintage charm',
        description:
            'French interiors blend elegance with vintage charm: soft tones, delicate mouldings, antique pieces and a touch of gilt for a timeless feel.',
        image: french,
        palette: ['#F3EEE6', '#D8CFC0', '#A7B3BE', '#C9A96A', '#5B5A57'],
    },
    {
        id: 'gothic',
        mood: 'Dark & dramatic',
        bestFor: ['Reading nooks', 'Bedrooms'],
        name: 'Gothic',
        tagline: 'Dramatic, dark and artful',
        description:
            'Gothic design embraces drama: deep jewel tones, dark woods, ornate details and moody lighting that make a room feel artistic and mysterious.',
        image: gothic,
        palette: ['#1F1B1D', '#4A2430', '#6B5B73', '#9C7A4B', '#D8CFC4'],
    },
    {
        id: 'indian',
        mood: 'Bold & colourful',
        bestFor: ['Living rooms', 'Dining rooms'],
        name: 'Indian',
        tagline: 'Vibrant colour and craft',
        description:
            'Indian design brings saturated colour, carved wood, block-printed textiles and brass accents together in a warm, lively and culturally rich space.',
        image: indian,
        palette: ['#F2E3C6', '#D9822B', '#A8322D', '#2E6F6A', '#C9A23F'],
    },
    {
        id: 'african',
        mood: 'Warm & earthy',
        bestFor: ['Living rooms', 'Balconies'],
        name: 'African',
        tagline: 'Earthy, textured, grounded',
        description:
            'African-inspired decor uses earthy tones, natural materials like rattan and mud cloth, and bold graphic patterns for an organic, grounded feel.',
        image: african,
        palette: ['#EFE2CF', '#C08552', '#8C4A2F', '#3B2F2A', '#A39171'],
    },
    {
        id: 'fusion',
        mood: 'Warm & earthy',
        bestFor: ['Living rooms', 'Home offices'],
        name: 'Fusion',
        tagline: 'Your own mix of styles',
        description:
            'Fusion mixes elements from different styles and eras, balancing tradition and innovation into a personal space that feels collected, not decorated.',
        image: fusion,
        palette: ['#F1ECE4', '#D6A77A', '#5E7A8A', '#8F5E4B', '#2E3A3F'],
    },
    {
        id: 'japanese',
        mood: 'Calm & natural',
        bestFor: ['Bedrooms', 'Balconies'],
        name: 'Japanese',
        tagline: 'Natural wood, quiet order',
        description:
            'Japanese design promotes simplicity and calm with low furniture, natural wood, paper screens and a strong connection to the garden outside.',
        image: japanese,
        palette: ['#F4EFE6', '#D9C3A0', '#A27B55', '#5C6B4E', '#2F2B28'],
    },
    {
        id: 'zen',
        mood: 'Calm & natural',
        bestFor: ['Bedrooms', 'Bathrooms'],
        name: 'Zen',
        tagline: 'Minimal and restful',
        description:
            'Zen spaces use minimal furniture, soft neutral colours, stone and plants to create a peaceful room that encourages rest and mindfulness.',
        image: zen,
        palette: ['#EEEBE4', '#C9C3B6', '#8E9A86', '#5D5A54', '#B79B76'],
    },
    {
        id: 'high-tech',
        mood: 'Light & airy',
        bestFor: ['Home offices', 'Kitchens'],
        name: 'High-Tech',
        tagline: 'Sleek, smart, futuristic',
        description:
            'High-tech design pairs glossy surfaces, metal and glass with integrated lighting and smart devices for a functional, futuristic home.',
        image: highTech,
        palette: ['#F2F3F4', '#BFC5CA', '#5A6670', '#1E2328', '#3FA7D6'],
    },
    {
        id: 'ottoman',
        mood: 'Bold & colourful',
        bestFor: ['Lounges', 'Guest rooms'],
        name: 'Ottoman',
        tagline: 'Rich textiles, regal comfort',
        description:
            'Ottoman design reflects opulence and comfort: layered rugs, rich textiles, low cushioned seating, tiles and intricate patterns in deep colours.',
        image: ottoman,
        palette: ['#F0E4CF', '#B3412F', '#1F4E5F', '#C99A3A', '#4A2C2A'],
    },
];

// Mood groups used by the gallery filters, in display order
export const styleMoods = ['Light & airy', 'Calm & natural', 'Warm & earthy', 'Bold & colourful', 'Dark & dramatic'];

export const getStyleById = (id) => designStyles.find((style) => style.id === id);

// What the AI can comment on, with the label shown on each change card
export const changeAreas = {
    layout: 'Layout',
    colour: 'Colour',
    lighting: 'Lighting',
    furniture: 'Furniture',
    textiles: 'Textiles',
    storage: 'Storage',
    decor: 'Decor',
    flooring: 'Flooring',
    walls: 'Walls',
    plants: 'Plants',
};

export const howItWorks = [
    {
        step: '01',
        title: 'Upload any space',
        text: 'A living room, a bedroom, a narrow hallway or a balcony. Any phone photo of any part of your home works.',
    },
    {
        step: '02',
        title: 'Read the analysis',
        text: 'Redecor AI explains what it sees, what already works, and the changes that would make the biggest difference.',
    },
    {
        step: '03',
        title: 'See the result',
        text: 'At the end, the AI redesigns your own photo so you can compare before and after with a simple slider.',
    },
];

export const advantages = [
    {
        title: 'Costs less than a consultation',
        text: 'Get a designer-style plan for your space, then spend your budget on the changes that matter most.',
    },
    {
        title: 'See it before you buy',
        text: 'The visual result shows the redesigned space from your own photo, so you know if you like it before shopping.',
    },
    {
        title: 'Made for your actual space',
        text: 'Advice is based on your photo: your light, your layout and the furniture you already own.',
    },
    {
        title: 'Clear priorities',
        text: 'Every change comes with a priority and a budget level, plus what to keep, so nothing goes to waste.',
    },
];
