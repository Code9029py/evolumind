import { Compass, Sparkles, Telescope } from 'lucide-react';
import { coreContent } from '../../theme/evolumindTheme.js';

export default function MissionVisionSection() {
  return (
    <section className="section mission-vision-section">
      <div className="mission-vision">
        <article className="mv-card">
          <div className="mv-icon-wrap">
            <Compass size={32} />
          </div>
          <span className="mv-tag">Misión</span>
          <h2>Bienestar emocional con herramientas accesibles.</h2>
          <p>{coreContent.mission}</p>
        </article>

        <article className="mv-card">
          <div className="mv-icon-wrap">
            <Telescope size={32} />
          </div>
          <span className="mv-tag">Visión</span>
          <h2>Democratizar el acceso a recursos terapéuticos digitales.</h2>
          <p>{coreContent.vision}</p>
        </article>
      </div>
    </section>
  );
}
