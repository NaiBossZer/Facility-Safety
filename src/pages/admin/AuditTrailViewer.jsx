// ============================================================
// AuditTrailViewer.jsx — Master Data & Audit: บันทึกตรวจสอบกิจกรรมย้อนหลัง
// ============================================================
import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { AUDIT_MODULES, AUDIT_ACTIONS } from "../../lib/auditService";

export function AuditTrailViewer() {
  const { auditLogs } = useAppData();
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterAction, setFilterAction] = useState("all");

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        log.description?.toLowerCase().includes(q) ||
        log.recordId?.toLowerCase().includes(q) ||
        log.userName?.toLowerCase().includes(q);
      const matchMod = filterModule === "all" || log.module === filterModule;
      const matchAct = filterAction === "all" || log.action === filterAction;
      return matchSearch && matchMod && matchAct;
    });
  }, [auditLogs, search, filterModule, filterAction]);

  const getModuleBadge = (mod) => {
    switch (mod) {
      case AUDIT_MODULES.INSPECTION:
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Inspection</Badge>;
      case AUDIT_MODULES.WORK_ORDER:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Work Order</Badge>;
      case AUDIT_MODULES.PROCUREMENT:
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Procurement</Badge>;
      case AUDIT_MODULES.FUEL:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Fuel &amp; Fleet</Badge>;
      case AUDIT_MODULES.MASTER_DATA:
        return <Badge className="bg-violet-100 text-violet-800 border-violet-200">Master Data</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">{mod}</Badge>;
    }
  };

  const getActionBadge = (act) => {
    switch (act) {
      case "CREATE":
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">CREATE</span>;
      case "UPDATE":
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">UPDATE</span>;
      case "STATUS_CHANGE":
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">STATUS</span>;
      case "DELETE":
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">DELETE</span>;
      case "EXPORT":
        return <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">EXPORT</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{act}</span>;
    }
  };

  const exportAuditCSV = () => {
    let csv = "\uFEFF"; // UTF-8 BOM
    csv += "ลำดับ,วันเวลา,โมดูล,การกระทำ,รหัสอ้างอิง,รายละเอียด,ผู้ดำเนินการ,บทบาท\n";
    filteredLogs.forEach((l, idx) => {
      csv += `"${idx + 1}","${l.timestamp}","${l.module}","${l.action}","${l.recordId}","${l.description}","${l.userName}","${l.userRole || "-"}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SectionTitle
          icon={ShieldAlert}
          title={`บันทึกตรวจสอบกิจกรรมย้อนหลัง (Audit Trail: ${(auditLogs || []).length} รายการ)`}
          desc="บันทึกประวัติการสร้าง แก้ไข เปลี่ยนสถานะ และส่งออกเอกสารราชการเพื่อการตรวจสอบภายใน (Audit)"
        />
        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
        >
          <Download className="h-4 w-4" /> Export CSV (Excel)
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหากิจกรรม, รหัสอ้างอิง หรือชื่อผู้ดำเนินการ…"
            className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">ทุกโมดูลระบบ</option>
          <option value={AUDIT_MODULES.INSPECTION}>Inspection &amp; Checklist</option>
          <option value={AUDIT_MODULES.WORK_ORDER}>Work Orders &amp; ซ่อมบำรุง</option>
          <option value={AUDIT_MODULES.PROCUREMENT}>E-Procurement (งพ.001/003)</option>
          <option value={AUDIT_MODULES.FUEL}>Fuel &amp; Fleet Management</option>
          <option value={AUDIT_MODULES.MASTER_DATA}>Master Data Hub</option>
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">ทุกการกระทำ</option>
          <option value="CREATE">CREATE (สร้าง)</option>
          <option value="UPDATE">UPDATE (แก้ไข)</option>
          <option value="STATUS_CHANGE">STATUS (เปลี่ยนสถานะ)</option>
          <option value="DELETE">DELETE / ARCHIVE</option>
          <option value="EXPORT">EXPORT (ส่งออกเอกสาร)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 font-bold text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">วัน/เวลา</th>
              <th className="px-4 py-3 text-left">โมดูล</th>
              <th className="px-4 py-3 text-center">Action</th>
              <th className="px-4 py-3 text-left">รหัสอ้างอิง</th>
              <th className="px-4 py-3 text-left">รายละเอียดกิจกรรม</th>
              <th className="px-4 py-3 text-left">ผู้ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  ไม่พบประวัติการใช้งานตามเงื่อนไข
                </td>
              </tr>
            ) : (
              filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getModuleBadge(l.module)}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">{getActionBadge(l.action)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {l.recordId}
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium max-w-md truncate" title={l.description}>
                    {l.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{l.userName}</p>
                    <p className="text-[10px] text-slate-400">สิทธิ์: {l.userRole || "staff"}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditTrailViewer;
