import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../Button';
import { getErrorMessage } from '../../../helpers/GlobalMethods';
import { loginUser } from '../../../redux/actions/userActions';
import axios from '../../../redux/https';
import { endPoints } from '../../../redux/constants';

// One-click demo login: the server creates a temporary account that is deleted after 24 hours.
const GuestButton = ({ to = '/ai', label = 'Try as a guest', ...rest }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const start = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(endPoints.guest);
            dispatch(loginUser(data.data));
            toast.success('You are in as a guest. Your designs are kept for 24 hours.');
            navigate(to, { replace: true });
        } catch (error) {
            toast.error(getErrorMessage(error, 'Could not start a guest session. Please try again.'));
            setLoading(false);
        }
    };

    return (
        <Button variant="secondary" icon={UserRound} loading={loading} onClick={start} {...rest}>
            {label}
        </Button>
    );
};

export default GuestButton;
