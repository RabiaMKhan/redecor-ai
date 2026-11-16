const SectionHeading = ({ eyebrow, title, text, align = 'left', as: Tag = 'h2', className = '' }) => (
    <div className={`flex flex-col gap-3 ${align === 'center' ? 'items-center text-center' : ''} ${className}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Tag className="max-w-2xl font-display text-3xl leading-[1.1] text-ink sm:text-4xl md:text-[44px]">{title}</Tag>
        {text && <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{text}</p>}
    </div>
);

export default SectionHeading;
