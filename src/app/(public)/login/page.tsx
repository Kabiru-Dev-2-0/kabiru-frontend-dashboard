"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, Sparkles, User, Users } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { formatZodError } from "@/lib/validation";
import {
  LoginFormSchema,
  RegisterFormSchema,
  type AuthorRole,
  type DashboardSessionUser,
} from "@/types/auth";

/**
 * Mencegah Open Redirect (OWASP): hanya izinkan path internal yang dimulai '/' tunggal.
 */
function sanitizeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/login")) {
    return "/dashboard";
  }
  return raw;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = sanitizeRedirectPath(searchParams.get("redirect"));
  const reason = searchParams.get("reason");

  const [activeTab, setActiveTab] = React.useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(
    reason === "session_expired"
      ? "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan pekerjaan."
      : null,
  );
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Form Login
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");

  // Form Register Akun Studio (memudahkan pengujian karena auth-service dev memakai in-memory storage)
  const [regFullName, setRegFullName] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regRole, setRegRole] = React.useState<"teacher" | "developer">("developer");

  // Jika sudah punya session cookie valid, langsung masuk ke dashboard
  React.useEffect(() => {
    let mounted = true;
    apiFetch<{ user: DashboardSessionUser }>("/api/auth/session", {
      method: "GET",
      skipUnauthorizedRedirect: true,
    })
      .then((res) => {
        if (mounted && res.data?.user) {
          router.replace(redirectTarget);
        }
      })
      .catch(() => {
        // Belum login — tetap di /login
      });

    return () => {
      mounted = false;
    };
  }, [router, redirectTarget]);

  const clearErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const parsed = LoginFormSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of formatZodError(parsed.error)) {
        if (!nextErrors[issue.field]) nextErrors[issue.field] = issue.reason;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch<{ user: DashboardSessionUser }>("/api/auth/login", {
        method: "POST",
        body: parsed.data,
        skipUnauthorizedRedirect: true,
      });
      router.replace(redirectTarget);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
        if (error.details) {
          const nextErrors: Record<string, string> = {};
          for (const d of error.details) {
            nextErrors[d.field] = d.reason;
          }
          setFieldErrors(nextErrors);
        }
      } else {
        setFormError("Terjadi kesalahan saat menghubungi server autentikasi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const parsed = RegisterFormSchema.safeParse({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of formatZodError(parsed.error)) {
        if (!nextErrors[issue.field]) nextErrors[issue.field] = issue.reason;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch<{ user: DashboardSessionUser }>("/api/auth/register", {
        method: "POST",
        body: parsed.data,
        skipUnauthorizedRedirect: true,
      });
      router.replace(redirectTarget);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
        if (error.details) {
          const nextErrors: Record<string, string> = {};
          for (const d of error.details) {
            nextErrors[d.field] = d.reason;
          }
          setFieldErrors(nextErrors);
        }
      } else {
        setFormError("Terjadi kesalahan saat mendaftarkan akun Studio.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: AuthorRole) => {
    clearErrors();
    setIsSubmitting(true);
    try {
      await apiFetch<{ user: DashboardSessionUser }>("/api/auth/login", {
        method: "POST",
        body: { mode: "demo", role },
        skipUnauthorizedRedirect: true,
      });
      router.replace(redirectTarget);
    } catch {
      setFormError("Gagal mengaktifkan Mode Simulasi UI.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFCFF] px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img src="/icons/logo.svg" alt="Kabiru Dashboard" className="h-[44px] w-[148px] object-contain" />
          <h1 className="text-xl font-bold tracking-tight text-[#11181C]">Masuk ke Dashboard</h1>
          <p className="text-xs text-[#606876]">Gunakan akun Guru, Developer, atau Admin</p>
        </div>

        <Card padding={28} className="border-[#E8E8E8] bg-white shadow-xs">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              clearErrors();
              setActiveTab(val as "login" | "register");
            }}
            className="gap-5"
          >
            <TabsList className="w-full">
              <TabsTrigger value="login">Masuk Akun</TabsTrigger>
              <TabsTrigger value="register">Daftar Akun</TabsTrigger>
            </TabsList>

            {formError && <Alert variant="fail" title="Autentikasi Gagal" description={formError} dismissible={false} />}

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <InputField
                  label="Email Akun"
                  requiredMark
                  type="email"
                  placeholder="nama@kabiru.id"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  state={fieldErrors.email ? "error" : "default"}
                  errorMessage={fieldErrors.email}
                  icon={<Mail size={16} />}
                  iconPosition="left"
                  fullWidth
                  autoComplete="email"
                />

                <InputField
                  label="Password"
                  requiredMark
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  state={fieldErrors.password ? "error" : "default"}
                  errorMessage={fieldErrors.password}
                  icon={<Lock size={16} />}
                  iconPosition="left"
                  fullWidth
                  autoComplete="current-password"
                />

                <div className="pt-2">
                  <Button type="submit" variant="primary" fullWidth disabled={isSubmitting} rightIcon={<ArrowRight size={16} />}>
                    {isSubmitting ? "Memproses Autentikasi..." : "Masuk ke Dashboard"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                <InputField
                  label="Nama Lengkap"
                  requiredMark
                  placeholder="Contoh: Achmad Soewardi"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  state={fieldErrors.fullName ? "error" : "default"}
                  errorMessage={fieldErrors.fullName}
                  icon={<User size={16} />}
                  iconPosition="left"
                  fullWidth
                />

                <InputField
                  label="Email"
                  requiredMark
                  type="email"
                  placeholder="dev@kabiru.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  state={fieldErrors.email ? "error" : "default"}
                  errorMessage={fieldErrors.email}
                  icon={<Mail size={16} />}
                  iconPosition="left"
                  fullWidth
                />

                <InputField
                  label="Password"
                  requiredMark
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  state={fieldErrors.password ? "error" : "default"}
                  errorMessage={fieldErrors.password}
                  icon={<Lock size={16} />}
                  iconPosition="left"
                  fullWidth
                />

                <SelectField
                  label="Pilih Role"
                  requiredMark
                  fullWidth
                  value={regRole}
                  onChange={(val) => setRegRole(val as "teacher" | "developer")}
                  options={[
                    { label: "Developer Modul", value: "developer" },
                    { label: "Guru / Pengajar", value: "teacher" },
                  ]}
                />

                <div className="pt-2">
                  <Button type="submit" variant="accent" fullWidth disabled={isSubmitting} rightIcon={<Sparkles size={16} />}>
                    {isSubmitting ? "Mendaftarkan Akun..." : "Buat Akun & Masuk"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer Simulasi UI Offline */}
          <div className="mt-6 border-t border-[#E8E8E8] pt-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3A3F48]">
                <Users size={14} className="text-[#277BC0]" aria-hidden="true" />
                <span>Simulasi UI (Offline)</span>
              </div>
              <span className="text-[11px] text-[#606876]">Tanpa backend</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="primary-outline" fullWidth disabled={isSubmitting} onClick={() => handleDemoLogin("teacher")}>
                Guru
              </Button>
              <Button variant="accent-outline" fullWidth disabled={isSubmitting} onClick={() => handleDemoLogin("developer")}>
                Developer
              </Button>
              <Button variant="success-outline" fullWidth disabled={isSubmitting} onClick={() => handleDemoLogin("admin")}>
                Admin
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFCFF] p-6">
          <p className="text-sm font-medium text-[#606876]">Memuat halaman login Kabiru Dashboard...</p>
        </div>
      }
    >
      <LoginPageContent />
    </React.Suspense>
  );
}
