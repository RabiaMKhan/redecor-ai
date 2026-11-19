import { useEffect, useRef, useState } from 'react';

// Fades its content up the first time it scrolls into view.
// Without IntersectionObserver (old browsers, tests) it simply shows the content.
const Reveal = ({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return undefined;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '0px 0px -8% 0px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
            style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
            {...rest}
        >
            {children}
        </Tag>
    );
};

export default Reveal;
