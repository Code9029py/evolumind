import { Compass, Telescope } from 'lucide-react';
import { coreContent } from '../../theme/evolumindTheme.js';

export default function MissionVisionSection() {
  return (
    <section className="section mission-vision">
      <article>
        <Compass size={30} />
        <span>Misión</span>
        <h2>Bienestar emocional con herramientas accesibles.</h2>
        <p>{coreContent.mission}</p>
      </article>
      <article>
        <Telescope size={30} />
        <span>Visión</span>
        <h2>Democratizar el acceso a recursos terapéuticos digitales.</h2>
        <p>{coreContent.vision}</p>
      </article>
    </section>
  );
}
