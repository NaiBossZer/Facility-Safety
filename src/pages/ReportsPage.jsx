// ============================================================
// ReportsPage.jsx — Formal Safety & Legal Compliance Annual Report + Continuity PDF Generator
// ============================================================
import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Filter,
} from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { Badge } from "../components/ui/Badge";
import { SectionTitle } from "../components/ui/SectionTitle";
import { fmt, thDate, cx } from "../lib/helpers";

export function ReportsPage() {
  const { inspections, workOrders, cat, catalog } = useAppData();

  const buildings = cat?.buildings || [];
  const categories = cat?.categories || [];

  const [reportType, setReportType] = useState("annual_safety"); // "annual_safety" | "continuity_summary"
  const [selectedBuildingId, setSelectedBuildingId] = useState("all");

  // Filter inspections based on Report Type (Track) and Building
  const filteredInspections = inspections.filter((ins) => {
    const matchBuilding = selectedBuildingId === "all" ? true : ins.buildingId === selectedBuildingId;
    if (reportType === "annual_safety") {
      return matchBuilding && (ins.track === "safety_legal" || !ins.track);
    } else {
      return matchBuilding && ins.track === "facility_continuity";
    }
  });

  const totalPass = filteredInspections.reduce((s, i) => s + (i.summary?.pass || 0), 0);
  const totalWarn = filteredInspections.reduce((s, i) => s + (i.summary?.warn || 0), 0);
  const totalFail = filteredInspections.reduce((s, i) => s + (i.summary?.fail || 0), 0);
  const totalChecked = totalPass + totalWarn + totalFail;
  const complianceRate = totalChecked > 0 ? Math.round((totalPass / totalChecked) * 100) : 100;

  const doPrint = () => {
    window.print();
  };

  const getBuildingName = (id) => buildings.find((b) => b.id === id)?.name || id || "-";

  return (
    <div className="space-y-6 animate-fade">
      {/* Control Card */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          icon={FileText}
          title="ศูนย์ออกรายงานผลการตรวจสอบ (Official PDF Reports)"
          desc="สร้างรายงานการตรวจประเมินความปลอดภัยตามกฎหมาย และรายงานสรุปความต่อเนื่องสาธารณูปโภค"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Report Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">ประเภทรายงาน</label>
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setReportType("annual_safety")}
                className={cx(
                  "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition",
                  reportType === "annual_safety"
                    ? "bg-red-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                1. รายงานความปลอดภัยประจำปี
              </button>
              <button
                onClick={() => setReportType("continuity_summary")}
                className={cx(
                  "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition",
                  reportType === "continuity_summary"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                2. รายงานสาธารณูปโภค
              </button>
            </div>
          </div>

          {/* Building Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">กรองตามอาคาร</label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs outline-none focus:border-indigo-400 font-bold text-slate-700"
            >
              <option value="all">ทุกอาคารสถานที่ (ครอบคลุมทั้งวิทยาเขต/หน่วยงาน)</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.detail || b.code || "-"})
                </option>
              ))}
            </select>
          </div>

          {/* Print Trigger */}
          <div className="flex items-end">
            <button
              onClick={doPrint}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-900 active:scale-95"
            >
              <Printer className="h-4 w-4" /> พิมพ์รายงาน / Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* 📄 Formal Printable Official Report Sheet */}
      <div
        id="print-area"
        className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-300 bg-white p-8 shadow-2xl sm:p-14 text-black"
        style={{ fontFamily: "'TH Sarabun New', 'Cordia New', sans-serif" }}
      >
        <div className="space-y-6 text-sm leading-relaxed">
          {/* Official Emblem & Title Header */}
          <div className="border-b-2 border-black pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-6 w-6 text-slate-800" />
              <p className="text-sm font-bold text-slate-700">ฝ่ายอาคารสถานที่และความปลอดภัย</p>
            </div>
            <h1 className="text-xl font-extrabold">
              {reportType === "annual_safety"
                ? "รายงานผลการตรวจสอบความปลอดภัยและความมั่นคงแข็งแรงของอาคาร ประจำปี 2569"
                : "รายงานสรุปผลการตรวจสอบและบำรุงรักษาระบบสาธารณูปโภคอาคาร"}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              ตามมาตรฐานกฎหมายควบคุมอาคารและความปลอดภัยในสถานประกอบการ · วันที่ออกรายงาน: {thDate(new Date())}
            </p>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h3 className="font-bold text-base border-b pb-1 mb-2">1. สรุปผลการประเมินภาพรวม (Executive Summary)</h3>
            <div className="grid grid-cols-4 gap-3 text-center my-3">
              <div className="border border-black p-2.5 rounded">
                <p className="text-xs text-slate-600">จุดตรวจทั้งหมด</p>
                <p className="text-lg font-bold">{totalChecked} จุด</p>
              </div>
              <div className="border border-black p-2.5 rounded bg-emerald-50/50">
                <p className="text-xs text-emerald-800">ผ่านเกณฑ์มาตรฐาน</p>
                <p className="text-lg font-bold text-emerald-700">{totalPass} จุด</p>
              </div>
              <div className="border border-black p-2.5 rounded bg-amber-50/50">
                <p className="text-xs text-amber-800">เฝ้าระวัง/ปรับปรุง</p>
                <p className="text-lg font-bold text-amber-700">{totalWarn} จุด</p>
              </div>
              <div className="border border-black p-2.5 rounded bg-red-50/50">
                <p className="text-xs text-red-800">ชำรุด/วิกฤต</p>
                <p className="text-lg font-bold text-red-700">{totalFail} จุด</p>
              </div>
            </div>
            <p className="text-xs indent-6 leading-relaxed">
              จากการตรวจประเมิน ณ <b>{selectedBuildingId === "all" ? "ทุกอาคารในหน่วยงาน" : getBuildingName(selectedBuildingId)}</b> ผลปรากฏว่ามีอัตราความสอดคล้องตามมาตรฐานความปลอดภัย (Safety Compliance Rate) อยู่ที่ <b>{complianceRate}%</b> โดยรายการที่ไม่ผ่านเกณฑ์ได้ถูกส่งต่อเพื่อเปิดใบแจ้งซ่อม (Work Order) และดำเนินการจัดซื้อจัดจ้างตามระเบียบเรียบร้อยแล้ว
            </p>
          </div>

          {/* Section 2: Detailed Inspection Logs */}
          <div>
            <h3 className="font-bold text-base border-b pb-1 mb-2">2. รายละเอียดผลการตรวจสอบตามรอบ (Inspection Records)</h3>
            {filteredInspections.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">ไม่มีบันทึกการตรวจสอบในเงื่อนไขที่เลือก</p>
            ) : (
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-2 w-12">ลำดับ</th>
                    <th className="border border-black p-2 w-24">วันที่ตรวจ</th>
                    <th className="border border-black p-2">อาคารสถานที่</th>
                    <th className="border border-black p-2 w-20">ปกติ</th>
                    <th className="border border-black p-2 w-20">เฝ้าระวัง</th>
                    <th className="border border-black p-2 w-20">ชำรุด</th>
                    <th className="border border-black p-2">ผู้ตรวจประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInspections.map((ins, idx) => (
                    <tr key={ins.id || idx}>
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2 text-center">{thDate(ins.date || ins.createdAt)}</td>
                      <td className="border border-black p-2 font-bold">{getBuildingName(ins.buildingId)}</td>
                      <td className="border border-black p-2 text-center text-emerald-700 font-bold">{ins.summary?.pass || 0}</td>
                      <td className="border border-black p-2 text-center text-amber-700">{ins.summary?.warn || 0}</td>
                      <td className="border border-black p-2 text-center text-red-700 font-bold">{ins.summary?.fail || 0}</td>
                      <td className="border border-black p-2 text-center">{ins.inspector || "เจ้าหน้าที่ตรวจอาคาร"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section 3: Official Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p>ลงชื่อ ................................................................ ผู้ตรวจประเมิน</p>
              <p className="mt-1">( นายสมชาย ตรวจดี )</p>
              <p className="text-slate-500">เจ้าหน้าที่ตรวจสอบอาคารและความปลอดภัย</p>
              <p className="text-slate-400 mt-1">วันที่ {thDate(new Date())}</p>
            </div>
            <div>
              <p>ลงชื่อ ................................................................ ผู้รับรองรายงาน</p>
              <p className="mt-1">( นายประเสริฐ มั่นคงชัย )</p>
              <p className="text-slate-500">หัวหน้าฝ่ายอาคารสถานที่และความปลอดภัย</p>
              <p className="text-slate-400 mt-1">วันที่ {thDate(new Date())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
