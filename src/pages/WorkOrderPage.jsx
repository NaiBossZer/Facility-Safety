// ============================================================
// WorkOrderPage.jsx — Work Order Management & 7-Stage Pipeline
// ============================================================
import React, { useState, useMemo } from "react";
import {
  Wrench,
  Search,
  CheckCircle2,
  Eye,
  ArrowRight,
  ShoppingCart,
  MapPin,
  User,
  Calendar,
  CircleDollarSign,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { Badge } from "../components/ui/Badge";
import { SectionTitle } from "../components/ui/SectionTitle";
import { EmptyState } from "../components/ui/EmptyState";
import { fmt, thDate, cx } from "../lib/helpers";
import { STATUS_FLOW, PRIORITY, PRIORITY_OPTIONS } from "../config/workflow";
import { getColor, getIcon } from "../config/theme";

function WorkOrderCard({ wo, onStatus, onProcure, highlight, buildings, categories }) {
  const [open, setOpen] = useState(false);

  const bName = wo.buildingName || buildings.find((b) => b.id === (wo.buildingId || wo.building))?.name || "-";
  const prio = PRIORITY[wo.priority] || PRIORITY.normal;
  const prioColor = getColor(prio.color);

  const statusObj = STATUS_FLOW.find((s) => s.id === wo.status) || STATUS_FLOW[1];
  const statusColor = getColor(statusObj.color);
  const StatusIcon = getIcon(statusObj.icon || "Wrench");

  // Sum items: support both it.price and it.unitPrice
  const totalAmount = (wo.items || []).reduce(
    (sum, it) => sum + (Number(it.qty) || 1) * (Number(it.unitPrice ?? it.price) || 0),
    0
  );

  return (
    <div
      className={cx(
        "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg",
        highlight ? "border-indigo-400 ring-4 ring-indigo-100" : "border-slate-200"
      )}
    >
      <div className="flex gap-0">
        <span className={cx("w-1.5 shrink-0", prioColor.solid)} />
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          {/* Card Top Details */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className={cx("mt-0.5 shrink-0 rounded-xl p-2.5", prioColor.soft)}>
                <ShieldAlert className={cx("h-5 w-5", prioColor.text)} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cx(prioColor.soft, prioColor.softText, prioColor.border)}
                    pulse={wo.priority === "urgent"}
                  >
                    {prio.label}
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-400">
                    {wo.number || wo.id}
                  </span>
                  {wo.eoffice && (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      <BadgeCheck className="h-3 w-3" /> ส่ง E-OFFICE แล้ว
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 font-bold leading-snug text-slate-800">{wo.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {bName}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {wo.reporter || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {thDate(wo.createdAt || wo.date)}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <CircleDollarSign className="h-3 w-3" />
                    {fmt(totalAmount)} บาท
                  </span>
                </p>
              </div>
            </div>
            <Badge
              className={cx(
                statusColor.soft,
                statusColor.softText,
                statusColor.border,
                "self-start px-3 py-1.5"
              )}
            >
              <StatusIcon className="h-3.5 w-3.5 mr-1" />
              {statusObj.id}. {statusObj.label}
            </Badge>
          </div>

          {/* 7-Step Status Stepper */}
          <div className="mt-4 -mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-[580px] items-center gap-1 px-1">
              {STATUS_FLOW.map((step, i) => {
                const isDone = wo.status >= step.id;
                const isCurrent = wo.status === step.id;
                const sc = getColor(step.color);

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => onStatus(wo.id, step.id)}
                      title={`เปลี่ยนสถานะเป็น: ${step.label}`}
                      className="group flex flex-1 flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <span
                        className={cx(
                          "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 group-hover:scale-110",
                          isCurrent
                            ? cx(sc.solid, "text-white ring-4 ring-slate-200 shadow-lg")
                            : isDone
                            ? cx(sc.solid, "text-white opacity-90")
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}
                      >
                        {isDone && !isCurrent ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                      </span>
                      <span
                        className={cx(
                          "text-center text-[10px] leading-tight transition",
                          isCurrent
                            ? "font-bold text-slate-800"
                            : isDone
                            ? "text-slate-600 font-medium"
                            : "text-slate-400"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                    {i < STATUS_FLOW.length - 1 && (
                      <span
                        className={cx(
                          "mb-5 h-0.5 w-4 shrink-0 rounded-full sm:w-6",
                          wo.status > step.id ? "bg-slate-400" : "bg-slate-200"
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-4">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
              {open ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
            </button>

            {wo.status < 6 && (
              <button
                onClick={() => onStatus(wo.id, wo.status + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                อัปเดตเป็น "{STATUS_FLOW.find((s) => s.id === wo.status + 1)?.label}"
              </button>
            )}

            {wo.status === 3 && (
              <button
                onClick={() => onProcure(wo.id)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-amber-100 transition hover:bg-amber-600 active:scale-95"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                ออกเอกสารจัดซื้อ/เบิกจ่าย (งพ.001)
              </button>
            )}

            {wo.status === 6 && (
              <Badge className="border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> ปิดงานเรียบร้อย
              </Badge>
            )}
          </div>

          {/* Expandable Details Section */}
          {open && (
            <div className="mt-4 animate-fade space-y-4 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  เหตุผลความจำเป็น
                </p>
                <p className="text-sm leading-relaxed text-slate-600">{wo.reason || "-"}</p>
              </div>

              {/* Items table */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  รายการวัสดุ/อะไหล่
                </p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold">รายการ</th>
                        <th className="px-3 py-2 text-center font-bold">จำนวน</th>
                        <th className="px-3 py-2 text-right font-bold">ราคา/หน่วย</th>
                        <th className="px-3 py-2 text-right font-bold">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(wo.items || []).map((it, i) => {
                        const price = Number(it.unitPrice ?? it.price) || 0;
                        const qty = Number(it.qty) || 1;
                        return (
                          <tr key={i}>
                            <td className="px-3 py-2 text-slate-700">{it.name}</td>
                            <td className="px-3 py-2 text-center text-slate-600">
                              {qty} {it.unit || "รายการ"}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">{fmt(price)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-slate-800">
                              {fmt(qty * price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-bold text-slate-600">
                          รวมประมาณการ
                        </td>
                        <td className="px-3 py-2 text-right font-extrabold text-indigo-700">
                          {fmt(totalAmount)} บาท
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Findings */}
              {wo.findings && wo.findings.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    รายการข้อบกพร่องที่ตรวจพบ ({wo.findings.length} รายการ)
                  </p>
                  <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3">
                    {wo.findings.map((f, i) => (
                      <div key={i} className="flex items-start justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-700">{f.label}</p>
                          <p className="text-[11px] text-slate-400">หมวด: {f.categoryName} {f.standard ? `· เกณฑ์: ${f.standard}` : ""}</p>
                        </div>
                        <Badge className={f.result === "fail" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                          {f.result === "fail" ? "ชำรุด" : "เฝ้าระวัง"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {wo.photos && wo.photos.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    รูปถ่ายหลักฐานหน้างาน ({wo.photos.length} รูป)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {wo.photos.map((p, i) => (
                      <div key={p.id || i} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                        {p.url ? (
                          <img
                            src={p.url}
                            alt={p.name}
                            className="h-20 w-20 rounded-lg object-cover cursor-pointer hover:opacity-90 transition"
                            onClick={() => {
                              const w = window.open("");
                              if (w) w.document.write(`<img src="${p.url}" style="max-width:100%" />`);
                            }}
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                            {p.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History / Log */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  ประวัติการดำเนินการ
                </p>
                <div className="space-y-1.5">
                  {(wo.history || wo.log || []).map((l, i) => {
                    const stId = l.status ?? l.s;
                    const stepObj = STATUS_FLOW.find((s) => s.id === stId) || STATUS_FLOW[0];
                    const sc = getColor(stepObj.color);

                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className={cx("h-2 w-2 rounded-full", sc.dot)} />
                        <span className="font-semibold">{stepObj.label}</span>
                        <span className="text-slate-400">— {thDate(l.at || l.date)}</span>
                        {l.note && <span className="text-slate-500">({l.note})</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkOrderPage() {
  const {
    workOrders,
    updateWorkOrderStatus,
    openProcurement,
    toast,
    cat,
  } = useAppData();

  const [filter, setFilter] = useState(-1); // -1 = All
  const [prio, setPrio] = useState("all");
  const [q, setQ] = useState("");

  const buildings = cat?.buildings || [];
  const categories = cat?.categories || [];

  const list = useMemo(() => {
    return workOrders
      .filter((w) => (filter === -1 ? true : w.status === filter))
      .filter((w) => (prio === "all" ? true : w.priority === prio))
      .filter((w) => {
        if (!q.trim()) return true;
        const target = `${w.title || ""} ${w.number || w.id || ""} ${w.reporter || ""}`.toLowerCase();
        return target.includes(q.toLowerCase());
      })
      .sort((a, b) => {
        const rankA = PRIORITY[a.priority]?.weight ?? 0;
        const rankB = PRIORITY[b.priority]?.weight ?? 0;
        return rankB - rankA || a.status - b.status;
      });
  }, [workOrders, filter, prio, q]);

  const changeStatus = (id, nextStatus) => {
    if (nextStatus < 0 || nextStatus > 6) return;
    updateWorkOrderStatus(id, nextStatus, { note: "อัปเดตผ่าน WorkOrder Page" });
    const sObj = STATUS_FLOW.find((s) => s.id === nextStatus);
    toast.success(`อัปเดตสถานะเป็น "${sObj?.label}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-5 animate-fade">
      {/* Search & Filter Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          icon={Wrench}
          title="บริหารงานซ่อมบำรุง (Work Orders)"
          desc="ติดตามและอัปเดตสถานะงานตาม Pipeline 7 ลำดับ"
          right={
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              ทั้งหมด {workOrders.length} รายการ
            </Badge>
          }
        />

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเลขที่ใบแจ้งซ่อม / รายการ / อาคาร / ผู้แจ้ง..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </div>

        {/* Status filters */}
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">กรองตามสถานะ</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(-1)}
            className={cx(
              "rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95",
              filter === -1
                ? "border-slate-800 bg-slate-800 text-white shadow-md"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            ทั้งหมด ({workOrders.length})
          </button>
          {STATUS_FLOW.map((s) => {
            const count = workOrders.filter((w) => w.status === s.id).length;
            const on = filter === s.id;
            const colorObj = getColor(s.color);

            return (
              <button
                key={s.id}
                onClick={() => setFilter(on ? -1 : s.id)}
                className={cx(
                  "flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95",
                  on
                    ? "border-slate-800 bg-slate-800 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span className={cx("h-2 w-2 rounded-full", colorObj.dot)} />
                {s.id}. {s.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Priority filters */}
        <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
          กรองตามความเร่งด่วน
        </p>
        <div className="flex flex-wrap gap-2">
          {[{ key: "all", label: "ทุกระดับ" }, ...PRIORITY_OPTIONS].map((o) => (
            <button
              key={o.key}
              onClick={() => setPrio(o.key)}
              className={cx(
                "rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition active:scale-95",
                prio === o.key
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* List / Empty State */}
      {list.length === 0 ? (
        <EmptyState
          icon={Search}
          title="ไม่พบใบแจ้งซ่อมตามเงื่อนไข"
          desc="ลองปรับตัวกรองสถานะ ความเร่งด่วน หรือคำค้นหาใหม่อีกครั้ง"
        />
      ) : (
        <div className="space-y-4">
          {list.map((w) => (
            <WorkOrderCard
              key={w.id}
              wo={w}
              onStatus={changeStatus}
              onProcure={openProcurement}
              buildings={buildings}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkOrderPage;
