import { LoaderCircle } from 'lucide-react';

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

const Spinner = ({ size = 'md', className = '', label }) => (
    <span role="status" className={`inline-flex items-center gap-2 ${className}`}>
        <LoaderCircle aria-hidden="true" className={`${sizes[size] || sizes.md} animate-spin`} />
        <span className={label ? 'text-sm' : 'sr-only'}>{label || 'Loading'}</span>
    </span>
);

export default Spinner;
