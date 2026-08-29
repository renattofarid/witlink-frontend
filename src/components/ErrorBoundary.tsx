import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Cuando cambia, el boundary se resetea (p. ej. al navegar de ruta). */
  resetKey?: unknown;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Evita que una excepción de render deje toda la aplicación en blanco.
 * Muestra un panel de error recuperable en lugar de desmontar el árbol.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary capturó un error de render:", error, info);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="size-8 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Ocurrió un error al mostrar esta sección
          </p>
          <p className="text-xs text-muted-foreground">
            La operación no se completó correctamente. Puedes reintentar sin
            perder tu sesión.
          </p>
          {this.state.error?.message && (
            <p className="mx-auto max-w-lg break-words pt-1 font-mono text-[11px] text-muted-foreground/80">
              {this.state.error.message}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={this.handleRetry}>
          <RotateCcw className="mr-1 size-4" />
          Reintentar
        </Button>
      </div>
    );
  }
}
