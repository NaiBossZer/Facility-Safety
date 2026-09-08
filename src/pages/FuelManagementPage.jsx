// ============================================================
// FuelManagementPage.jsx — โมดูลบริหารจัดการและประเมินการใช้เชื้อเพลิงล่วงหน้า
// คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล (งานพันธกิจเพื่อสังคม ลำปาง)
// ============================================================
import React, { useState, useMemo } from "react";
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  Gauge,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  FileSpreadsheet,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  Info,
  MapPin,
  Camera,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BarChart3,
  X,
  Upload,
} from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard";
import { cx, fmt, thDate } from "../lib/helpers";
import { MOWER_TANK_CONFIG } from "../data/fuelData";

export function FuelManagementPage() {
  const {
    fuelVehicles,
    fuelMowerLogs,
    fuelVehicleTrips,
    fuelRefuelLogs,
    fuelPlans,
    addMowerTransaction,
    addVehicleTrip,
    addRefuelLog,
    addFuelPlan,
    updateFuelPlanActual,
    resetFuelData,
  } = useAppData();

  // Active Tab state: 'dashboard' | 'fleet' | 'forecast' | 'reports'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState("2026-08");
  const [tripSearch, setTripSearch] = useState("");
  const [mowerFilterType, setMowerFilterType] = useState("all");

  // Modals state
  const [showAddMowerModal, setShowAddMowerModal] = useState(false);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showAddRefuelModal, setShowAddRefuelModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [varianceModalPlan, setVarianceModalPlan] = useState(null);

  // Active vehicle (6ฝ-0559)
  const vehicle = fuelVehicles[0] || {};

  // Calculations for Central Tank
  const currentMowerBalance = useMemo(() => {
    if (!fuelMowerLogs || fuelMowerLogs.length === 0) return 0;
    return fuelMowerLogs[fuelMowerLogs.length - 1].balanceLiters;
  }, [fuelMowerLogs]);

  const mowerTankPct = Math.round((currentMowerBalance / MOWER_TANK_CONFIG.capacityLiters) * 100);
  const isTankLow = currentMowerBalance <= MOWER_TANK_CONFIG.minSafetyStockLiters;

  // Total August Mower Out Liters & Hours
  const mowerWithdrawTotalLiters = useMemo(() => {
    return fuelMowerLogs
      .filter((m) => m.type === "withdraw")
      .reduce((sum, m) => sum + (Number(m.withdrawLiters) || 0), 0);
  }, [fuelMowerLogs]);

  const mowerTotalHoursEst = (mowerWithdrawTotalLiters / MOWER_TANK_CONFIG.avgConsumptionPerHr).toFixed(1);

  // Total Vehicle Distance (August)
  const vehicleTotalDistance = useMemo(() => {
    return fuelVehicleTrips.reduce((sum, t) => sum + (Number(t.distanceKm) || 0), 0);
  }, [fuelVehicleTrips]);

  const vehicleEstFuelUsed = (vehicleTotalDistance / (vehicle.avgConsumptionKmPerLiter || 11.5)).toFixed(1);

  // Total Fuel Expenses this month
  const mowerDepositCost = fuelMowerLogs.reduce((sum, m) => sum + (Number(m.totalAmount) || 0), 0);
  const vehicleRefuelCost = fuelRefuelLogs.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const totalCostThisMonth = mowerDepositCost + vehicleRefuelCost;

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return fuelVehicleTrips.filter((t) => {
      const q = tripSearch.toLowerCase();
      return (
        t.route.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q)
      );
    });
  }, [fuelVehicleTrips, tripSearch]);

  // Filtered mower transactions
  const filteredMowerLogs = useMemo(() => {
    return fuelMowerLogs.filter((m) => {
      if (mowerFilterType === "deposit") return m.type === "deposit";
      if (mowerFilterType === "withdraw") return m.type === "withdraw";
      return true;
    });
  }, [fuelMowerLogs, mowerFilterType]);

  // Handle Export to CSV
  const exportToCSV = (type) => {
    let csvContent = "\uFEFF"; // UTF-8 BOM for Thai language Excel support
    if (type === "trips") {
      csvContent += "ลำดับ,วันที่,การเดินทาง,เลขไมล์ไป,เลขไมล์กลับ,รวม(กม.),พนักงานขับรถ,วัตถุประสงค์,หมายเหตุ\n";
      fuelVehicleTrips.forEach((t, i) => {
        csvContent += `"${i + 1}","${t.date}","${t.route}","${t.startOdo}","${t.endOdo}","${t.distanceKm}","${t.driver}","${t.purpose}","${t.notes}"\n`;
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `บันทึกการใช้รถยนต์_6ฝ-0559_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "mower") {
      csvContent += "ลำดับ,วันที่,ประเภท,เติมเข้า(ลิตร),เบิกออก(ลิตร),คงเหลือ(ลิตร),ผู้เบิก/บันทึก,วัตถุประสงค์,เลขที่ใบเสร็จ,ยอดเงิน(บาท)\n";
      fuelMowerLogs.forEach((m, i) => {
        csvContent += `"${i + 1}","${m.date}","${m.type === "deposit" ? "เติมเข้า" : "เบิกออก"}","${m.depositLiters}","${m.withdrawLiters}","${m.balanceLiters}","${m.requestedBy}","${m.purpose}","${m.receiptNo}","${m.totalAmount}"\n`;
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `บัญชีคุมน้ำมันถังกลางเครื่องตัดหญ้า_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* ============================================================ */}
      {/* 1. Module Header Banner */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 right-28 h-48 w-48 rounded-full bg-amber-400/15 blur-2xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-blue-400/30 bg-blue-500/20 text-blue-200">
                <Fuel className="mr-1.5 h-3.5 w-3.5" />
                โมดูลบริหารจัดการและประเมินเชื้อเพลิงล่วงหน้า
              </Badge>
              <Badge className="border-emerald-400/30 bg-emerald-500/20 text-emerald-200">
                งานพันธกิจเพื่อสังคม (ลำปาง)
              </Badge>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl tracking-tight">
              Fuel Management & Forecasting Platform
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              ระบบบันทึก บัญชีคุมถังกลางเครื่องตัดหญ้า และประวัติการใช้รถยนต์ราชการ 6ฝ-0559
              พร้อมระบบคำนวณอัตราสิ้นเปลืองและพยากรณ์งบประมาณล่วงหน้า
            </p>
          </div>

          {/* Header Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddMowerModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-md transition hover:bg-amber-400 active:scale-95"
            >
              <Plus className="h-4 w-4" /> เบิก/เติมถังกลาง
            </button>
            <button
              onClick={() => setShowAddTripModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
            >
              <Plus className="h-4 w-4" /> บันทึกการใช้รถ
            </button>
            <button
              onClick={() => setShowAddPlanModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-amber-300" /> วางแผนล่วงหน้า
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { id: "dashboard", label: "ภาพรวมบริหาร & คลังถังกลาง", icon: BarChart3 },
            { id: "fleet", label: "บันทึกการใช้รถยนต์ & Fleet Card", icon: Car },
            { id: "forecast", label: "วางแผนและประเมินล่วงหน้า", icon: TrendingUp },
            { id: "reports", label: "รายงานราชการ & สรุปผล", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200",
                  active
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cx("h-4 w-4", active ? "text-blue-600" : "text-blue-200")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: EXECUTIVE DASHBOARD & STOCK                           */}
      {/* ============================================================ */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top 6 Executive KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Card 1: Mower Tank Stock */}
            <div className={cx(
              "rounded-2xl border p-4 shadow-sm transition relative overflow-hidden",
              isTankLow ? "border-red-300 bg-red-50/70" : "border-slate-200 bg-white"
            )}>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">ถังกลางเครื่องตัดหญ้า</span>
                <span className="rounded-lg bg-amber-100 p-1.5 text-amber-700">
                  <Fuel className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-800">
                {currentMowerBalance.toFixed(1)} <span className="text-xs font-normal text-slate-500">ลิตร</span>
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>ความจุ {mowerTankPct}%</span>
                  <span>เตือน &lt; 40L</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cx("h-full rounded-full transition-all", isTankLow ? "bg-red-500" : "bg-amber-500")}
                    style={{ width: `${Math.min(100, mowerTankPct)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Total Cost */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">ค่าใช้จ่ายเดือนนี้</span>
                <span className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
                  <TrendingDown className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-800">
                {fmt(totalCostThisMonth)} <span className="text-xs font-normal text-slate-500">บาท</span>
              </p>
              <p className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Fleet Card 0 บ. (ประหยัดงบ)
              </p>
            </div>

            {/* Card 3: Vehicle Total KM */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">ระยะทางวิ่งรวม 6ฝ-0559</span>
                <span className="rounded-lg bg-blue-100 p-1.5 text-blue-700">
                  <Car className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-800">
                {fmt(vehicleTotalDistance)} <span className="text-xs font-normal text-slate-500">กม.</span>
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                12 เที่ยววิ่ง | สิ้นเปลือง ~{vehicleEstFuelUsed} L
              </p>
            </div>

            {/* Card 4: Mower Work Hours */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">ชั่วโมงเครื่องตัดหญ้า</span>
                <span className="rounded-lg bg-indigo-100 p-1.5 text-indigo-700">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-800">
                {mowerTotalHoursEst} <span className="text-xs font-normal text-slate-500">ชม.</span>
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                เบิกใช้รวม {mowerWithdrawTotalLiters} ลิตร
              </p>
            </div>

            {/* Card 5: Forecast Accuracy */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Forecast Accuracy</span>
                <span className="rounded-lg bg-violet-100 p-1.5 text-violet-700">
                  <Gauge className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600">
                96.8%
              </p>
              <p className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> อยู่ในเกณฑ์ &lt;15%
              </p>
            </div>

            {/* Card 6: Action Required */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-semibold">งานที่ต้องติดตาม</span>
                <span className="rounded-lg bg-amber-200 p-1.5 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-amber-900">
                1 <span className="text-xs font-normal text-amber-700">รายการ</span>
              </p>
              <p className="mt-2 text-[11px] text-amber-800 truncate" title="รถใกล้เช็คระยะ 675,000 กม.">
                เช็คระยะอีก 1,790 กม.
              </p>
            </div>
          </div>

          {/* 3 Central Visual Cards (ถอดแบบภาพตัวอย่าง) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Visual 1: Fuel Consumption Proportion (Donut Simulation) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">สัดส่วนการใช้น้ำมัน</h2>
                  <p className="text-xs text-slate-400">เปรียบเทียบรถยนต์ vs เครื่องตัดหญ้า</p>
                </div>
                <Badge className="bg-slate-100 text-slate-600">ส.ค. 2569</Badge>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center">
                {/* Visual Donut representation */}
                <div className="relative flex h-44 w-44 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-slate-100"
                      strokeWidth="5.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Mowers Segment (60%) */}
                    <path
                      className="text-amber-500"
                      strokeDasharray="60, 100"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Vehicle Segment (40%) */}
                    <path
                      className="text-blue-600"
                      strokeDasharray="40, 100"
                      strokeDashoffset="-60"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-800">108.9</span>
                    <span className="text-[11px] text-slate-400">ลิตรรวม</span>
                  </div>
                </div>

                <div className="mt-6 w-full space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="font-bold text-amber-900">เครื่องตัดหญ้า (ถังกลาง)</span>
                    </div>
                    <span className="font-extrabold text-amber-900">65.0 ลิตร (59.7%)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-blue-50/70 p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-600" />
                      <span className="font-bold text-blue-900">รถยนต์ 6ฝ-0559 (Fleet Card)</span>
                    </div>
                    <span className="font-extrabold text-blue-900">43.9 ลิตร (40.3%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual 2: Real-Time Route & Fleet Activity Map (สไตล์ภาพตัวอย่าง) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">การติดตามเส้นทางและยานพาหนะ</h2>
                    <p className="text-xs text-slate-400">พื้นที่ปฏิบัติงาน อ.แม่เมาะ &amp; อ.สบปราบ จ.ลำปาง</p>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    พร้อมใช้งาน
                  </Badge>
                </div>

                {/* Styled Route Map Mockup */}
                <div className="mt-4 relative h-48 w-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-4 border border-slate-200 flex flex-col justify-between overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(#475569 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

                  {/* Route points */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" /> ผาลาด (ศูนย์แม่เมาะ)
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">50-54 กม.</div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600" /> สบปราบ (แปลงทดลอง)
                    </div>
                  </div>

                  {/* Connecting Route Line */}
                  <div className="relative z-10 my-auto flex items-center justify-center">
                    <div className="h-1 w-3/4 rounded-full bg-blue-500/30 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 p-1.5 text-white shadow-md">
                        <Car className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Vehicle Status Tag */}
                  <div className="relative z-10 flex items-center justify-between rounded-xl bg-slate-900/90 px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold">6ฝ-0559 กทม.</span>
                    </div>
                    <span className="text-[11px] text-slate-300">ไมล์ล่าสุด: 673,210 กม.</span>
                  </div>
                </div>
              </div>

              {/* Popular Routes List */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ผาลาด ↔ สบปราบ (ไป-กลับ)</span>
                  <span className="font-bold text-slate-800">8 เที่ยว (410 กม.)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ผาลาด ↔ เทศบาล (ไป-กลับ)</span>
                  <span className="font-bold text-slate-800">2 เที่ยว (59 กม.)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>สบปราบ ↔ งานบำรุงรักษา/บ้านพัก</span>
                  <span className="font-bold text-slate-800">2 เที่ยว (35 กม.)</span>
                </div>
              </div>
            </div>

            {/* Visual 3: AI Analytics & Recommendations (สไตล์กล่อง AI ในภาพตัวอย่าง) */}
            <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-700">
                  <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">AI Analytics &amp; Insights</h2>
                    <p className="text-[11px] text-slate-400">สรุปแนวโน้มและข้อเสนอแนะเชิงบริหาร</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-sm">
                    <p className="font-bold text-indigo-950">ทำไมค่าใช้จ่ายน้ำมันลดลงในเดือน ส.ค.?</p>
                    <ul className="mt-1.5 space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                      <li>รถ 6ฝ-0559 ใช้น้ำมันค้างถังเดิมเพียงพอ ไม่ต้องรูด Fleet Card (ตามบันทึก งพส.206/2569)</li>
                      <li>การจัดตารางเดินทางรวบยอด (ผาลาด - สบปราบ) ลดเที่ยววิ่งเปล่าได้ 18%</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-sm">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      คำแนะนำสำหรับเดือนถัดไป (ก.ย. 69)
                    </p>
                    <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">
                      คาดการณ์หน้าฝนหญ้าโตเร็วขึ้น ควรวางแผนจัดซื้อน้ำมันแก๊สโซฮอล์ 95 เติมถังกลางเพิ่ม 100 ลิตร
                      และเตรียมนำรถ 6ฝ-0559 ตรวจเช็คระยะที่ 675,000 กม.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Efficiency Index</span>
                <span className="font-extrabold text-emerald-600">ยอดเยี่ยม (A+)</span>
              </div>
            </div>
          </div>

          {/* End-to-End Workflow Process Ribbon (ถอดแบบจากภาพตัวอย่าง) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800">FLOW การทำงานหลัก (End-to-End Process)</h2>
                <p className="text-xs text-slate-400">วงจรการควบคุมงบประมาณและเบิกจ่ายเชื้อเพลิงหน่วยงาน</p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                8 ขั้นตอนมาตรฐาน
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { step: "1", title: "ยื่นแผนล่วงหน้า", desc: "ระบุ กม./ชม.", icon: Calendar },
                { step: "2", title: "เห็นชอบแผน", desc: "หัวหน้างาน", icon: ShieldCheck },
                { step: "3", title: "เบิกจ่ายเชื้อเพลิง", desc: "ถังกลาง/Fleet", icon: Fuel },
                { step: "4", title: "ปฏิบัติงานจริง", desc: "ตัดหญ้า/เดินทาง", icon: Car },
                { step: "5", title: "ถ่ายรูปไมล์/สลิป", desc: "แนบหลักฐาน", icon: Camera },
                { step: "6", title: "บันทึกผลจริง", desc: "Plan vs Actual", icon: Gauge },
                { step: "7", title: "ประเมิน Variance", desc: "แจ้งเตือน >15%", icon: AlertTriangle },
                { step: "8", title: "รายงาน งพส.", desc: "เสนอผู้บริหาร", icon: FileText },
              ].map((st, i) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.step}
                    className="relative flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:bg-indigo-50/50 hover:border-indigo-200"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-sm">
                      {st.step}
                    </span>
                    <Icon className="mt-2 h-4 w-4 text-indigo-600" />
                    <p className="mt-1 text-xs font-bold text-slate-800">{st.title}</p>
                    <p className="text-[10px] text-slate-400">{st.desc}</p>
                    {i < 7 && (
                      <ChevronRight className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mower Stock Movement Table (ตาราง In/Out/Balance แบบ Excel เดิม) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-amber-600" />
                  บัญชีคุมถังกลางน้ำมันเครื่องตัดหญ้า (Mower Fuel Inventory)
                </h2>
                <p className="text-xs text-slate-400">
                  อ้างอิงโครงสร้างเดิมจาก Excel บัญชีเบิกจ่าย คณะสิ่งแวดล้อมและทรัพยากรศาสตร์
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={mowerFilterType}
                  onChange={(e) => setMowerFilterType(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">ทั้งหมด ({fuelMowerLogs.length})</option>
                  <option value="deposit">เฉพาะเติมเข้า (Deposit)</option>
                  <option value="withdraw">เฉพาะเบิกออก (Withdraw)</option>
                </select>

                <button
                  onClick={() => exportToCSV("mower")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export Excel
                </button>

                <button
                  onClick={() => setShowAddMowerModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500"
                >
                  <Plus className="h-3.5 w-3.5" /> บันทึกเบิก/เติม
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-3.5 py-3 text-left">ลำดับ</th>
                    <th className="px-3.5 py-3 text-left">วัน/เดือน/ปี</th>
                    <th className="px-3.5 py-3 text-center">ประเภท</th>
                    <th className="px-3.5 py-3 text-right text-emerald-700">เติมเข้า (In)</th>
                    <th className="px-3.5 py-3 text-right text-red-700">เบิกออก (Out)</th>
                    <th className="px-3.5 py-3 text-right font-black text-slate-900 bg-amber-50/50">คงเหลือ (ลิตร)</th>
                    <th className="px-3.5 py-3 text-left">ผู้เบิก/ผู้บันทึก</th>
                    <th className="px-3.5 py-3 text-left">วัตถุประสงค์ / โซนตัดหญ้า</th>
                    <th className="px-3.5 py-3 text-center">สลิป/หลักฐาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredMowerLogs.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-3.5 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{tx.date}</td>
                      <td className="px-3.5 py-3 text-center">
                        {tx.type === "deposit" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            <ArrowDownLeft className="h-3 w-3" /> เติมเข้า
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
                            <ArrowUpRight className="h-3 w-3" /> เบิกออก
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right font-bold text-emerald-600">
                        {tx.depositLiters > 0 ? `+${tx.depositLiters.toFixed(1)}` : "-"}
                      </td>
                      <td className="px-3.5 py-3 text-right font-bold text-rose-600">
                        {tx.withdrawLiters > 0 ? `-${tx.withdrawLiters.toFixed(1)}` : "-"}
                      </td>
                      <td className="px-3.5 py-3 text-right font-black text-slate-900 bg-amber-50/30">
                        {tx.balanceLiters.toFixed(1)}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-700 whitespace-nowrap">{tx.requestedBy}</td>
                      <td className="px-3.5 py-3 text-slate-600 max-w-xs truncate" title={tx.purpose}>{tx.purpose}</td>
                      <td className="px-3.5 py-3 text-center">
                        {tx.receiptAttachment ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                            <Camera className="h-3.5 w-3.5" /> แนบแล้ว
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: FLEET MANAGEMENT & TRIP LOGS (6ฝ-0559)                */}
      {/* ============================================================ */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          {/* Vehicle Profile Card */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-600 p-3.5 text-white shadow-lg shadow-blue-200">
                  <Car className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{vehicle.plateNumber} {vehicle.province}</h2>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active ประจำการ</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {vehicle.brandModel} • สังกัด: {vehicle.assignedUnit} • พนักงานขับรถ: {vehicle.primaryDriver}
                  </p>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-slate-400 block">เลขไมล์ปัจจุบัน</span>
                  <span className="text-base font-black text-slate-800">{fmt(vehicle.currentOdometer)} กม.</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-slate-400 block">บัตรเติมน้ำมัน</span>
                  <span className="text-base font-black text-indigo-700">{vehicle.fuelType}</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-slate-400 block">อัตราสิ้นเปลืองเฉลี่ย</span>
                  <span className="text-base font-black text-emerald-600">{vehicle.avgConsumptionKmPerLiter} กม./ลิตร</span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Vehicle Trip Logs (ตามเอกสารแนบ งพส.206/2569) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  ตารางบันทึกการใช้รถยนต์ ทะเบียน {vehicle.plateNumber} {vehicle.province}
                </h2>
                <p className="text-xs text-slate-400">
                  อ้างอิงข้อมูลจริงประจำเดือน สิงหาคม 2569 งานพันธกิจเพื่อสังคม (ลำปาง) คณะสิ่งแวดล้อมฯ
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={tripSearch}
                    onChange={(e) => setTripSearch(e.target.value)}
                    placeholder="ค้นหาเส้นทาง หรือคนขับ…"
                    className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => exportToCSV("trips")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> Export Excel
                </button>

                <button
                  onClick={() => setShowAddTripModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" /> บันทึกการใช้รถ
                </button>
              </div>
            </div>

            {/* Official Trip Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-3.5 py-3 text-left">ที่</th>
                    <th className="px-3.5 py-3 text-left">วัน/เดือน/ปี</th>
                    <th className="px-3.5 py-3 text-left">การเดินทาง (ต้นทาง - ปลายทาง)</th>
                    <th className="px-3.5 py-3 text-right">เลขไมล์ไป</th>
                    <th className="px-3.5 py-3 text-right">เลขไมล์กลับ</th>
                    <th className="px-3.5 py-3 text-right font-black text-blue-900 bg-blue-50/50">รวม (กม.)</th>
                    <th className="px-3.5 py-3 text-left">พนักงานขับรถ</th>
                    <th className="px-3.5 py-3 text-left">วัตถุประสงค์ / หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTrips.map((tr, idx) => (
                    <tr key={tr.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-3.5 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">{tr.date}</td>
                      <td className="px-3.5 py-3 font-bold text-slate-800">{tr.route}</td>
                      <td className="px-3.5 py-3 text-right text-slate-600">{fmt(tr.startOdo)}</td>
                      <td className="px-3.5 py-3 text-right text-slate-600">{fmt(tr.endOdo)}</td>
                      <td className="px-3.5 py-3 text-right font-black text-blue-700 bg-blue-50/30">
                        {tr.distanceKm}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-700 whitespace-nowrap">{tr.driver}</td>
                      <td className="px-3.5 py-3 text-slate-600 max-w-xs truncate" title={tr.purpose || tr.notes}>
                        {tr.purpose || tr.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={5} className="px-3.5 py-3 text-right text-slate-700">
                      รวมระยะทางทั้งหมดประจำเดือน:
                    </td>
                    <td className="px-3.5 py-3 text-right font-black text-sm text-blue-900 bg-blue-100/50">
                      {fmt(vehicleTotalDistance)} กม.
                    </td>
                    <td colSpan={2} className="px-3.5 py-3 text-xs text-slate-500 font-normal">
                      (ไม่มีการเติมน้ำมันผ่าน Fleet Card ในเดือนนี้)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Refuel Logs Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-indigo-600" />
                  ประวัติการเติมน้ำมันผ่านบัตร Fleet Card
                </h2>
                <p className="text-xs text-slate-400">
                  บันทึกการใช้บัตร PTT Fleet Card พร้อมรูปถ่ายหน้าปัดและสลิปปั๊ม
                </p>
              </div>
              <button
                onClick={() => setShowAddRefuelModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" /> บันทึกการเติมน้ำมัน
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-3.5 py-3 text-left">วันที่</th>
                    <th className="px-3.5 py-3 text-right">เลขไมล์</th>
                    <th className="px-3.5 py-3 text-right">ปริมาณ (ลิตร)</th>
                    <th className="px-3.5 py-3 text-right">ราคา/ลิตร</th>
                    <th className="px-3.5 py-3 text-right font-bold text-slate-900">ยอดเงินรวม (บาท)</th>
                    <th className="px-3.5 py-3 text-left">สถานีบริการ</th>
                    <th className="px-3.5 py-3 text-left">ผู้เติม</th>
                    <th className="px-3.5 py-3 text-center">สลิป/หน้าปัด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {fuelRefuelLogs.map((rf) => (
                    <tr key={rf.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-3.5 py-3 font-semibold text-slate-800">{rf.date}</td>
                      <td className="px-3.5 py-3 text-right font-medium text-slate-600">{fmt(rf.odometerReading)}</td>
                      <td className="px-3.5 py-3 text-right font-bold text-indigo-700">{rf.volumeLiters.toFixed(1)}</td>
                      <td className="px-3.5 py-3 text-right text-slate-600">{rf.pricePerLiter.toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-right font-black text-slate-900">{fmt(rf.totalAmount)}</td>
                      <td className="px-3.5 py-3 text-slate-700">{rf.stationName}</td>
                      <td className="px-3.5 py-3 text-slate-700">{rf.driverName}</td>
                      <td className="px-3.5 py-3 text-center">
                        <span className="text-slate-400 text-[11px]">-</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: FUEL PLANNING & FORECASTING                           */}
      {/* ============================================================ */}
      {activeTab === "forecast" && (
        <div className="space-y-6">
          {/* Pre-Trip Estimator Form Card */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  เครื่องมือประเมินการใช้น้ำมันล่วงหน้า (Pre-Trip &amp; Task Estimator)
                </h2>
                <p className="text-xs text-slate-500">
                  คำนวณปริมาณน้ำมันและงบประมาณที่ต้องเตรียมล่วงหน้าตามอัลกอริทึม
                </p>
              </div>
              <button
                onClick={() => setShowAddPlanModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" /> สร้างแผนการใช้ใหม่
              </button>
            </div>

            {/* Formula Explanation Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <span className="font-extrabold text-blue-900 block text-sm">🚗 สูตรประเมินรถยนต์</span>
                <p className="mt-1 text-slate-600 font-mono text-[11px]">
                  น้ำมันประเมิน (ลิตร) = ระยะทางที่วางแผน (กม.) ÷ 11.5 (กม./ลิตร)
                </p>
                <p className="mt-1 text-[11px] text-blue-700">
                  * คิดคำนวณจากอัตราสิ้นเปลืองมาตรฐานของรถยนต์ 6ฝ-0559 กทม.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <span className="font-extrabold text-amber-900 block text-sm">🌿 สูตรประเมินเครื่องตัดหญ้า</span>
                <p className="mt-1 text-slate-600 font-mono text-[11px]">
                  น้ำมันประเมิน (ลิตร) = ชั่วโมงที่วางแผนตัด (ชม.) × 1.25 (ลิตร/ชม.)
                </p>
                <p className="mt-1 text-[11px] text-amber-700">
                  * อ้างอิงอัตราเฉลี่ยเครื่องตัดหญ้าสะพายบ่าของคณะสิ่งแวดล้อมฯ
                </p>
              </div>
            </div>
          </div>

          {/* Plan vs Actual Comparison Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-indigo-600" />
                  ตารางเปรียบเทียบผลงานจริงกับแผน (Plan vs Actual Tracking)
                </h2>
                <p className="text-xs text-slate-400">
                  ตรวจจับส่วนต่าง (Variance %) หากเกินเกณฑ์ 15% จะแจ้งเตือนและบังคับระบุเหตุผล
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="px-3.5 py-3 text-left">เดือน / รหัสแผน</th>
                    <th className="px-3.5 py-3 text-left">อุปกรณ์/ยานพาหนะ</th>
                    <th className="px-3.5 py-3 text-right">งานประเมิน</th>
                    <th className="px-3.5 py-3 text-right font-bold text-indigo-700">ประเมิน (ลิตร)</th>
                    <th className="px-3.5 py-3 text-right">งานจริง</th>
                    <th className="px-3.5 py-3 text-right font-bold text-slate-900">ใช้จริง (ลิตร)</th>
                    <th className="px-3.5 py-3 text-center">Variance %</th>
                    <th className="px-3.5 py-3 text-left">เหตุผล / ชี้แจง</th>
                    <th className="px-3.5 py-3 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {fuelPlans.map((pl) => {
                    const isOverLimit = pl.variancePercentage > 15;
                    return (
                      <tr
                        key={pl.id}
                        className={cx(
                          "transition",
                          isOverLimit ? "bg-red-50/70 hover:bg-red-100/60" : "hover:bg-slate-50/80"
                        )}
                      >
                        <td className="px-3.5 py-3 font-semibold text-slate-800 whitespace-nowrap">
                          {pl.month} <span className="text-[10px] text-slate-400">({pl.id})</span>
                        </td>
                        <td className="px-3.5 py-3 font-bold text-slate-800">{pl.assetName}</td>
                        <td className="px-3.5 py-3 text-right text-slate-600">
                          {pl.estimatedWorkUnit} {pl.unitLabel}
                        </td>
                        <td className="px-3.5 py-3 text-right font-bold text-indigo-700 bg-indigo-50/30">
                          {pl.estimatedLiters.toFixed(1)}
                        </td>
                        <td className="px-3.5 py-3 text-right text-slate-700 font-medium">
                          {pl.actualWorkUnit > 0 ? `${pl.actualWorkUnit} ${pl.unitLabel}` : "-"}
                        </td>
                        <td className="px-3.5 py-3 text-right font-bold text-slate-900 bg-slate-50/50">
                          {pl.actualLiters > 0 ? pl.actualLiters.toFixed(1) : "-"}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          {pl.status === "completed" ? (
                            <span
                              className={cx(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold",
                                isOverLimit
                                  ? "bg-red-200 text-red-900 animate-pulse"
                                  : pl.variancePercentage <= 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              )}
                            >
                              {pl.variancePercentage > 0 ? `+${pl.variancePercentage}%` : `${pl.variancePercentage}%`}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">อยู่ระหว่างแผน</span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-slate-600 max-w-xs truncate" title={pl.varianceReason}>
                          {pl.varianceReason ? (
                            <span className="text-slate-700">{pl.varianceReason}</span>
                          ) : isOverLimit ? (
                            <span className="font-bold text-red-600">⚠️ ต้องระบุเหตุผล</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-center whitespace-nowrap">
                          {pl.status === "active" ? (
                            <button
                              onClick={() => setVarianceModalPlan(pl)}
                              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-blue-500"
                            >
                              บันทึกผลจริง
                            </button>
                          ) : (
                            <button
                              onClick={() => setVarianceModalPlan(pl)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              แก้ไขผล
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: OFFICIAL REPORTS & EXPORT                             */}
      {/* ============================================================ */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                เอกสารบันทึกข้อความราชการ (Official Memorandum)
              </h2>
              <p className="text-xs text-slate-400">
                ถอดแบบหนังสือ งพส.206/2569 คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportToCSV("trips")}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> ส่งออก Excel บัญชี
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                <Printer className="h-4 w-4" /> พิมพ์บันทึกข้อความ (Print / PDF)
              </button>
            </div>
          </div>

          {/* Official Letter A4 Paper Mockup (ตามหนังสือราชการจริง) */}
          <div
            id="print-area"
            className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-md text-slate-900 font-serif leading-relaxed"
          >
            {/* Header with Mahidol Emblem */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full border border-blue-900/30 flex items-center justify-center p-2 mb-2">
                <ShieldCheck className="h-12 w-12 text-blue-900" />
              </div>
              <p className="text-xs font-bold text-slate-500 font-sans tracking-wide">มหาวิทยาลัยมหิดล</p>
              <h3 className="text-lg font-black tracking-tight text-slate-900 mt-0.5">
                งานพันธกิจเพื่อสังคม
              </h3>
              <p className="text-xs text-slate-700">คณะสิ่งแวดล้อมและทรัพยากรศาสตร์</p>
              <p className="text-xs text-slate-600">โทร. 054-296368</p>
            </div>

            {/* Document Meta Numbers */}
            <div className="mt-8 flex justify-between text-sm font-sans">
              <div>
                <span className="font-bold">ที่</span> งพส.206/2569
              </div>
              <div>
                <span className="font-bold">วันที่</span> 1 กันยายน 2569
              </div>
            </div>

            {/* Subject and Learn */}
            <div className="mt-4 space-y-2 text-sm font-sans border-b border-slate-200 pb-4">
              <div>
                <span className="font-bold">เรื่อง</span> สรุปการเติมน้ำมันเชื้อเพลิง ประจำเดือน สิงหาคม 2569
              </div>
              <div>
                <span className="font-bold">เรียน</span> รองคณบดีฝ่ายนโยบาย แผนและคลัง (ผ่าน รองคณบดีฝ่ายวิจัยและบริการวิชาการ)
              </div>
              <div>
                <span className="font-bold">สิ่งที่แนบมาด้วย</span> 1. ตารางบันทึกการใช้รถยนต์ ทะเบียน 6ฝ-0559 กรุงเทพมหานคร
              </div>
            </div>

            {/* Official Letter Body Text */}
            <div className="mt-6 space-y-4 text-sm font-sans indent-8 text-justify leading-loose">
              <p>
                ตามที่ งานพันธกิจเพื่อสังคม (ลำปาง) คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล
                ได้นำรถยนต์ราชการ ทะเบียน 6ฝ-0559 กรุงเทพมหานคร มาใช้ในการดำเนินงานและกิจกรรมต่าง ๆ
                ของงานพันธกิจเพื่อสังคม (ลำปาง) อย่างต่อเนื่อง นั้น
              </p>
              <p>
                ในการนี้ งานพันธกิจเพื่อสังคม (ลำปาง) ขอรายงานว่าใน ประจำเดือน สิงหาคม 2569
                รถยนต์ราชการคันดังกล่าว <span className="font-bold">ไม่มีการเติมน้ำมันเชื้อเพลิง ผ่านบัตรเติมน้ำมัน (PTT Fleet Card)</span> เนื่องจากน้ำมันเชื้อเพลิงคงเหลือในถังเพียงพอต่อการปฏิบัติงาน
                โดยมีระยะทางการปฏิบัติงานรวมทั้งสิ้น <span className="font-bold text-blue-900">{fmt(vehicleTotalDistance)} กิโลเมตร</span> (จำนวน 12 เที่ยววิ่ง) รายละเอียดดังตารางบันทึกการใช้รถยนต์ที่แนบมาพร้อมนี้
              </p>
              <p className="indent-0 text-center font-semibold pt-4">
                จึงเรียนมาเพื่อโปรดทราบ
              </p>
            </div>

            {/* Signature Area */}
            <div className="mt-14 flex justify-end font-sans text-sm">
              <div className="text-center space-y-1">
                <div className="h-10" />
                <p className="font-bold">(นายอภิวัฒน์ สุวรรณนัง)</p>
                <p className="text-xs text-slate-600">วิศวกร</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD MOWER TRANSACTION (เบิก/เติมถังกลาง)            */}
      {/* ============================================================ */}
      {showAddMowerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Fuel className="h-5 w-5 text-amber-600" />
                บันทึกการเบิก/เติมน้ำมันถังกลาง
              </h3>
              <button onClick={() => setShowAddMowerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const type = fd.get("type");
                const liters = Number(fd.get("liters")) || 0;
                addMowerTransaction({
                  date: fd.get("date"),
                  depositLiters: type === "deposit" ? liters : 0,
                  withdrawLiters: type === "withdraw" ? liters : 0,
                  requestedBy: fd.get("requestedBy"),
                  purpose: fd.get("purpose"),
                  receiptNo: fd.get("receiptNo") || "-",
                  totalAmount: Number(fd.get("totalAmount")) || 0,
                });
                setShowAddMowerModal(false);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">ประเภทรายการ</label>
                <select name="type" className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800">
                  <option value="withdraw">เบิกออกไปใช้งาน (ตัดหญ้า)</option>
                  <option value="deposit">เติมเข้าถังกลาง (จัดซื้อเติมสต็อก)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">วันที่</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ปริมาณ (ลิตร)</label>
                  <input
                    type="number"
                    name="liters"
                    step="0.1"
                    min="0.5"
                    required
                    placeholder="เช่น 15.0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ผู้เบิก / ผู้บันทึก</label>
                <input
                  type="text"
                  name="requestedBy"
                  required
                  placeholder="เช่น นายสุรชัย (คนงานสวน)"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">วัตถุประสงค์ / บริเวณที่ตัด</label>
                <input
                  type="text"
                  name="purpose"
                  required
                  placeholder="เช่น ตัดหญ้าแนวรั้วรอบแปลงสาธิต"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขที่ใบเสร็จ (ถ้ามี)</label>
                  <input
                    type="text"
                    name="receiptNo"
                    placeholder="INV-..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ยอดเงินรวม (บาท)</label>
                  <input
                    type="number"
                    name="totalAmount"
                    defaultValue="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMowerModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 py-2.5 font-bold text-white shadow-md hover:bg-amber-500"
                >
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADD VEHICLE TRIP (บันทึกการใช้รถ)                    */}
      {/* ============================================================ */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                บันทึกการเดินทาง รถยนต์ {vehicle.plateNumber}
              </h3>
              <button onClick={() => setShowAddTripModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                addVehicleTrip({
                  vehicleId: "veh-01",
                  date: fd.get("date"),
                  route: fd.get("route"),
                  startOdo: Number(fd.get("startOdo")),
                  endOdo: Number(fd.get("endOdo")),
                  driver: fd.get("driver"),
                  purpose: fd.get("purpose"),
                  notes: fd.get("notes"),
                });
                setShowAddTripModal(false);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">วันที่เดินทาง</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">การเดินทาง (ต้นทาง - ปลายทาง)</label>
                <input
                  type="text"
                  name="route"
                  required
                  placeholder="เช่น ผาลาด - สบปราบ"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขไมล์ไป</label>
                  <input
                    type="number"
                    name="startOdo"
                    defaultValue={vehicle.currentOdometer || 673210}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขไมล์กลับ</label>
                  <input
                    type="number"
                    name="endOdo"
                    defaultValue={(vehicle.currentOdometer || 673210) + 50}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">พนักงานขับรถ</label>
                <input
                  type="text"
                  name="driver"
                  defaultValue="จตุพร"
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">วัตถุประสงค์การเดินทาง</label>
                <input
                  type="text"
                  name="purpose"
                  placeholder="เช่น ติดตามงานแปลงสาธิตเกษตร"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-md hover:bg-blue-500"
                >
                  บันทึกการเดินทาง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: ADD REFUEL LOG (บันทึกการเติมน้ำมัน Fleet Card)     */}
      {/* ============================================================ */}
      {showAddRefuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Fuel className="h-5 w-5 text-indigo-600" />
                บันทึกการเติมน้ำมัน (PTT Fleet Card)
              </h3>
              <button onClick={() => setShowAddRefuelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                addRefuelLog({
                  vehicleId: "veh-01",
                  date: fd.get("date"),
                  odometerReading: Number(fd.get("odometerReading")),
                  volumeLiters: Number(fd.get("volumeLiters")),
                  pricePerLiter: Number(fd.get("pricePerLiter")),
                  totalAmount: Number(fd.get("totalAmount")),
                  driverName: fd.get("driverName"),
                  stationName: fd.get("stationName"),
                  receiptNo: fd.get("receiptNo"),
                  notes: fd.get("notes"),
                });
                setShowAddRefuelModal(false);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">วันที่เติม</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขไมล์ขณะเติม</label>
                  <input
                    type="number"
                    name="odometerReading"
                    defaultValue={vehicle.currentOdometer}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ปริมาณ (ลิตร)</label>
                  <input
                    type="number"
                    name="volumeLiters"
                    step="0.1"
                    required
                    placeholder="เช่น 50.0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ยอดเงิน (บาท)</label>
                  <input
                    type="number"
                    name="totalAmount"
                    step="0.5"
                    required
                    placeholder="เช่น 1675.0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">สถานีบริการ (ปั๊ม)</label>
                  <input
                    type="text"
                    name="stationName"
                    defaultValue="ปตท. สบปราบ ลำปาง"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ผู้เติม</label>
                  <input
                    type="text"
                    name="driverName"
                    defaultValue="จตุพร"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRefuelModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  บันทึกการเติม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: ADD FUEL FORECAST PLAN (วางแผนล่วงหน้า)              */}
      {/* ============================================================ */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                วางแผนการใช้น้ำมันล่วงหน้า
              </h3>
              <button onClick={() => setShowAddPlanModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const targetType = fd.get("targetType");
                const workUnit = Number(fd.get("workUnit")) || 0;
                const avgRate = targetType === "vehicle" ? 11.5 : 1.25;
                const estLiters =
                  targetType === "vehicle"
                    ? Number((workUnit / 11.5).toFixed(1))
                    : Number((workUnit * 1.25).toFixed(1));
                const estBudget =
                  targetType === "vehicle"
                    ? Math.round(estLiters * 33.5)
                    : Math.round(estLiters * 38.5);

                addFuelPlan({
                  month: fd.get("month"),
                  targetType,
                  assetName: targetType === "vehicle" ? "รถยนต์ 6ฝ-0559 กทม." : "เครื่องตัดหญ้าสะพายบ่า (3 เครื่อง)",
                  targetDate: fd.get("month") + "-01",
                  estimatedWorkUnit: workUnit,
                  unitLabel: targetType === "vehicle" ? "กม." : "ชั่วโมง",
                  avgRate,
                  estimatedLiters: estLiters,
                  estimatedBudget: estBudget,
                });
                setShowAddPlanModal(false);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">เลือกประเภทภารกิจ</label>
                <select name="targetType" className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800">
                  <option value="vehicle">🚗 รถยนต์ราชการ 6ฝ-0559 (คิดเป็น กม.)</option>
                  <option value="mower">🌿 เครื่องตัดหญ้าถังกลาง (คิดเป็น ชม.ทำงาน)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ประจำเดือน</label>
                  <input
                    type="month"
                    name="month"
                    defaultValue="2026-09"
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ปริมาณงานคาดการณ์</label>
                  <input
                    type="number"
                    name="workUnit"
                    required
                    placeholder="เช่น 500 กม. หรือ 40 ชม."
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50/70 p-3 text-[11px] text-indigo-900 leading-relaxed border border-indigo-100">
                ระบบจะคำนวณปริมาณลิตรและงบประมาณให้อัตโนมัติจากอัตราสิ้นเปลืองมาตรฐาน และติดตามผลต่างเมื่อมีการบันทึกผลงานจริง
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  สร้างแผนงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: VARIANCE REASON & ACTUAL UPDATE                     */}
      {/* ============================================================ */}
      {varianceModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Gauge className="h-5 w-5 text-indigo-600" />
                บันทึกผลจริงและชี้แจงผลต่าง (Variance)
              </h3>
              <button onClick={() => setVarianceModalPlan(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const actualWork = Number(fd.get("actualWorkUnit")) || 0;
                const actualLiters = Number(fd.get("actualLiters")) || 0;
                const actualBudget = Number(fd.get("actualBudget")) || 0;
                const reason = fd.get("varianceReason");

                updateFuelPlanActual(varianceModalPlan.id, actualWork, actualLiters, actualBudget, reason);
                setVarianceModalPlan(null);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <p className="font-bold text-slate-800">{varianceModalPlan.assetName}</p>
                <p className="text-slate-500 text-[11px]">
                  แผนเดิม: {varianceModalPlan.estimatedWorkUnit} {varianceModalPlan.unitLabel} ({varianceModalPlan.estimatedLiters} ลิตร)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ผลงานจริง ({varianceModalPlan.unitLabel})
                  </label>
                  <input
                    type="number"
                    name="actualWorkUnit"
                    defaultValue={varianceModalPlan.actualWorkUnit || varianceModalPlan.estimatedWorkUnit}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">น้ำมันที่ใช้จริง (ลิตร)</label>
                  <input
                    type="number"
                    name="actualLiters"
                    step="0.1"
                    defaultValue={varianceModalPlan.actualLiters || varianceModalPlan.estimatedLiters}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ยอดเงินจริง (บาท)</label>
                <input
                  type="number"
                  name="actualBudget"
                  defaultValue={varianceModalPlan.actualBudget || varianceModalPlan.estimatedBudget}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  เหตุผลชี้แจง (กรณีใช้เกินแผน &gt; 15% จะบังคับระบุ)
                </label>
                <textarea
                  name="varianceReason"
                  rows={3}
                  defaultValue={varianceModalPlan.varianceReason}
                  placeholder="เช่น ฝนตกหนักหญ้าชื้นเครื่องทำงานหนัก, วิ่งช่วยภารกิจด่วน ฯลฯ"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVarianceModalPlan(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500"
                >
                  บันทึกผลการใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuelManagementPage;
