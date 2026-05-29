"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useDependentsStore } from "@/stores/dependents";
import { useSearchStore } from "@/stores/search";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { Dependent } from "@/types";

export default function DependentsPage() {
  const t = useTranslations("client");
  const tCommon = useTranslations("common");
  const { data, isLoading, error, fetch, add, update, remove } = useDependentsStore();
  const { subjects, stages, fetchSubjects, fetchStages } = useSearchStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Dependent | null>(null);
  const [form, setForm] = useState({ name: "", stageId: "", subjectIds: [] as string[] });

  useEffect(() => {
    fetch();
    fetchSubjects();
    fetchStages();
  }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", stageId: "", subjectIds: [] }); setShowDialog(true); };
  const openEdit = (d: Dependent) => { setEditing(d); setForm({ name: d.name, stageId: d.stageId, subjectIds: d.subjects?.map(s => s.subject.id) ?? [] }); setShowDialog(true); };

  const handleSave = async () => {
    if (editing) {
      await update(editing.id, form);
    } else {
      await add(form);
    }
    setShowDialog(false);
  };

  if (isLoading && !data) return <PageSkeleton />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("dependents")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addDependent")}
        </button>
      </div>

      <ErrorBanner error={error} onRetry={fetch} />

      {!data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">{t("noDependentsYet")}</p>
          <button onClick={openAdd} className="mt-3 text-sm text-primary hover:underline">
            {t("addDependent")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((dep) => (
            <div key={dep.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{dep.name}</p>
                  <p className="text-sm text-muted-foreground">{dep.stage?.nameAr}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {dep.subjects?.map(({ subject }) => (
                      <span key={subject.id} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {subject.nameAr}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(dep)} className="text-muted-foreground hover:text-primary">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(dep.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-surface p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-semibold">{editing ? t("editDependent") : t("addDependent")}</h2>
            <div className="space-y-3">
              <input
                placeholder={t("dependentName")}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={form.stageId}
                onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="">{t("stage")}</option>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
              <div>
                <p className="mb-2 text-sm font-medium">{t("subjects")}</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        subjectIds: f.subjectIds.includes(s.id)
                          ? f.subjectIds.filter((id) => id !== s.id)
                          : [...f.subjectIds, s.id],
                      }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        form.subjectIds.includes(s.id) ? "bg-primary text-white" : "border border-border hover:bg-muted"
                      }`}
                    >
                      {s.nameAr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={handleSave} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
                {tCommon("save")}
              </button>
              <button onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm hover:bg-muted">
                {tCommon("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
