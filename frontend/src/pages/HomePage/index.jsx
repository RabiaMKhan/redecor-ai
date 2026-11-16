import LandingSection from '../../components/HomePage/LandingSection';
import Services from '../../components/HomePage/Services';
import Varities from '../../components/HomePage/Varities';
import ResultPreview from '../../components/HomePage/ResultPreview';
import Advantages from '../../components/HomePage/Advantages';
import ContactUS from '../../components/HomePage/ContactUS';
import { usePageTitle } from '../../utils/utils';

const HomePage = () => {
    usePageTitle();
    return (
        <>
            <LandingSection />
            <Services />
            <Varities />
            <ResultPreview />
            <Advantages />
            <ContactUS />
        </>
    );
};

export default HomePage;
