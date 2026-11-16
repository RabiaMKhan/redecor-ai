// Warm editorial palette. Tailwind reads these through tailwind.config.js,
// and components that need raw values (e.g. toasts) import them from here.
const colors = {
    cream: '#F6F1EA',
    paper: '#FCFAF6',
    sand: '#EDE3D6',
    line: '#E3D7C7',
    ink: '#2A2421',
    muted: '#6E6259',
    clay: {
        DEFAULT: '#B4532F',
        dark: '#96432A',
        light: '#F4E3DA',
    },
    sage: {
        DEFAULT: '#6F7F62',
        light: '#E4E9DE',
    },
    danger: {
        DEFAULT: '#B42318',
        light: '#FBE9E7',
    },
};

module.exports = colors;
