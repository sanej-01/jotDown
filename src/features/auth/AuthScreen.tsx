import type { ReactNode } from 'react';
import { Brand } from '@/components/Brand';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * Shared layout for the auth screens (sign in / sign up / reset), mirroring the
 * prototype: theme toggle top-right, centered logo + wordmark, then the form.
 */
export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-canvas">
      <div className="mx-auto flex min-h-full max-w-sm flex-col px-6 pb-10 pt-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt=""
            width={110}
            height={110}
            className="h-[110px] w-[110px] select-none"
          />
          <Brand withTagline large className="mt-4" />
        </div>

        <div className="mt-8 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
