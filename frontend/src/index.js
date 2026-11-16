import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import toast from 'react-hot-toast';
import './index.css';
import App from './App';
import store, { persistor } from './redux/store';
import { registerUnauthorizedHandler, setAuthToken } from './redux/https';
import { logout, refreshUser } from './redux/actions/userActions';

registerUnauthorizedHandler(() => {
    if (store.getState()?.user?.currentUser) {
        store.dispatch(logout());
        toast.error('Your session has ended. Please sign in again.', { id: 'session-ended' });
    }
});

// Runs once the persisted user is loaded from storage.
const onRehydrated = () => {
    setAuthToken(store.getState()?.user?.currentUser?.accessToken);
    store.dispatch(refreshUser());
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor} onBeforeLift={onRehydrated}>
                <App />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
