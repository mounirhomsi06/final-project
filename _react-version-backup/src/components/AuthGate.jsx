import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
export function AuthGate() {
  const auth = useAuth();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  function switchTab(next) {
    setTab(next);
    setError("");
  }
  function handleLogin(e) {
    e.preventDefault();
    setError("");
    const result = auth.login(loginEmail, loginPassword);
    if (!result.ok) setError(result.error);
  }
  function handleSignup(e) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) return setError("Enter a valid email address.");
    if (signupPassword.length < 6) return setError("Use at least 6 characters for your password.");
    if (signupPassword !== confirm) return setError("Passwords do not match.");
    const result = auth.signup(name, signupEmail, signupPassword);
    if (!result.ok) setError(result.error);
  }
  return <div className="stage fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-9 flex justify-center">
          <Logo iconClassName="size-9 text-primary" wordmarkClassName="font-display text-2xl uppercase tracking-[0.32em]" />
        </div>

        <div className="mb-8 flex rounded-full border border-border p-1">
          <button type="button" onClick={() => switchTab("login")} aria-pressed={tab === "login"} className={`flex-1 rounded-full py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${tab === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Sign in
          </button>
          <button type="button" onClick={() => switchTab("signup")} aria-pressed={tab === "signup"} className={`flex-1 rounded-full py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${tab === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Create account
          </button>
        </div>

        {error && <p className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs leading-relaxed text-destructive">
            {error}
          </p>}

        {tab === "login" ? <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Email
              </Label>
              <Input id="login-email" type="email" autoComplete="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Password
              </Label>
              <Input id="login-password" type="password" autoComplete="current-password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Sign in
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              New here?{" "}
              <button type="button" onClick={() => switchTab("signup")} className="text-primary underline-offset-4 hover:underline">
                Create an account
              </button>
            </p>
          </form> : <form onSubmit={handleSignup} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Full name
              </Label>
              <Input id="signup-name" type="text" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Blake" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Email
              </Label>
              <Input id="signup-email" type="email" autoComplete="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Password
              </Label>
              <Input id="signup-password" type="password" autoComplete="new-password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Confirm password
              </Label>
              <Input id="signup-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Create account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already a member?{" "}
              <button type="button" onClick={() => switchTab("login")} className="text-primary underline-offset-4 hover:underline">
                Sign in
              </button>
            </p>
          </form>}
      </div>
    </div>;
}
