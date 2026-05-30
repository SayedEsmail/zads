"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useTeacherStore } from "@/stores/teacher";
import { useSearchStore } from "@/stores/search";
import { useAuthStore } from "@/stores/auth";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Eye, EyeOff, User, Lock, MapPin, CheckCircle } from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

export default function TeacherProfilePage() {
  const t = useTranslations("teacher");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tErr = useTranslations("errors");
  const teacherStore = useTeacherStore();
  const authStore = useAuthStore();

  const { governorates, cities, areas, fetchGovernorates, fetchCities, fetchAreas } = useSearchStore();

  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Info Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [infoSuccess, setInfoSuccess] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  useEffect(() => {
    teacherStore.fetch();
    authStore.fetchProfile();
    fetchGovernorates();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authStore.profile) {
        setName(authStore.profile.name || "");
        setPhone(authStore.profile.phone || "");
      }
      if (teacherStore.data) {
        setBio(teacherStore.data.bio || "");
        setQualification(teacherStore.data.qualification || "");
        setExperienceYears(teacherStore.data.experienceYears || 0);
        setSelectedArea(teacherStore.data.areaId || "");
        if (teacherStore.data.area) {
          setSelectedCity(teacherStore.data.area.cityId || "");
          if (teacherStore.data.area.city) {
            setSelectedGov(teacherStore.data.area.city.governorateId || "");
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authStore.profile, teacherStore.data]);

  // Load cities if a governorate is pre-populated
  useEffect(() => {
    if (selectedGov) {
      fetchCities(selectedGov);
    }
  }, [selectedGov]);

  // Load areas if a city is pre-populated
  useEffect(() => {
    if (selectedCity) {
      fetchAreas(selectedCity);
    }
  }, [selectedCity]);

  if ((teacherStore.isLoading || authStore.isLoading) && !teacherStore.data) return <PageSkeleton />;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await authStore.uploadAvatar(file);
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(false);
    try {
      // 1. Update general user info (Name, Phone)
      await authStore.updateAccount({ name, phone });
      
      // 2. Update teacher-specific profile info
      await teacherStore.updateProfile({
        bio,
        qualification,
        experienceYears: Number(experienceYears) || 0,
        areaId: selectedArea || undefined,
      });

      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch {
      // Handled globally in stores
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSecuritySuccess(false);

    if (newPassword.length < 8) {
      setPasswordError(tErr("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(tErr("passwordMismatch"));
      return;
    }

    try {
      await authStore.changePassword(currentPassword, newPassword);
      setSecuritySuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSecuritySuccess(false), 3000);
    } catch {
      // Handled globally in stores
    }
  };

  const teacher = teacherStore.data;
  const user = authStore.profile || teacher?.user;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("profile")}</h1>
      </div>

      <ErrorBanner error={teacherStore.error || authStore.error} />

      {/* Tabs */}
      <div className="flex border-b border-border bg-white rounded-t-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "info"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:bg-slate-50 hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          {tCommon("personalInfo")}
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "security"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:bg-slate-50 hover:text-foreground"
          }`}
        >
          <Lock className="h-4 w-4" />
          {tCommon("securitySettings")}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="rounded-b-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300">
        
        {activeTab === "info" ? (
          <form onSubmit={handleUpdateInfo} className="space-y-6">
            
            {/* Avatar block */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name ?? ""}
                    width={72}
                    height={72}
                    className="rounded-full object-cover border-2 border-primary/20 h-18 w-18"
                  />
                ) : (
                  <div className="flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary border-2 border-primary/20">
                    {getInitials(user?.name ?? "?")}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-white">{tCommon("change")}</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground text-base">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.phone}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tCommon("avatarInstruction")}</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* General Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{tAuth("fullName")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{tAuth("phone")}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Teacher Specific Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{tCommon("qualification")}</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{tCommon("experienceYears")}</label>
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{tAuth("bio")}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Location Selectors */}
            <div className="border-t border-slate-50 pt-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {tCommon("area")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Governorate */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{tCommon("governorate")}</label>
                  <select
                    value={selectedGov}
                    onChange={(e) => {
                      setSelectedGov(e.target.value);
                      setSelectedCity("");
                      setSelectedArea("");
                    }}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="">{tCommon("selectGovernorate")}</option>
                    {governorates.map((g) => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{tCommon("city")}</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedArea("");
                    }}
                    disabled={!selectedGov}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{tCommon("selectCity")}</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{tCommon("area")}</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    disabled={!selectedCity}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{tCommon("selectArea")}</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.nameAr}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Success alert */}
            {infoSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>{tCommon("save")} تم الحفظ بنجاح</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={teacherStore.isLoading || authStore.isLoading}
                className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/10 disabled:opacity-60"
              >
                {teacherStore.isLoading || authStore.isLoading ? "..." : tCommon("save")}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <h2 className="text-sm font-bold text-foreground">{tAuth("forgotPassword")}</h2>
            
            {passwordError && <ErrorBanner error={passwordError} />}

            {/* Current Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{tAuth("password")}</label>
              <div className="relative max-w-md">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border px-3 py-2.5 pe-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">كلمة المرور الجديدة</label>
              <div className="relative max-w-md">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border px-3 py-2.5 pe-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">تأكيد كلمة المرور الجديدة</label>
              <div className="relative max-w-md">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border px-3 py-2.5 pe-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 end-0 flex items-center pe-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Success alert */}
            {securitySuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>تم تغيير كلمة المرور بنجاح!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={authStore.isLoading}
                className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/10 disabled:opacity-60"
              >
                {authStore.isLoading ? "..." : tCommon("save")}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
