import logo from '../../assets/logo/EvoluMind_logo.jpeg';

export default function LogoOrb({ variant = 'card' }) {
  return (
    <div className={`logo-orb ${variant}`}>
      <div className="neural-rings" aria-hidden="true" />
      <img src={logo} alt="Logo de EvoluMind" />
    </div>
  );
}
