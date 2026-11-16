import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Routing from './routes';
import ScrollToTop from './routes/ScrollToTop';
import colors from './utils/styles/colors';

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routing />
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: colors.ink,
                        color: colors.paper,
                        borderRadius: '999px',
                        padding: '10px 18px',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: colors.sage.light, secondary: colors.ink } },
                    error: { iconTheme: { primary: '#F2B8B5', secondary: colors.ink } },
                }}
            />
        </BrowserRouter>
    );
}

export default App;
