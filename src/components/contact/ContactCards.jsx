import { Camera, ExternalLink, Mail, MessageCircle, Share2, Sparkles } from 'lucide-react';

const iconMap = {
  MessageCircle,
  Camera,
  Share2,
  Mail,
};

export default function ContactCards({ channels }) {
  return (
    <section className="section contact-grid-section">
      <div className="contact-grid">
        {channels.map((channel) => {
          let IconComponent = MessageCircle;
          if (channel.icon && typeof channel.icon === 'function') {
            IconComponent = channel.icon;
          } else if (channel.iconName && iconMap[channel.iconName]) {
            IconComponent = iconMap[channel.iconName];
          }

          return (
            <a
              className={`contact-card ${channel.tone || 'blue'}`}
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
              key={channel.id || channel.label}
            >
              <div className="contact-card-top">
                <div className="contact-icon-bubble">
                  <IconComponent size={26} />
                </div>
                <ExternalLink size={16} className="contact-ext-icon" />
              </div>
              <div className="contact-card-info">
                <span className="contact-label">{channel.label}</span>
                <strong className="contact-value">{channel.value}</strong>
                {channel.subtext && <small className="contact-subtext">{channel.subtext}</small>}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
