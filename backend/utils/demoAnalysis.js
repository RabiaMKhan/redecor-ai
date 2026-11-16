// A hand-written sample plan used when no Anthropic key is set (demo mode).
// The photo is NOT analysed in demo mode, and the first paragraph says so.

const buildDemoAnalysis = () => ({
    analysis: {
        title: 'A warmer, calmer living space',
        spaceType: 'Living space',
        overview: [
            'Demo mode: this is a sample plan and your photo was not analysed. Add an Anthropic API key on the server to get a plan written for your actual space.',
            'Most living spaces like this one have good bones: a clear main wall for seating, daylight from at least one side, and furniture that is still in decent shape. What usually holds them back is cool, flat lighting, too many small items competing for attention, and colours that do not quite belong together.',
            'The plan below keeps what works, warms up the colours and light, and gives the room one clear focal point so it feels calmer the moment you walk in.',
        ],
        direction: {
            name: 'Warm modern',
            description: 'Warm modern pairs clean, simple furniture shapes with soft natural materials such as oak, linen and wool. It suits everyday family rooms because it is easy to live with, forgiving of clutter, and looks good in both daylight and lamplight.',
        },
        changes: [
            {
                title: 'Repaint in a warm off-white',
                area: 'walls',
                priority: 'high',
                budget: 'low',
                why: 'Stark or greyish white makes a room feel cold, especially in the evening. A warm off-white reflects the same amount of light but gives every wood and fabric in the room a softer, more welcoming backdrop.',
                steps: [
                    'Choose a warm off-white with a hint of beige or cream.',
                    'Paint the walls in matt and the ceiling one shade lighter.',
                    'Keep woodwork in the same colour, in eggshell, so the room feels seamless.',
                ],
            },
            {
                title: 'Layer the lighting',
                area: 'lighting',
                priority: 'high',
                budget: 'medium',
                why: 'A single ceiling light flattens everything and casts harsh shadows. Three or four lower light sources at different heights make the room feel cosy and let you change the mood for reading, guests or a film night.',
                steps: [
                    'Swap cool bulbs for warm white (2700K) everywhere.',
                    'Add a floor lamp beside the sofa and a table lamp on a side table.',
                    'Put the main light on a dimmer if you can.',
                ],
            },
            {
                title: 'Anchor the seating with a large rug',
                area: 'flooring',
                priority: 'medium',
                budget: 'medium',
                why: 'A rug that is too small makes furniture look like it is floating. A bigger rug pulls the seating area together, softens sound and adds warmth underfoot.',
                steps: [
                    'Pick a rug large enough for the front legs of every seat to rest on it.',
                    'Choose a low-pile wool or jute blend in a soft neutral.',
                ],
            },
            {
                title: 'Edit and group the accessories',
                area: 'decor',
                priority: 'medium',
                budget: 'low',
                why: 'Lots of small objects spread evenly across every surface reads as clutter. Fewer, larger pieces grouped in odd numbers look intentional and give the eye somewhere to rest.',
                steps: [
                    'Clear every surface, then put back only what you love.',
                    'Group items in threes with different heights.',
                    'Use one closed basket or box for remotes, chargers and paperwork.',
                ],
            },
            {
                title: 'Bring in natural textiles',
                area: 'textiles',
                priority: 'medium',
                budget: 'low',
                why: 'Linen, wool and cotton add texture, which makes a neutral room feel rich rather than plain. They are also an easy, affordable way to introduce the new colour palette.',
                steps: [
                    'Add two or three cushions in linen and bouclé in the palette colours.',
                    'Drape a chunky wool throw over one arm of the sofa.',
                    'Hang floor-length curtains slightly above the window frame.',
                ],
            },
            {
                title: 'Add living greenery',
                area: 'plants',
                priority: 'low',
                budget: 'low',
                why: 'Plants add colour, softness and life, and they balance the straight lines of furniture. One large plant usually does more than several small ones.',
                steps: [
                    'Place one tall plant, such as an olive tree or fiddle-leaf fig, in a bright corner.',
                    'Use simple terracotta or stone-coloured pots.',
                ],
            },
        ],
        palette: [
            { name: 'Warm linen', hex: '#EFE7DC', usage: 'Walls and ceiling' },
            { name: 'Oat', hex: '#D9C8B0', usage: 'Rug and large textiles' },
            { name: 'Natural oak', hex: '#A9825A', usage: 'Wood furniture and frames' },
            { name: 'Olive leaf', hex: '#7C8566', usage: 'Cushions and plants' },
            { name: 'Deep walnut', hex: '#4A3A2F', usage: 'Small accents and lamp bases' },
        ],
        keep: [
            'The main sofa, if it is comfortable: new cushions and a throw will refresh it.',
            'Any solid wood furniture, which suits the warm direction.',
            'The natural light from the windows: keep window coverings light.',
        ],
        summary: 'With warmer walls, layered lamps, a generous rug and fewer, better accessories, the space will feel calm, welcoming and pulled together, without replacing everything you own.',
    },
    imagePrompt: 'Redesign this exact room and keep the same camera angle, perspective, walls, windows, doors and architecture. Paint the walls a warm linen off-white. Keep the existing sofa and add linen and olive-green cushions with a chunky oat wool throw. Place a large low-pile oat-coloured rug under the seating. Add a natural oak coffee table, a slim brass floor lamp and a ceramic table lamp with warm light. Hang floor-length linen curtains. Put a tall olive tree in a terracotta pot in the brightest corner. Keep surfaces tidy with a few grouped ceramics and books. No people, no text.',
});

module.exports = { buildDemoAnalysis };
