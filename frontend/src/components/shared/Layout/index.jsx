import Footer from '../Footer';
import Navbar from '../Navbar';

const Layout = ({ children }) => (
    <div className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
            Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
            {children}
        </main>
        <Footer />
    </div>
);

export default Layout;
