"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, FileText } from "lucide-react";
import { useTutorRequestsStore } from "@/stores/tutor-requests";
import { useDependentsStore } from "@/stores/dependents";
import { useSearchStore } from "@/stores/search";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { RequestTarget, StudyMode } from "@/types";

export default function RequestsPage() {
    const t = useTranslations("request");
    const tClient = useTranslations("client");
    const tCommon = useTranslations("common");
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        subjectId: "",
        stageId: "",
        requestTarget: "self" as RequestTarget,
        studyMode: "both" as StudyMode,
        parentChildId: "",
        description: "",
    });

    const tutorStore = useTutorRequestsStore();
    const { data: dependents, fetch: fetchDependents } = useDependentsStore();
    const { subjects, stages, fetchSubjects, fetchStages } = useSearchStore();

    useEffect(() => {
        tutorStore.fetch();
        fetchDependents();
        fetchSubjects();
        fetchStages();
    }, []);

    const handleCreateRequest = async () => {
        await tutorStore.createRequest({
            subjectId: form.subjectId,
            stageId: form.stageId,
            requestTarget: form.requestTarget,
            studyMode: form.studyMode,
            parentChildId: form.requestTarget === "dependent" ? form.parentChildId : undefined,
            description: form.description || undefined,
        });
        setShowCreate(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {tClient("myRequests")}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("tutorRequestsDesc")}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Plus className="h-4 w-4" />
                    {t("newRequest")}
                </button>
            </div>

            <ErrorBanner error={tutorStore.error} onRetry={tutorStore.fetch} />

            {tutorStore.isLoading ? (
                <PageSkeleton rows={4} />
            ) : !tutorStore.data || tutorStore.data.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-slate-200 p-8 text-center bg-white shadow-sm flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <FileText className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{t("noRequests")}</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="mt-1 rounded-xl bg-primary/10 text-primary px-4 py-2 text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                        {t("newRequest")}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {(tutorStore.data ?? []).map((r) => (
                        <TutorRequestCard
                            key={r.id}
                            request={r}
                            onClose={tutorStore.closeRequest}
                            onDelete={tutorStore.deleteRequest}
                        />
                    ))}
                </div>
            )}

            {/* Create tutor request dialog */}
            {showCreate && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 font-bold text-lg">{t("newTutorRequest")}</h2>
                        <div className="space-y-3">
                            <select
                                value={form.subjectId}
                                onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
                                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">{t("selectSubject")}</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nameAr}</option>
                                ))}
                            </select>
                            <select
                                value={form.stageId}
                                onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))}
                                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">{t("selectStage")}</option>
                                {stages.map((s) => (
                                    <option key={s.id} value={s.id}>{s.nameAr}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border">
                                {(["self", "dependent"] as const).map((target) => (
                                    <button
                                        key={target}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, requestTarget: target }))}
                                        className={`py-2.5 text-sm font-medium transition-colors ${form.requestTarget === target ? "bg-primary text-white" : "hover:bg-muted"}`}
                                    >
                                        {target === "self" ? t("self") : t("dependent")}
                                    </button>
                                ))}
                            </div>
                            {form.requestTarget === "dependent" && dependents && dependents.length > 0 && (
                                <select
                                    value={form.parentChildId}
                                    onChange={(e) => setForm((f) => ({ ...f, parentChildId: e.target.value }))}
                                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">{t("selectDependent")}</option>
                                    {dependents.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            )}
                            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border">
                                {(["online", "offline", "both"] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setForm((f) => ({ ...f, studyMode: mode }))}
                                        className={`py-2 text-xs font-medium transition-colors ${form.studyMode === mode ? "bg-primary text-white" : "hover:bg-muted"}`}
                                    >
                                        {mode === "online" ? t("online") : mode === "offline" ? t("offline") : t("both")}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder={t("descriptionPlaceholder")}
                                rows={2}
                                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={handleCreateRequest}
                                disabled={!form.subjectId || !form.stageId}
                                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors"
                            >
                                {t("submitRequest")}
                            </button>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 rounded-xl border border-border py-2.5 text-sm hover:bg-muted transition-colors"
                            >
                                {tCommon("cancel")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
