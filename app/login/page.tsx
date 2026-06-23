import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Image
            src="/pane-icon.png"
            alt="Pane logo"
            width={48}
            height={48}
            priority
            className="size-12 rounded-xl dark:invert"
          />
          <h1 className="text-2xl font-semibold">Pane</h1>
          <p className="text-sm text-muted-foreground">Your personal workspace</p>
        </div>
        <div className="rounded-lg border bg-[var(--color-surface)] p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
