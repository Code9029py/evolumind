import { ShieldAlert } from 'lucide-react';
import { coreContent } from '../../theme/evolumindTheme.js';

export default function EthicalNoticeSection() {
  return (
    <section className="section ethical-notice">
      <ShieldAlert size={28} />
      <div>
        <span>Aviso ético</span>
        <p>{coreContent.ethical}</p>
      </div>
    </section>
  );
}
