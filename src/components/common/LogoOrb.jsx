export default function LogoOrb({ variant = 'card' }) {
  return (
    <div className={`logo-orb ${variant}`}>
      <div className="neural-rings" aria-hidden="true" />
      <img
        src="/logo.jpeg"
        alt="Logo de EvoluMind"
        decoding="async"
        width="280"
        height="280"
      />
    </div>
  );
}
