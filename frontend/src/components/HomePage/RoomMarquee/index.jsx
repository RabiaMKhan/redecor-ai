import { Sparkle } from 'lucide-react';

const rooms = ['Living room', 'Bedroom', 'Kitchen', 'Balcony', 'Home office', 'Dining corner', 'Hallway', "Kids' room", 'Reading nook', 'Bathroom'];

// A slow scrolling band of the spaces Redecor AI can work with.
// The list is drawn twice so the loop is seamless; the copy is hidden from screen readers.
const RoomMarquee = () => (
    <section aria-label="Spaces Redecor AI can redesign" className="overflow-hidden bg-ink py-5 text-paper">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1 ? 'true' : undefined} className="flex shrink-0 items-center">
                    {rooms.map((room) => (
                        <li key={room} className="flex items-center gap-8 pr-8 font-display text-2xl italic text-paper/90 sm:text-3xl">
                            {room}
                            <Sparkle aria-hidden="true" className="h-4 w-4 fill-clay text-clay" />
                        </li>
                    ))}
                </ul>
            ))}
        </div>
    </section>
);

export default RoomMarquee;
