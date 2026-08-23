import { BookCheck, GraduationCap, Users } from 'lucide-react';
import SectionHeader from '../common/SectionHeader.jsx';
import { academicInfo } from '../../theme/evolumindTheme.js';

export default function AboutTeamSection() {
  return (
    <section className="section about-team-section" id="quienes-somos">
      <SectionHeader
        eyebrow="Quiénes Somos"
        title="Herramientas de bienestar creadas desde la psicología."
        description="EvoluMind es una iniciativa de la carrera de Psicología de la Universidad Iberoamericana (UNIBE - Sede San Lorenzo), orientada a diseñar materiales prácticos de autoayuda con rigor conceptual y formato accesible para la vida cotidiana."
        align="left"
      />

      <div className="academic-highlight-grid">
        <div className="academic-feature-card">
          <div className="feature-icon-box">
            <GraduationCap size={28} />
          </div>
          <div>
            <h3>Sustento Psicológico</h3>
            <p>
              Contenidos basados en modelos cognitivo-conductuales y humanistas adaptados al bienestar diario.
            </p>
          </div>
        </div>

        <div className="academic-feature-card">
          <div className="feature-icon-box">
            <BookCheck size={28} />
          </div>
          <div>
            <h3>Metodología Activa</h3>
            <p>
              Ejercicios de autorregistro guiado para transformar la reflexión en hábitos concretos y medibles.
            </p>
          </div>
        </div>
      </div>

      <div className="team-container">
        <div className="team-header-bar">
          <Users size={22} />
          <h3>Equipo de Trabajo</h3>
        </div>

        <div className="team-grid">
          {academicInfo.team.map((member, index) => (
            <article className="team-card" key={member.name}>
              <div className="team-avatar">
                <span>{index + 1}</span>
              </div>
              <div className="team-info">
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
