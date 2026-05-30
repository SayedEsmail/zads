"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setLocalError(null);
    try {
      const userType = await login("", data.password, data.email);
      if (userType) {
        if (userType === "admin") {
          toast.success(
            locale === "ar" 
              ? "مرحباً بك في لوحة الإدارة" 
              : "Welcome to the Admin Dashboard"
          );
          router.replace(`/${locale}/admin`);
          router.refresh();
        } else {
          // If logged in user is not an admin, show error and sign out
          setLocalError(
            locale === "ar" 
              ? "عذراً، هذا الحساب غير مصرح له بالدخول كمسؤول." 
              : "Sorry, this account is not authorized as an administrator."
          );
        }
      } else {
        setLocalError(
          locale === "ar"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "Invalid email or password"
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An authentication error occurred.";
      setLocalError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] text-start">
        {/* Logo & Subtitle */}
        <div className="flex flex-col items-center justify-center text-center">
          <img src="/logo.svg" alt="Zads Logo" className="h-14 w-auto object-contain mb-6" />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-bold text-rose-700 mb-2 uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{locale === "ar" ? "لوحة الإدارة" : "ADMIN SYSTEM"}</span>
          </div>
          <h2 className="text-xl font-black text-slate-800">
            {locale === "ar" ? "تسجيل دخول المسؤول" : "Administrator Sign In"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {locale === "ar" 
              ? "أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم المركزية" 
              : "Enter your secure credentials to access the central controls"}
          </p>
        </div>

        <ErrorBanner error={localError || authError} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email input */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              {locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
            </label>
            <input
              {...register("email")}
              type="email"
              dir="ltr"
              placeholder="admin@zads.com"
              className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-300"
            />
            {errors.email && (
              <p className="mt-1.5 px-1 text-xs font-semibold text-rose-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              {locale === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 px-1 text-xs font-semibold text-rose-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-[1.25rem] bg-rose-600 hover:bg-rose-700 py-4 text-sm font-bold text-white shadow-lg shadow-rose-600/10 transition-all hover:shadow-rose-600/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{locale === "ar" ? "دخول لوحة التحكم" : "Enter System"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
