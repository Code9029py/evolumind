import EthicalNoticeSection from '../components/home/EthicalNoticeSection.jsx';
import FeaturedCatalogSection from '../components/home/FeaturedCatalogSection.jsx';
import FinalContactBlock from '../components/home/FinalContactBlock.jsx';
import HeroEvoluMind from '../components/home/HeroEvoluMind.jsx';
import HowItWorksSection from '../components/home/HowItWorksSection.jsx';
import MissionVisionSection from '../components/home/MissionVisionSection.jsx';
import ValueProposalSection from '../components/home/ValueProposalSection.jsx';

export default function OptionOneNeuroWellness({ showSwitcher = false }) {
  return (
    <div className="template template-one">
      {showSwitcher && (
        <div className="template-switcher">
          <a className="active" href="/opcion-1">
            Neuro Wellness Platform
          </a>
          <a href="/opcion-3">Mapa de crecimiento personal</a>
        </div>
      )}
      <HeroEvoluMind variant="platform" />
      <ValueProposalSection />
      <MissionVisionSection />
      <HowItWorksSection />
      <FeaturedCatalogSection />
      <EthicalNoticeSection />
      <FinalContactBlock />
    </div>
  );
}
