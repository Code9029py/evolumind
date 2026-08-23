import { ShieldAlert } from 'lucide-react';
import { coreContent } from '../../theme/evolumindTheme.js';

export default function EthicalNoticeSection() {
  return (
    <section className="section ethical-notice-section">
      <div className="ethical-notice">
        <div className="ethical-icon-wrap">
          <ShieldAlert size={32} />
        </div>
        <div className="ethical-body">
          <span className="ethical-tag">Aviso Ético y Profesional</span>
          <p>{coreContent.ethical}</p>
        </div>
      </div>
    </section>
  );
}
