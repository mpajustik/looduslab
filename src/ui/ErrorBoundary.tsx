import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Globaalne veapüüdja: kui mõni komponent viskab vea, näeb kasutaja
 * sõbralikku lehte, MITTE valget tühja ekraani.
 *
 * Peab olema klass – Reactis ei ole veapüüdmiseks hook'i.
 * Etapis 2 lisandub siia Sentry teavitus; praegu piisab konsoolist.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Püütud viga:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Midagi läks valesti
          </h1>
          <p className="text-ink-soft">
            Sinu töö on alles. Proovi uuesti – kui viga kordub, ava esileht.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={this.handleRetry}>Proovi uuesti</Button>
          {/* Täislaadimine (mitte Link): see puhastab katkise oleku ära. */}
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Ava esileht
          </Button>
        </div>
      </main>
    );
  }
}
