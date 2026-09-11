import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              background: 'var(--card-bg, #ffffff)',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '0.8rem' }}>
              Algo no salió como esperábamos
            </h2>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.95rem',
                marginBottom: '1.5rem',
                lineHeight: '1.5',
              }}
            >
              Ocurrió un inconveniente al cargar esta sección. Puedes recargar la página o volver al
              catálogo principal.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="button primary"
                onClick={this.handleReset}
              >
                Recargar página
              </button>
              <a href="/catalogo" className="button ghost">
                Ir al catálogo
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
