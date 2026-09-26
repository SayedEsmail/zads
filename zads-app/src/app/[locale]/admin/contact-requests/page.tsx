"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import api from "@/lib/api";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminStore } from "@/stores/admin";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminContactRequest } from "@/types";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  GraduationCap, 
  Smartphone,
  Calendar
} from "lucide-react";

type ContactStats = {
  total: number;
  byStatus: Record<string, number>;
};

export default function AdminContactRequestsPage() {
  const t = useTranslations("admin");
  const tContact = useTranslations("contact");
  const locale = useLocale();

  const [stats, setStats] = useState<ContactStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdminContactRequest | null>(null);

  const {
    contactRequests,
    totalContactRequests,
    contactRequestsPage,
    contactRequestsTotalPages,
    isLoading,
    error,
    fetchContactRequests,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [initiatedByFilter, setInitiatedByFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    api
      .get<{ data: ContactStats }>("/admin/stats/contacts")
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const loadRequests = useCallback(
    (page = currentPage, query = search, status = statusFilter, initiatedBy = initiatedByFilter) => {
      fetchContactRequests({
        page,
        limit: 20,
        search: query || undefined,
        status: status || undefined,
        initiatedBy: initiatedBy || undefined,
      });
    },
    [fetchContactRequests, currentPage, search, statusFilter, initiatedByFilter]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRequests(currentPage, search, statusFilter, initiatedByFilter);
  }, [currentPage, statusFilter, initiatedByFilter, loadRequests]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    loadRequests(1, val, statusFilter, initiatedByFilter);
  };

  const columns = useMemo<ColumnDef<AdminContactRequest>[]>(
    () => [
      {
        id: "client",
        header: locale === "ar" ? "العميل / الطالب" : "Client / Student",
        cell: ({ row }) => (
          <div className="space-y-0.5 text-start">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{row.original.parent?.user?.name || "-"}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 ltr flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.original.parent?.user?.phone || "-"}</span>
            </div>
          </div>
        ),
      },
      {
        id: "teacher",
        header: locale === "ar" ? "المعلّم" : "Teacher",
        cell: ({ row }) => (
          <div className="space-y-0.5 text-start">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{row.original.teacher?.user?.name || "-"}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 ltr flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.original.teacher?.user?.phone || "-"}</span>
            </div>
          </div>
        ),
      },
      {
        id: "subject",
        header: locale === "ar" ? "المادة والمرحلة" : "Subject & Stage",
        cell: ({ row }) => (
          <div className="text-start space-y-0.5">
            <div className="font-semibold text-xs text-slate-800">
              {row.original.subject?.nameAr || "-"}
            </div>
            <div className="text-[11px] text-slate-500">
              {row.original.stage?.nameAr || "-"}
            </div>
          </div>
        ),
      },
      {
        id: "mode",
        header: locale === "ar" ? "الوضع المفضل" : "Mode & Preference",
        cell: ({ row }) => {
          const mode = row.original.studyMode;
          const place = row.original.teachingPlace;
          return (
            <div className="text-start space-y-0.5">
              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {mode === "online"
                  ? locale === "ar" ? "أونلاين" : "Online"
                  : mode === "offline"
                  ? locale === "ar" ? "حضوري" : "In-Person"
                  : locale === "ar" ? "غير محدد" : "Not specified"}
              </span>
              {place && (
                <div className="text-[10px] text-slate-500">
                  {place === "at_student"
                    ? locale === "ar" ? "عند الطالب" : "At student"
                    : place === "at_teacher"
                    ? locale === "ar" ? "عند المعلّم" : "At teacher"
                    : locale === "ar" ? "بالاتفاق" : "By agreement"}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: locale === "ar" ? "الحالة" : "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <div className="flex justify-start">
              <span
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold border ${
                  status === "accepted"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : status === "rejected"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                {status === "accepted" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : status === "rejected" ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span>
                  {status === "accepted"
                    ? locale === "ar" ? "مقبول" : "Accepted"
                    : status === "rejected"
                    ? locale === "ar" ? "مرفوض" : "Rejected"
                    : locale === "ar" ? "معلق" : "Pending"}
                </span>
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: locale === "ar" ? "تاريخ الطلب" : "Created Date",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          const date = new Date(val);
          return (
            <div className="text-start text-xs text-slate-500">
              {date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: locale === "ar" ? "التفاصيل" : "Details",
        cell: ({ row }) => (
          <div className="flex justify-start">
            <button
              onClick={() => setSelectedRequest(row.original)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{locale === "ar" ? "عرض" : "View"}</span>
            </button>
          </div>
        ),
      },
    ],
    [locale]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-start">
      {/* Header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span>{t("contactRequests")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "ar"
              ? "متابعة طلبات التواصل بين المتعلمين والمعلمين والتحقق من سير المعاملات بدون وساطة مالية."
              : "Monitor contact requests between learners and teachers and verify coordination flow."}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{locale === "ar" ? "كل الحالات" : "All Statuses"}</option>
            <option value="pending">{locale === "ar" ? "معلق" : "Pending"}</option>
            <option value="accepted">{locale === "ar" ? "مقبول" : "Accepted"}</option>
            <option value="rejected">{locale === "ar" ? "مرفوض" : "Rejected"}</option>
          </select>

          <select
            value={initiatedByFilter}
            onChange={(e) => {
              setInitiatedByFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{locale === "ar" ? "كل المبادرات" : "All Initiators"}</option>
            <option value="parent">{locale === "ar" ? "طلب من عميل" : "From Client"}</option>
            <option value="teacher">{locale === "ar" ? "عرض من معلّم" : "From Teacher"}</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-slate-500">{locale === "ar" ? "إجمالي الطلبات" : "Total Requests"}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.total ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
          <p className="text-xs font-medium text-amber-700">{locale === "ar" ? "في انتظار الرد" : "Pending"}</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{stats?.byStatus?.pending ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="text-xs font-medium text-emerald-700">{locale === "ar" ? "تم قبول التواصل" : "Accepted"}</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">{stats?.byStatus?.accepted ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
          <p className="text-xs font-medium text-rose-700">{locale === "ar" ? "مرفوض" : "Rejected"}</p>
          <p className="mt-1 text-2xl font-black text-rose-900">{stats?.byStatus?.rejected ?? 0}</p>
        </div>
      </div>

      <ErrorBanner error={error} onRetry={() => loadRequests(currentPage, search, statusFilter, initiatedByFilter)} />

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <DataTable
          data={contactRequests}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder={locale === "ar" ? "ابحث بالاسم أو الهاتف..." : "Search by name or phone..."}
          manualPagination={true}
          page={contactRequestsPage}
          totalPages={contactRequestsTotalPages}
          totalRows={totalContactRequests}
          searchValue={search}
          onSearchChange={handleSearchChange}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-start space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {locale === "ar" ? "تفاصيل طلب التواصل" : "Contact Request Details"}
              </h2>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  selectedRequest.status === "accepted"
                    ? "bg-emerald-50 text-emerald-700"
                    : selectedRequest.status === "rejected"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {selectedRequest.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 font-medium">{locale === "ar" ? "العميل:" : "Client:"}</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRequest.parent?.user?.name}</p>
                <p className="text-slate-600 ltr">{selectedRequest.parent?.user?.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{locale === "ar" ? "المعلّم:" : "Teacher:"}</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRequest.teacher?.user?.name}</p>
                <p className="text-slate-600 ltr">{selectedRequest.teacher?.user?.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{locale === "ar" ? "المادة:" : "Subject:"}</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRequest.subject?.nameAr || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{locale === "ar" ? "المرحلة:" : "Stage:"}</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedRequest.stage?.nameAr || "-"}</p>
              </div>
            </div>

            {selectedRequest.preferredTime && (
              <div className="rounded-xl border border-slate-100 p-3 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {locale === "ar" ? "التوقيت المفضل للمتعلم:" : "Learner's Preferred Time:"}
                </span>
                <p className="text-slate-600">{selectedRequest.preferredTime}</p>
              </div>
            )}

            {selectedRequest.message && (
              <div className="rounded-xl border border-slate-100 p-3 text-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  {locale === "ar" ? "رسالة الطلب:" : "Request Message:"}
                </span>
                <p className="text-slate-600 whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>
            )}

            {selectedRequest.replyMessage && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 text-xs">
                <span className="font-bold text-emerald-800 block mb-1">
                  {locale === "ar" ? "رد الطرف الآخر:" : "Reply Message:"}
                </span>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedRequest.replyMessage}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {locale === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
