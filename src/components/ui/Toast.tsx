import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** Undo window per the Appendix: 6 seconds, one level (no undo history). */
const UNDO_MS = 6000;

interface ToastOptions {
  message: string;
  /** Optional action button (e.g. "Undo"). */
  actionLabel?: string;
  onAction?: () => void;
  /** Auto-dismiss delay; defaults to the 6s undo window. */
  duration?: number;
}

interface ToastState extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * A single, self-dismissing toast anchored above the tab bar. One-at-a-time
 * (matching the one-level undo model): a new toast replaces the current one.
 * Announced to screen readers via role="status" (ACC-02).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    const id = Date.now();
    setToast({ id, ...options });
    timer.current = setTimeout(() => setToast(null), options.duration ?? UNDO_MS);
  }, []);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-md items-center gap-4 rounded-pill bg-content px-5 py-3 text-sm text-canvas shadow-lg">
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.();
                  dismiss();
                }}
                className="font-semibold text-brand-strong underline-offset-2 hover:underline focus-visible:outline-none"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
