import { Component } from 'react';
import { RefreshCw } from 'lucide-react';
import { C, card, primaryBtn } from '../theme.js';

// Fängt Render-Fehler irgendwo im Baum ab, damit eine kaputte Karte oder ein
// Sync-Glitch nicht die ganze App auf eine weiße Seite reduziert. Muss eine
// Klassenkomponente sein — React kennt keinen Hook-Ersatz für getDerivedStateFromError.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('Unerwarteter Fehler:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh',
        color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{ ...card, padding: '2rem 1.5rem', textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginBottom: 8 }}>
            Etwas ist schiefgelaufen
          </div>
          <div style={{ fontSize: 13.5, color: C.textSoft, marginBottom: 16 }}>
            Dein Fortschritt ist lokal gespeichert und bleibt erhalten. Ein Neuladen behebt das meistens.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ ...primaryBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Neu laden
          </button>
        </div>
      </div>
    );
  }
}
