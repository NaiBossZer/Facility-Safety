// ============================================================
// DashboardPage.jsx — Main Overview Dashboard
// ============================================================
import React from "react";
import {
  ClipboardCheck,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  CircleDollarSign,
  TrendingUp,
  Building2,
  Activity,
  ChevronRight,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { SectionTitle } from "../components/ui/SectionTitle";
import { EmptyState } from "../components/ui/EmptyState";
import { fmt, thDate, cx } from "../lib/helpers";
import { STATUS_FLOW, PRIORITY } from "../config/workflow";
import { getColor, getIcon } from "../config/theme";

export function DashboardPage() {
  const {
    workOrders,
    inspections,
    setPage,
    openProcurement,
    cat,
    catalog,
  } = useAppData();

  const buildings = cat?.buildings || [];
  const categories = cat?.categories || [];
  const budgetTotal = catalog?.budget?.total || 2500000;

  const urgent = workOrders.filter((w) => w.priority === "urgent" && w.status < 6);
  const openWO = workOrders.filter((w) => w.status < 6);
  const doneWO = workOrders.filter((w) => w.status === 6);

  const spent = doneWO.reduce((s, w) => s + (Number(w.total) || 0), 0);
  const committed = openWO.reduce((s, w) => s + (Number(w.total) || 0), 0);
  const usedPct = Math.min(100, Math.round(((spent + committed) / (budgetTotal || 1)) * 100));

  const todayInsp = inspections.length;
  const failPoints = inspections.reduce(
    (s, i) => s + Object.values(i.results || {}).filter((r) => r === "fail").length,
    0
  );
  const warnPoints = inspections.reduce(
    (s, i) => s + Object.values(i.results || {}).filter((r) => r === "warn").length,
    0
  );

  // Pipeline distribution across status 0-6
  const pipeline = STATUS_FLOW.filter((s) => s.id > 0).map((s) => ({
    ...s,
    count: workOrders.filter((w) => w.status === s.id).length,
  }));
  const maxCount = Math.max(1, ...pipeline.map((p) => p.count));

  // By Building breakdown
  const byBuilding = buildings
    .map((b) => ({
      ...b,
      count: workOrders.filter((w) => (w.buildingId === b.id || w.building === b.id) && w.status < 6).length,
    }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const getBuildingName = (id) => buildings.find((b) => b.id === id)?.name || id || "-";

  return (
    <div className="space-y-6 animate-fade">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge className="border-white/25 bg-white/15 text-white">
              ระบบตรวจเช็คอาคารและความปลอดภัย
            </Badge>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">ภาพรวมระบบบำรุงรักษา</h1>
            <p className="mt-1 text-sm text-indigo-100">
              ผู้ใช้งาน: ฝ่ายอาคารสถานที่และความปลอดภัย
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage("inspection")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-95"
            >
              <ClipboardCheck className="h-4 w-4" /> เริ่มตรวจเช็ค
            </button>
            <button
              onClick={() => setPage("workorder")}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <Wrench className="h-4 w-4" /> งานซ่อม
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardCheck}
          tone="indigo"
          label="การตรวจประจำวันนี้"
          value={todayInsp}
          sub={`บันทึกแล้ว ${todayInsp} รอบตรวจ · ${buildings.length} อาคาร`}
          footer={
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> ครอบคลุม {categories.length} หมวดการตรวจ
            </div>
          }
        />
        <StatCard
          icon={ShieldAlert}
          tone="red"
          label="จุดที่ไม่ผ่านเกณฑ์"
          value={failPoints}
          sub={`เฝ้าระวังเพิ่มเติมอีก ${warnPoints} จุด`}
          footer={
            <button
              onClick={() => setPage("inspection")}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
            >
              ตรวจเพิ่มเติม <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
        />
        <StatCard
          icon={AlertTriangle}
          tone="amber"
          label="ใบแจ้งซ่อมเร่งด่วน"
          value={urgent.length}
          sub={`งานค้างทั้งหมด ${openWO.length} รายการ`}
          footer={
            <button
              onClick={() => setPage("workorder")}
              className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline"
            >
              เปิดดู Work Orders <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
        />
        <StatCard
          icon={CircleDollarSign}
          tone="emerald"
          label="สถานะงบประมาณ"
          value={`${usedPct}%`}
          sub={`ใช้ไป ${fmt(spent + committed)} / ${fmt(budgetTotal)} บาท`}
          footer={
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cx(
                    "h-full rounded-full transition-all duration-700",
                    usedPct > 80 ? "bg-red-500" : usedPct > 60 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                คงเหลือ {fmt(budgetTotal - spent - committed)} บาท
              </p>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left 2 Cols: Urgent alerts + Recent WOs */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <SectionTitle
              icon={AlertTriangle}
              title="แจ้งเตือนด่วนที่สุด (Urgent Priority)"
              desc="รายการที่ต้องดำเนินการทันทีตามมาตรฐานความปลอดภัย"
              right={
                <Badge className="border-red-200 bg-red-50 text-red-700" pulse>
                  {urgent.length} รายการ
                </Badge>
              }
            />
            {urgent.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="ไม่มีรายการเร่งด่วนค้างอยู่"
                desc="ทุกจุดตรวจอยู่ในเกณฑ์ปลอดภัย"
              />
            ) : (
              <div className="space-y-3">
                {urgent.map((w) => {
                  const bName = w.buildingName || getBuildingName(w.buildingId || w.building);
                  const statusObj = STATUS_FLOW.find((s) => s.id === w.status) || STATUS_FLOW[1];
                  const colorObj = getColor(statusObj.color);

                  return (
                    <div
                      key={w.id}
                      className="group relative overflow-hidden rounded-2xl border border-red-200 bg-white p-4 shadow-sm transition hover:shadow-lg hover:shadow-red-100"
                    >
                      <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-red-500 to-red-700" />
                      <div className="flex flex-col gap-3 pl-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 shrink-0 rounded-xl bg-red-50 p-2.5 ring-4 ring-red-50">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-red-50 text-red-700 border-red-200" pulse>
                                เร่งด่วน
                              </Badge>
                              <span className="font-mono text-[11px] text-slate-400">
                                {w.number || w.id}
                              </span>
                            </div>
                            <p className="mt-1 truncate font-bold text-slate-800">{w.title}</p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {bName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {thDate(w.createdAt || w.date)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                          <Badge className={cx(colorObj.soft, colorObj.softText, colorObj.border)}>
                            {statusObj.label}
                          </Badge>
                          <button
                            onClick={() => setPage("workorder")}
                            className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-900 active:scale-95"
                          >
                            จัดการ <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent work orders */}
          <div>
            <SectionTitle icon={Wrench} title="ใบแจ้งซ่อมล่าสุด" desc="อัปเดตสถานะล่าสุดในระบบ" />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:grid sm:grid-cols-12">
                <span className="col-span-3">เลขที่</span>
                <span className="col-span-4">รายการ</span>
                <span className="col-span-2">อาคาร</span>
                <span className="col-span-3 text-right">สถานะ</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[...workOrders]
                  .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                  .slice(0, 5)
                  .map((w) => {
                    const bName = w.buildingName || getBuildingName(w.buildingId || w.building);
                    const statusObj = STATUS_FLOW.find((s) => s.id === w.status) || STATUS_FLOW[1];
                    const colorObj = getColor(statusObj.color);
                    const prioObj = PRIORITY[w.priority] || PRIORITY.normal;
                    const prioColor = getColor(prioObj.color);

                    return (
                      <button
                        key={w.id}
                        onClick={() => setPage("workorder")}
                        className="grid w-full grid-cols-1 gap-1 px-4 py-3 text-left transition hover:bg-slate-50 sm:grid-cols-12 sm:items-center"
                      >
                        <span className="col-span-3 font-mono text-xs text-slate-500">
                          {w.number || w.id}
                        </span>
                        <span className="col-span-4 truncate text-sm font-semibold text-slate-700">
                          {w.title}
                        </span>
                        <span className="col-span-2 text-xs text-slate-500">{bName}</span>
                        <span className="col-span-3 flex justify-start gap-2 sm:justify-end">
                          <Badge className={cx(prioColor.soft, prioColor.softText, prioColor.border)}>
                            {prioObj.label}
                          </Badge>
                          <Badge className={cx(colorObj.soft, colorObj.softText, colorObj.border)}>
                            {statusObj.label}
                          </Badge>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Pipeline & Building Breakdown */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Activity} title="Pipeline งานซ่อม" desc="กระจายตามสถานะงาน" />
            <div className="space-y-2.5">
              {pipeline.map((p) => {
                const colorObj = getColor(p.color);
                return (
                  <button
                    key={p.id}
                    onClick={() => setPage("workorder")}
                    className="group w-full text-left"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-600">
                        <span className={cx("h-2 w-2 rounded-full", colorObj.dot)} />
                        {p.id}. {p.label}
                      </span>
                      <span className="font-bold text-slate-700">{p.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cx("h-full rounded-full transition-all duration-700 group-hover:opacity-80", colorObj.dot)}
                        style={{ width: `${(p.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Building2} title="งานค้างรายอาคาร" desc="อาคารที่มีงานซ่อมค้าง" />
            {byBuilding.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">ไม่มีงานค้าง</p>
            ) : (
              <div className="space-y-2">
                {byBuilding.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-lg bg-white p-1.5 shadow-sm">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{b.name}</p>
                        <p className="text-[11px] text-slate-400">{b.code || b.detail || "-"}</p>
                      </div>
                    </div>
                    <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
                      {b.count} งาน
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
