import { HeartHandshake, LockKeyhole, Sparkles, TabletSmartphone } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import { coreContent } from '../../theme/evolumindTheme.js';

const values = [
  {
    title: 'Acompañamiento Práctico',
    text: 'Ejercicios guiados y autorregistros para transformar el malestar en hábitos posibles y concretos.',
    icon: HeartHandshake,
  },
  {
    title: 'Privacidad y Autonomía',
    text: 'Materiales 100% interactivos para completar a tu ritmo desde cualquier lugar, con total confidencialidad.',
    icon: LockKeyhole,
  },
  {
    title: 'Acceso Inmediato 24/7',
    text: 'Descarga instantánea en formato PDF digital optimizado para celular, tablet o computadora.',
    icon: TabletSmartphone,
  },
];

export default function ValueProposalSection() {
  return (
    <section className="section value-section">
      <SectionHeader
        eyebrow="Nuestra Propuesta de Valor"
        title={coreContent.value}
        description="Un puente accesible y riguroso entre el autoconocimiento y la salud mental cotidiana."
      />
      <div className="value-grid">
        {values.map((item) => {
          const Icon = item.icon;
          return (
            <article className="info-card" key={item.title}>
              <div className="info-card-icon">
                <Icon size={28} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
