import AboutTeamSection from '../components/home/AboutTeamSection.jsx';
import EthicalNoticeSection from '../components/home/EthicalNoticeSection.jsx';
import HeroEvoluMind from '../components/home/HeroEvoluMind.jsx';
import JourneyMapSection from '../components/home/JourneyMapSection.jsx';
import MissionVisionSection from '../components/home/MissionVisionSection.jsx';
import ValueProposalSection from '../components/home/ValueProposalSection.jsx';

export default function Home() {
  return (
    <div className="home-page-container">
      <HeroEvoluMind />
      <AboutTeamSection />
      <ValueProposalSection />
      <MissionVisionSection />
      <JourneyMapSection />
      <EthicalNoticeSection />
    </div>
  );
}
