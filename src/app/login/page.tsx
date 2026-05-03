"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-gray-50" />}> 
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "Login failed" });
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.user.fullName.split(" ")[0]}`);
      router.push(next);
      router.refresh();
    } catch {
      setErrors({ form: "Network error. Please try again." });
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-svh overflow-hidden bg-gray-50">
      {/* Animated background blobs */}
      <motion.div
        aria-hidden
        animate={{
          background: [
            "linear-gradient(135deg, rgba(236,90,46,0.15) 0%, rgba(22,163,74,0.10) 100%)",
            "linear-gradient(225deg, rgba(22,163,74,0.12) 0%, rgba(234,179,8,0.12) 100%)",
            "linear-gradient(315deg, rgba(234,179,8,0.12) 0%, rgba(236,90,46,0.15) 100%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary-300 blur-3xl opacity-50"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-secondary-300 blur-3xl opacity-40"
        animate={{ x: [0, -90, 0], y: [0, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-accent-300 blur-3xl opacity-40"
        animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 grid min-h-svh lg:grid-cols-2">
        {/* Left: Brand storytelling */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 text-gray-900">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-floating">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-none">
                NBOOG SACCO
              </p>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                Trust · Growth · Community
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
              Where every{" "}
              <span className="text-gradient-warm">shilling</span> tells a
              story.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              A premium savings & credit cooperative platform — designed for the
              people who built it. Track contributions, attendance, and savings
              with the kind of care your members deserve.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {[
                { v: "256-bit", l: "Encryption" },
                { v: "Audit", l: "Trail" },
                { v: "RBAC", l: "Access" },
              ].map((it) => (
                <div key={it.l} className="rounded-2xl bg-white/70 backdrop-blur p-4 border border-primary-100">
                  <p className="font-mono text-xl font-bold text-primary-700">
                    {it.v}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {it.l}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-gray-500 font-mono"
          >
            © {new Date().getFullYear()} NBOOG SACCO · Built with care.
          </motion.p>
        </div>

        {/* Right: Login form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-floating">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display font-bold text-lg leading-none">
                  NBOOG SACCO
                </p>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                  Trust · Growth · Community
                </p>
              </div>
            </div>

            <div
              className="relative rounded-[32px] bg-white shadow-epic p-8 sm:p-10 border border-primary-100"
              style={{ borderRadius: "32px 8px 32px 8px" }}
            >
              <div className="mb-8">
                <p className="text-sm font-mono uppercase tracking-widest text-primary-600 mb-2">
                  Welcome back
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                  Sign in to your{" "}
                  <span className="text-gradient-warm">portal</span>
                </h2>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <Input
                  label="Username or Email"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  leadingIcon={<User className="h-4 w-4" />}
                  error={errors.identifier}
                  disabled={loading}
                  placeholder="treasurer or you@nboog.org"
                />
                <Input
                  label="Password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leadingIcon={<Lock className="h-4 w-4" />}
                  trailingIcon={
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      aria-label={showPwd ? "Hide password" : "Show password"}
                      className="hover:text-gray-700"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password}
                  disabled={loading}
                  placeholder="••••••••••"
                />

                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                  >
                    {errors.form}
                  </motion.div>
                )}

                <MagneticButton
                  type="submit"
                  fullWidth
                  loading={loading}
                  variant="primary"
                  className="!py-4 !text-base"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </form>

              <div className="mt-8 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-secondary-600" />
                <span>
                  Protected by JWT, rate limiting, and audit logging.
                </span>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Forgot your password? Contact your SACCO administrator.
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
