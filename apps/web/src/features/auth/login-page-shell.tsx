import { AuthVisualPanel } from "./auth-visual-panel"
import { LoginForm } from "./login-form"

export function LoginPageShell() {
  return (
    <main className="min-h-[100dvh] bg-bg-base text-foreground lg:grid lg:grid-cols-[48%_52%]">
      <section className="hidden min-h-[100dvh] lg:block">
        <AuthVisualPanel />
      </section>
      <section className="flex min-h-[100dvh] flex-col bg-bg-base px-6 py-8 sm:px-10 sm:py-10 lg:px-12 xl:px-16">
        <div className="font-brand text-sm font-semibold tracking-[0.22em] text-foreground lg:hidden">
          RISK<span className="text-primary">SPHERE</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-14 sm:py-16 lg:py-10">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
