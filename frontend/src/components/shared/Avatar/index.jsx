import { useState } from 'react';
import { getInitials } from '../../../helpers/GlobalMethods';

const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-24 w-24 text-3xl',
};

const Avatar = ({ src, name, size = 'sm', className = '' }) => {
    // Remember which src failed, so a new src gets a fresh try
    const [failedSrc, setFailedSrc] = useState(null);
    const showImage = src && failedSrc !== src;
    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-clay-light font-display text-clay-dark ring-2 ring-paper ${sizes[size] || sizes.sm} ${className}`}
        >
            {showImage ? (
                <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailedSrc(src)} />
            ) : (
                <span aria-hidden="true">{getInitials(name)}</span>
            )}
        </span>
    );
};

export default Avatar;
