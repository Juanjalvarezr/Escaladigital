import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled application error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-6">
        <section className="max-w-md text-center bg-dark-secondary border border-gray-700 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-3">Algo salió mal</h1>
          <p className="text-gray-300 mb-6">
            La aplicación encontró un error inesperado. Tus datos locales no se borraron.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-5 py-3 rounded-lg bg-electric-blue text-white font-semibold hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Recargar aplicación
          </button>
        </section>
      </main>
    );
  }
}
