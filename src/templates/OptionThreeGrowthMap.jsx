import { ArrowDown, MapPinned } from 'lucide-react';
import EthicalNoticeSection from '../components/home/EthicalNoticeSection.jsx';
import FeaturedCatalogSection from '../components/home/FeaturedCatalogSection.jsx';
import FinalContactBlock from '../components/home/FinalContactBlock.jsx';
import HeroEvoluMind from '../components/home/HeroEvoluMind.jsx';
import MissionVisionSection from '../components/home/MissionVisionSection.jsx';
import ValueProposalSection from '../components/home/ValueProposalSection.jsx';

const journey = [
  'Descubrí tu punto de partida.',
  'Elegí el área emocional que querés trabajar.',
  'Accedé a un cuadernillo digital.',
  'Trabajá a tu ritmo.',
  'Seguimos evolucionando.',
];

export default function OptionThreeGrowthMap({ showSwitcher = false }) {
  return (
    <div className="template template-three">
      {showSwitcher && (
        <div className="template-switcher map-switcher">
          <a href="/opcion-1">Neuro Wellness Platform</a>
          <a className="active" href="/opcion-3">
            Mapa de crecimiento personal
          </a>
        </div>
      )}
      <HeroEvoluMind variant="map" />
      <section className="section journey-section">
        <div className="journey-title">
          <MapPinned size={30} />
          <div>
            <span className="eyebrow">Recorrido EvoluMind</span>
            <h2>Un mapa visual para avanzar desde el autoconocimiento hacia la acción.</h2>
          </div>
        </div>
        <div className="journey-path">
          {journey.map((item, index) => (
            <article className="journey-node" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
              {index < journey.length - 1 && <ArrowDown size={20} aria-hidden="true" />}
            </article>
          ))}
        </div>
      </section>
      <ValueProposalSection />
      <MissionVisionSection />
      <FeaturedCatalogSection compact />
      <EthicalNoticeSection />
      <FinalContactBlock />
    </div>
  );
}
