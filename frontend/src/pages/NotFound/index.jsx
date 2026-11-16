import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/shared';
import { usePageTitle } from '../../utils/utils';

const NotFound = () => {
    usePageTitle('Page not found');
    return (
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-8xl text-clay/80">404</p>
            <h1 className="mt-4 font-display text-4xl text-ink">This room doesn't exist</h1>
            <p className="mt-3 max-w-md text-muted">The page you are looking for has moved or never existed.</p>
            <Button to="/" icon={ArrowLeft} className="mt-8">
                Back to home
            </Button>
        </div>
    );
};

export default NotFound;
