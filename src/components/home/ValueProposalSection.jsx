import { HeartHandshake, LockKeyhole, TabletSmartphone } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import { coreContent } from '../../theme/evolumindTheme.js';

const values = [
  {
    title: 'Acompañamiento práctico',
    text: 'Ejercicios claros para transformar el malestar en acciones pequeñas y posibles.',
    icon: HeartHandshake,
  },
  {
    title: 'Privacidad y autonomía',
    text: 'Materiales para trabajar desde cualquier espacio, sin exposición innecesaria.',
    icon: LockKeyhole,
  },
  {
    title: 'Acceso inmediato',
    text: 'Cuadernillos digitales listos para usar desde celular, tablet o computadora.',
    icon: TabletSmartphone,
  },
];

export default function ValueProposalSection() {
  return (
    <section className="section value-section">
      <SectionHeader eyebrow="Propuesta de valor" title={coreContent.value} />
      <div className="value-grid">
        {values.map((item) => {
          const Icon = item.icon;
          return (
            <article className="info-card" key={item.title}>
              <Icon size={26} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
