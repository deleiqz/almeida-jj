import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '60vh', textAlign: 'center', padding: '40px', color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: 'var(--danger, #ef4444)', marginBottom: '10px' }}>Algo deu errado</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', marginBottom: '20px', maxWidth: '400px' }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '12px 30px', background: 'var(--accent-primary, gold)', color: 'black',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
