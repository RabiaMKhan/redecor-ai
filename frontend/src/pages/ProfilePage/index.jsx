import { useSearchParams } from 'react-router-dom';
import { LogOut, ScanSearch } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar, Button } from '../../components/shared';
import DesignsCard from '../../components/ProfilePage/DesignsCard';
import AccountSettingCard from '../../components/ProfilePage/AccountSettingCard';
import SecuritySettingCard from '../../components/ProfilePage/SecuritySettingCard';
import { accountLabel, useCurrentUser, usePageTitle, useSignOut } from '../../utils/utils';
import { formatDate } from '../../helpers/GlobalMethods';

const tabs = [
    { id: 'designs', label: 'My designs', component: DesignsCard },
    { id: 'account', label: 'Account', component: AccountSettingCard },
    { id: 'security', label: 'Security', component: SecuritySettingCard },
];

const ProfilePage = () => {
    usePageTitle('My account');
    const user = useCurrentUser();
    const signOut = useSignOut();
    const [searchParams, setSearchParams] = useSearchParams();
    const active = tabs.find((tab) => tab.id === searchParams.get('tab')) || tabs[0];
    const ActiveTab = active.component;

    return (
        <div className="container-page pt-10 md:pt-14">
            <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                    <Avatar src={user?.profileImage} name={user?.username} size="lg" />
                    <div className="min-w-0">
                        <h1 className="truncate font-display text-4xl text-ink">{user?.username}</h1>
                        <p className="truncate text-muted">{accountLabel(user)}</p>
                        {user?.createdAt && <p className="mt-0.5 text-sm text-muted">Member since {formatDate(user.createdAt)}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button to="/ai" icon={ScanSearch}>
                        New analysis
                    </Button>
                    <Button
                        variant="secondary"
                        icon={LogOut}
                        onClick={() => {
                            signOut('/');
                            toast.success('You are signed out.');
                        }}
                    >
                        Sign out
                    </Button>
                </div>
            </header>

            {user?.isGuest && (
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-clay/20 bg-clay-light/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-clay-dark">
                        You're using a guest account. It and its designs are deleted automatically
                        {user.guestExpiresAt ? ` on ${new Date(user.guestExpiresAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ' after 24 hours'}.
                        Create a free account to keep your designs.
                    </p>
                    <Button size="sm" className="shrink-0" onClick={() => signOut('/signup')}>
                        Create a free account
                    </Button>
                </div>
            )}

            <div className="mt-10 border-b border-line" role="tablist" aria-label="Account sections">
                <div className="-mb-px flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={active.id === tab.id}
                            onClick={() => setSearchParams(tab.id === 'designs' ? {} : { tab: tab.id })}
                            className={`whitespace-nowrap border-b-2 pb-3 text-[15px] font-medium transition-colors ${active.id === tab.id ? 'border-clay text-ink' : 'border-transparent text-muted hover:text-ink'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8" role="tabpanel" aria-label={active.label}>
                <ActiveTab />
            </div>
        </div>
    );
};

export default ProfilePage;
