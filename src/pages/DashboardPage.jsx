// ============================================================
// DashboardPage.jsx — Main Overview Dashboard
// ============================================================
import React, { useMemo } from "react";
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
  Fuel,
  Car,
  ShoppingCart,
  Database,
  Layers,
  Sparkles,
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
    fuelMowerLogs,
    fuelVehicles,
    fuelVehicleTrips,
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

  // Fuel and Fleet Metrics
  const mowerBalance = useMemo(() => {
    if (!fuelMowerLogs || fuelMowerLogs.length === 0) return 95.0;
    return fuelMowerLogs[fuelMowerLogs.length - 1].balanceLiters;
  }, [fuelMowerLogs]);

  const mowerPct = Math.min(100, Math.round((mowerBalance / 200) * 100));

  const vehicleDistance = useMemo(() => {
    if (!fuelVehicleTrips || fuelVehicleTrips.length === 0) return 505;
    return fuelVehicleTrips.reduce((s, t) => s + (Number(t.distanceKm) || 0), 0);
  }, [fuelVehicleTrips]);

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
      {/* Hero Banner — Mahidol Lampang Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123B63] via-[#0e2b42] to-slate-900 p-6 text-white shadow-xl border border-white/10 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#D6A84F]/10 blur-3xl" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-[#1677A8]/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[#D6A84F]/40 bg-[#D6A84F]/20 text-[#D6A84F] font-bold">
                งานพันธกิจเพื่อสังคม · ลำปาง
              </Badge>
              <span className="text-xs text-blue-200 font-medium">
                คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl text-white tracking-tight">
              ภาพรวมระบบบริหารจัดการอาคารและสาธารณูปโภค
            </h1>
            <p className="mt-1 text-sm text-blue-100/90">
              Unified Facility, Safety, Maintenance, Procurement &amp; Fuel Platform
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPage("inspection")}
              className="flex items-center gap-2 rounded-xl bg-[#D6A84F] px-4 py-2.5 text-sm font-black text-[#123B63] shadow-lg transition hover:bg-[#c49842] active:scale-95"
            >
              <ClipboardCheck className="h-4 w-4 text-[#123B63]" /> เริ่มตรวจเช็ค
            </button>
            <button
              onClick={() => setPage("workorder")}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <Wrench className="h-4 w-4" /> งานซ่อม (CM/PM)
            </button>
            <button
              onClick={() => setPage("fuel")}
              className="flex items-center gap-2 rounded-xl bg-[#1677A8] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#146690] active:scale-95"
            >
              <Fuel className="h-4 w-4 text-white" /> เชื้อเพลิง &amp; รถยนต์
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Operational Pillars (KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Pillar 1: Inspection & Safety */}
        <StatCard
          icon={ClipboardCheck}
          tone="indigo"
          label="1. ตรวจเช็ค &amp; ความปลอดภัย"
          value={failPoints > 0 ? `${failPoints} จุดชำรุด` : `${todayInsp} รอบตรวจ`}
          sub={
            failPoints > 0
              ? `ตรวจแล้ว ${todayInsp} รอบ · เฝ้าระวัง ${warnPoints} จุด · ${buildings.length} อาคาร`
              : `ตรวจแล้ว ${todayInsp} รอบ · ปลอดภัยทุกจุด · ${buildings.length} อาคาร`
          }
          footer={
            <button
              onClick={() => setPage("inspection")}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              เปิดระบบตรวจเช็ค &amp; ข้อบกพร่อง <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        {/* Pillar 2: Work Orders & Maintenance */}
        <StatCard
          icon={Wrench}
          tone="amber"
          label="2. งานซ่อมบำรุงที่เปิดอยู่"
          value={`${openWO.length} งาน`}
          sub={`เร่งด่วน ${urgent.length} งาน · ดำเนินการแล้วเสร็จ ${doneWO.length} งาน`}
          footer={
            <button
              onClick={() => setPage("workorder")}
              className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline"
            >
              ติดตาม Work Orders (7 ขั้นตอน) <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        {/* Pillar 3: Procurement & Budget */}
        <StatCard
          icon={CircleDollarSign}
          tone="emerald"
          label="3. งบประมาณจัดซื้อ/ซ่อมบำรุง"
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
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  คงเหลือ {fmt(budgetTotal - spent - committed)} บาท
                </span>
                <button
                  onClick={() => setPage("procurement")}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  จัดหา งพ.001 <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          }
        />

        {/* Pillar 4: Utilities & Fuel Management */}
        <StatCard
          icon={Fuel}
          tone="sky"
          label="4. คลังเชื้อเพลิง &amp; ยานพาหนะ"
          value={`${mowerBalance.toFixed(1)} ลิตร`}
          sub={`ถังกลางเครื่องตัดหญ้า (${mowerPct}%) · 6ฝ-0559 สะสม ${fmt(vehicleDistance)} กม.`}
          footer={
            <button
              onClick={() => setPage("fuel")}
              className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
            >
              เปิดโมดูลบริหารเชื้อเพลิง &amp; แผน <ChevronRight className="h-3.5 w-3.5" />
            </button>
          }
        />
      </div>

      {/* Unified 5-Pillar Navigation Matrix (Quick Access Hub) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              ศูนย์กลาง 5 ภารกิจหลัก (Unified Facility &amp; Safety Hub)
            </h3>
            <p className="text-xs text-slate-400">
              เข้าถึงโมดูลการทำงานหลักของคณะสิ่งแวดล้อมและทรัพยากรศาสตร์ (ลำปาง)
            </p>
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
            ระบบบริหารจัดการแบบบูรณาการ
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Pillar 1 */}
          <button
            onClick={() => setPage("inspection")}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-xl bg-indigo-100 p-2 text-indigo-700 group-hover:scale-110 transition">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">งานที่ 1</span>
              </div>
              <h4 className="text-xs font-black text-slate-800 group-hover:text-indigo-700">
                1. ตรวจสอบ &amp; ความปลอดภัย
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                เช็คลิสต์ตรวจอาคาร พบข้อบกพร่องเปิดใบสั่งซ่อมทันที
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              เปิดตรวจเช็ค <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          {/* Pillar 2 */}
          <button
            onClick={() => setPage("workorder")}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition-all hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-xl bg-amber-100 p-2 text-amber-700 group-hover:scale-110 transition">
                  <Wrench className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">งานที่ 2</span>
              </div>
              <h4 className="text-xs font-black text-slate-800 group-hover:text-amber-700">
                2. จัดการงานซ่อมบำรุง
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                CM/PM 7 ขั้นตอน มอบหมายช่าง คำนวณค่าแรง/บริการ
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600">
              ดู Work Orders <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          {/* Pillar 3 */}
          <button
            onClick={() => setPage("procurement")}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700 group-hover:scale-110 transition">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">งานที่ 3</span>
              </div>
              <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-700">
                3. จัดหา &amp; คุมงบประมาณ
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                ขออนุมัติแบบ งพ.001 / งพ.003 และตัดงบประมาณ
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              จัดซื้อ/พัสดุ <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          {/* Pillar 4 */}
          <button
            onClick={() => setPage("fuel")}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition-all hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-xl bg-sky-100 p-2 text-sky-700 group-hover:scale-110 transition">
                  <Fuel className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">งานที่ 4</span>
              </div>
              <h4 className="text-xs font-black text-slate-800 group-hover:text-sky-700">
                4. บริหารเชื้อเพลิง &amp; รถ
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                คลังถังกลาง 200L, ทริป 6ฝ-0559, ประเมินล่วงหน้า
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sky-600">
              บริหารน้ำมัน <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          {/* Pillar 5 */}
          <button
            onClick={() => setPage("admin")}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left transition-all hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-xl bg-purple-100 p-2 text-purple-700 group-hover:scale-110 transition">
                  <Database className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold text-slate-400">งานที่ 5</span>
              </div>
              <h4 className="text-xs font-black text-slate-800 group-hover:text-purple-700">
                5. ข้อมูลหลัก &amp; Audit Trail
              </h4>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                ทะเบียนครุภัณฑ์, ยานพาหนะ, ประวัติกิจกรรมย้อนหลัง
              </p>
            </div>
            <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-600">
              ศูนย์ข้อมูลหลัก <ChevronRight className="h-3 w-3" />
            </span>
          </button>
        </div>
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
