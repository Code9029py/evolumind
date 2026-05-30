export default function ContactCards({ channels }) {
  return (
    <section className="section contact-grid">
      {channels.map((channel) => {
        const Icon = channel.icon;
        return (
          <a className={`contact-card ${channel.tone}`} href={channel.href} key={channel.id}>
            <Icon size={28} />
            <span>{channel.label}</span>
            <strong>{channel.value}</strong>
          </a>
        );
      })}
    </section>
  );
}
