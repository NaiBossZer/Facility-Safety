// ============================================================
// ProcurementPage.jsx — E-Procurement, Ng.P.001 & Ng.P.003 Document System
// Directly matched with Official Ministry Templates (Word .doc & Print PDF)
// ============================================================
import React, { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Store,
  FileCheck2,
  Loader2,
  Download,
  FileDown,
} from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { Badge } from "../components/ui/Badge";
import { SectionTitle } from "../components/ui/SectionTitle";
import { EmptyState } from "../components/ui/EmptyState";
import { fmt, thDate, cx } from "../lib/helpers";
import { exportNgP001Word, exportNgP003Word } from "../lib/docxExport";

export function ProcurementPage() {
  const {
    workOrders,
    updateWorkOrder,
    procureWO,
    openProcurement,
    toast,
    cat,
    catalog,
  } = useAppData();

  const buildings = cat?.buildings || [];
  const vendors = cat?.vendors || [];
  const budgetTotal = catalog?.budget?.total || 2500000;

  const eligible = workOrders.filter((w) => w.status >= 1 && w.status <= 6);
  const fallback = eligible.find((w) => w.status === 3) || eligible[0] || workOrders[0];
  const woId = procureWO && workOrders.some((w) => w.id === procureWO) ? procureWO : fallback?.id;
  const wo = workOrders.find((w) => w.id === woId);

  const [tab, setTab] = useState("001"); // "001" = แบบ งพ 001 | "003" = แบบ งพ 003
  const [requester, setRequester] = useState("นายสมชาย ตรวจดี");
  const [position, setPosition] = useState("เจ้าหน้าที่ตรวจอาคาร");
  const [dept, setDept] = useState("งานพันธกิจเพื่อสังคม");
  const [reason, setReason] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [contactPerson, setContactPerson] = useState("นายสมชาย ตรวจดี โทร. 081-234-5678");
  const [disbursementFund, setDisbursementFund] = useState(
    "งบดำเนินงาน – ค่าซ่อมแซมบำรุงรักษาระบบสาธารณูปโภค"
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!wo) return;
    setRequester(wo.reporter || "นายสมชาย ตรวจดี");
    setReason(wo.reason || `เพื่อซ่อมแซมและบำรุงรักษา ${wo.title}`);
    const d = new Date();
    d.setDate(d.getDate() + (wo.priority === "urgent" ? 7 : 21));
    setExpectedDate(thDate(d));
  }, [woId, wo]);

  if (!wo) {
    return (
      <EmptyState
        icon={FileText}
        title="ยังไม่มีใบแจ้งซ่อมสำหรับออกเอกสาร"
        desc="กรุณาสร้างใบแจ้งซ่อมจากหน้า Inspection Checklist ก่อน"
      />
    );
  }

  // Calculate items and total
  const items = wo.items || [];
  const total = items.reduce(
    (s, it) => s + (Number(it.qty) || 1) * (Number(it.unitPrice ?? it.price) || 0),
    0
  );

  // Quote comparison for 003
  const displayVendors =
    vendors.length > 0
      ? vendors
      : [
          { name: "บริษัท ไทยเทคนิค ซัพพลาย จำกัด", tax: "0105542001234", tel: "02-591-8800", factor: 1.0 },
          { name: "หจก. ศรีอยุธยาการช่างและบริการ", tax: "0143551000987", tel: "035-241-556", factor: 1.075 },
          { name: "ร้าน พี.เอ็น. วัสดุภัณฑ์และวิศวกรรม", tax: "3100600123456", tel: "081-445-2290", factor: 1.142 },
        ];

  const quotes = displayVendors.map((v, idx) => {
    const factor = v.factor || (idx === 0 ? 1.0 : idx === 1 ? 1.075 : 1.142);
    const calculatedItems = items.map((it) => {
      const p = Number(it.unitPrice ?? it.price) || 0;
      return { ...it, price: Math.round(p * factor) };
    });
    const sum = calculatedItems.reduce((s, it) => s + it.price * (Number(it.qty) || 1), 0);
    return { ...v, items: calculatedItems, sum, contactPerson: "ฝ่ายขาย" };
  });

  const doPrintPDF = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      window.print();
      toast.info(`เตรียมพิมพ์แบบ ${tab === "001" ? "งพ 001" : "งพ 003"} — เลือก Save as PDF ในหน้าพิมพ์`);
    }, 500);
  };

  const doExportWord = () => {
    if (tab === "001") {
      exportNgP001Word(wo, {
        date: thDate(new Date()),
        requester,
        position,
        department: dept,
        expectedDate,
        contactPerson,
        reason,
        disbursementFund,
      });
      toast.success("ดาวน์โหลดไฟล์แบบ งพ 001 (.doc / Word) เรียบร้อยแล้ว");
    } else {
      exportNgP003Word(wo, quotes, requester);
      toast.success("ดาวน์โหลดไฟล์แบบ งพ 003 (.doc / Word) เรียบร้อยแล้ว");
    }
  };

  const Field = ({ label, value, onChange, placeholder = "" }) => (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 font-medium"
      />
    </label>
  );

  return (
    <div className="space-y-5 animate-fade">
      {/* Control Card */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          icon={FileText}
          title="ระบบเอกสารจัดซื้อจัดจ้าง (แบบ งพ 001 & แบบ งพ 003)"
          desc="ดึงข้อมูลจากใบแจ้งซ่อมเข้าสู่แบบฟอร์มราชการ พร้อม Export เป็น Microsoft Word (.doc) หรือ PDF"
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-xs font-bold text-slate-500">
              เลือกใบแจ้งซ่อม (Work Order)
            </span>
            <select
              value={woId}
              onChange={(e) => openProcurement(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700"
            >
              {workOrders.map((w) => {
                const wTotal = (w.items || []).reduce(
                  (s, it) => s + (Number(it.qty) || 1) * (Number(it.unitPrice ?? it.price) || 0),
                  0
                );
                return (
                  <option key={w.id} value={w.id}>
                    {w.number || w.id} · {w.title} ({fmt(wTotal)} บาท)
                  </option>
                );
              })}
            </select>
          </label>

          <div className="flex items-end">
            <div className="flex w-full rounded-xl bg-slate-100 p-1">
              {[
                { key: "001", label: "แบบ งพ 001 (ขออนุมัติ)" },
                { key: "003", label: "แบบ งพ 003 (ใบสืบราคา)" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cx(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-bold transition active:scale-95",
                    tab === t.key
                      ? "bg-white text-indigo-700 shadow"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Parameters for Form */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="ชื่อผู้ขอจัดหา" value={requester} onChange={setRequester} />
          <Field label="ตำแหน่ง" value={position} onChange={setPosition} />
          <Field label="งาน/หน่วย (Department)" value={dept} onChange={setDept} />
          <Field label="กำหนดเวลาที่ต้องการใช้พัสดุ (ภายในวันที่)" value={expectedDate} onChange={setExpectedDate} />
          <Field label="ชื่อผู้ขาย/ผู้รับจ้าง พร้อมเบอร์โทร" value={contactPerson} onChange={setContactPerson} />
          <Field label="โดยเบิกจากเงิน (Disbursement from)" value={disbursementFund} onChange={setDisbursementFund} />
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-bold text-slate-500">เหตุผลและความจำเป็น (Reason)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 font-medium"
          />
        </label>

        {/* Action Buttons: Export Word & Print PDF */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-dashed border-slate-200 pt-4">
          <button
            onClick={doExportWord}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-800 active:scale-95"
          >
            <FileDown className="h-4 w-4" /> Export เป็น Microsoft Word (.doc)
          </button>

          <button
            onClick={doPrintPDF}
            disabled={busy}
            className={cx(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95",
              busy ? "bg-slate-400" : "bg-slate-800 shadow-slate-200 hover:bg-slate-900"
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}{" "}
            พิมพ์เอกสาร / Export PDF
          </button>
        </div>
      </div>

      {/* 📄 Paper Sheet: EXACT REPLICA OF THE REAL GOVERNMENT FORM */}
      <div
        id="print-area"
        className="mx-auto w-full max-w-4xl overflow-x-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl sm:p-12 text-black"
        style={{ fontFamily: "'TH Sarabun New', 'Cordia New', sans-serif" }}
      >
        <div className="min-w-[650px] text-sm leading-relaxed">
          {/* ============================================================ */}
          {/* FORM 1: แบบ งพ 001 (แบบการขออนุมัติจัดหา)                      */}
          {/* ============================================================ */}
          {tab === "001" ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="text-right text-xs font-semibold">แบบ งพ 001</div>
              <div className="text-center text-lg font-bold">
                แบบการขออนุมัติจัดหา (Request Form)
              </div>
              <div className="text-right text-xs">วันที่ (Date) {thDate(new Date())}</div>

              <div>
                <p>
                  <b>เรื่อง :</b> ขออนุมัติในหลักการจัดหาพัสดุ
                </p>
                <p className="text-xs text-slate-600">
                  (Subject) : (Procurement request for approval in principle)
                </p>
                <p className="mt-1">
                  <b>เรียน (Dear) :</b> คณบดี (Dean)
                </p>
              </div>

              <div className="text-justify indent-8 leading-loose">
                ข้าพเจ้า (I am Mr./Mrs./Miss) <u>&nbsp;{requester}&nbsp;</u> ตำแหน่ง (Position)
                <u>&nbsp;{position}&nbsp;</u> งาน/หน่วย (Department) <u>&nbsp;{dept}&nbsp;</u>
                มีความประสงค์ขออนุมัติจัดหาพัสดุ ดังนี้ (would like to request supplies as listed below.)
              </div>

              {/* 5-Column Table */}
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-50 text-center font-bold">
                    <th className="border border-black p-2 w-12">ลำดับ<br />(No.)</th>
                    <th className="border border-black p-2">รายการพัสดุที่ต้องการจัดหา<br />(Description)</th>
                    <th className="border border-black p-2 w-24">จำนวนหน่วย<br />(Unit)</th>
                    <th className="border border-black p-2 w-28">ราคาต่อหน่วย<br />(Price per unit)</th>
                    <th className="border border-black p-2 w-28">จำนวนเงิน<br />(Amount)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const price = Number(it.unitPrice ?? it.price) || 0;
                    const qty = Number(it.qty) || 1;
                    return (
                      <tr key={idx}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2">{it.name}</td>
                        <td className="border border-black p-2 text-center">{qty} {it.unit || "หน่วย"}</td>
                        <td className="border border-black p-2 text-right">{fmt(price)}</td>
                        <td className="border border-black p-2 text-right font-bold">{fmt(qty * price)}</td>
                      </tr>
                    );
                  })}
                  {/* Empty rows filler */}
                  {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
                    <tr key={`empty_${i}`}>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2">&nbsp;</td>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2 text-right">&nbsp;</td>
                      <td className="border border-black p-2 text-right">&nbsp;</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className="border border-black p-2 font-bold">
                      จำนวนเงินรวม (Total) : (อักษร:Text) ({total.toLocaleString("th-TH")} บาทถ้วน)
                    </td>
                    <td className="border border-black p-2 text-right font-extrabold text-indigo-900">
                      {fmt(total)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Justification & Timeline */}
              <div className="space-y-1.5 text-xs pt-1">
                <p>
                  <b>เหตุผลและความจำเป็น : (Reason and necessity)</b> {reason}
                </p>
                <p>
                  <b>กำหนดเวลาที่ต้องการใช้พัสดุ ภายในไม่เกินวันที่ : (Expected date of use)</b> {expectedDate}
                </p>
                <p>
                  <b>ชื่อผู้ขายหรือผู้รับจ้างพร้อมเบอร์โทรศัพท์ : (Contact Person/Phone)</b> {contactPerson}
                </p>
              </div>

              {/* Requestor Signature */}
              <div className="text-right text-xs pt-2">
                <p>ลงชื่อ (Signature) ................................................................ ผู้ขอจัดหา (Requestor)</p>
                <p className="mt-1 pr-6">( {requester} )</p>
              </div>

              {/* Disbursement Reference */}
              <div className="pt-2 text-xs">
                <p><b>เรียน (Dear) :</b> คณบดี (Dean)</p>
                <p className="indent-6">เพื่อโปรดพิจารณาอนุมัติจัดหา (Please consider and approve the request)</p>
                <p className="indent-6">โดยเบิกจากเงิน (By disbursement of funds from) <u>&nbsp;{disbursementFund}&nbsp;</u></p>
              </div>

              {/* 4 Official Approval Boxes (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-3">
                {/* Box 1: Section Chief */}
                <div className="border border-black p-2.5 rounded">
                  <p className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 border border-black" /> สมควรอนุมัติให้ดำเนินการ (Approved)</p>
                  <p className="flex items-center gap-1.5 mt-1"><span className="inline-block w-3.5 h-3.5 border border-black" /> อื่นๆ (Others) .........................................</p>
                  <div className="mt-4">
                    <p>ลงชื่อ(Signature)........................................................</p>
                    <p className="mt-0.5 text-center font-semibold">หัวหน้างาน (Section Chief)</p>
                    <p className="text-slate-500 text-center">วันที่ (Date).....................................</p>
                  </div>
                </div>

                {/* Box 2: Deputy Dean */}
                <div className="border border-black p-2.5 rounded">
                  <p className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 border border-black" /> สมควรอนุมัติให้ดำเนินการ (Approved)</p>
                  <p className="flex items-center gap-1.5 mt-1"><span className="inline-block w-3.5 h-3.5 border border-black" /> อื่นๆ (Others) .........................................</p>
                  <div className="mt-4">
                    <p>ลงชื่อ(Signature)........................................................</p>
                    <p className="mt-0.5 text-center font-semibold">รองคณบดี (Deputy Dean)</p>
                    <p className="text-slate-500 text-center">วันที่ (Date).....................................</p>
                  </div>
                </div>

                {/* Box 3: Finance Section Chief */}
                <div className="border border-black p-2.5 rounded">
                  <p className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 border border-black" /> สมควรอนุมัติให้ดำเนินการ (Approved)</p>
                  <p className="flex items-center gap-1.5 mt-1"><span className="inline-block w-3.5 h-3.5 border border-black" /> อื่นๆ (Others) .........................................</p>
                  <div className="mt-4">
                    <p>ลงชื่อ(Signature)........................................................</p>
                    <p className="mt-0.5 text-center font-semibold leading-tight">หัวหน้างานคลังฯ (Finance & Procurement Chief)</p>
                    <p className="text-slate-500 text-center">วันที่ (Date).....................................</p>
                  </div>
                </div>

                {/* Box 4: Dean / Authorized Approver */}
                <div className="border border-black p-2.5 rounded">
                  <p className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 border border-black" /> อนุมัติให้ดำเนินการ (Approved)</p>
                  <p className="flex items-center gap-1.5 mt-1"><span className="inline-block w-3.5 h-3.5 border border-black" /> อื่นๆ (Others) .........................................</p>
                  <div className="mt-4">
                    <p>ลงชื่อ(Signature)........................................................</p>
                    <p className="mt-0.5 text-center font-semibold leading-tight">คณบดี / รองคณบดีฝ่ายนโยบาย แผนและคลัง</p>
                    <p className="text-slate-500 text-center">วันที่ (Date).....................................</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* FORM 2: แบบ งพ 003 (ใบสืบราคา 8 คอลัมน์)                     */
            /* ============================================================ */
            <div className="space-y-5">
              <div className="text-right text-xs font-semibold">แบบ งพ 003</div>
              <div className="text-center text-xl font-bold">ใบสืบราคา</div>

              <div className="pt-2 text-xs">
                <b>การสืบราคารายการ :</b> {wo.title} (อ้างอิงใบแจ้งซ่อม {wo.number || wo.id})
              </div>

              {/* 8-Column Table matching Photo */}
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-slate-50 text-center font-bold">
                    <th className="border border-black p-2 w-12">ลำดับที่</th>
                    <th className="border border-black p-2 w-20">วัน/เดือน/ปี</th>
                    <th className="border border-black p-2">ชื่อบริษัท / ห้าง / ร้าน</th>
                    <th className="border border-black p-2 w-28">หมายเลขโทรศัพท์</th>
                    <th className="border border-black p-2 w-24">จำนวนเงิน</th>
                    <th className="border border-black p-2 w-20">ผู้แจ้งราคา</th>
                    <th className="border border-black p-2 w-24">ผู้สืบราคา</th>
                    <th className="border border-black p-2 w-20">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2 text-center">{thDate(new Date())}</td>
                      <td className="border border-black p-2 font-bold">{q.name}</td>
                      <td className="border border-black p-2 text-center">{q.tel || "-"}</td>
                      <td className="border border-black p-2 text-right font-extrabold">{fmt(q.sum)}</td>
                      <td className="border border-black p-2 text-center">{q.contactPerson || "ฝ่ายขาย"}</td>
                      <td className="border border-black p-2 text-center">{requester}</td>
                      <td className="border border-black p-2 text-center text-emerald-700 font-bold">
                        {idx === 0 ? "ราคาต่ำสุด" : "-"}
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows filler */}
                  {Array.from({ length: Math.max(0, 4 - quotes.length) }).map((_, i) => (
                    <tr key={`empty_quote_${i}`}>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2">&nbsp;</td>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2 text-right">&nbsp;</td>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                      <td className="border border-black p-2 text-center">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Note */}
              <div className="flex items-center justify-between text-xs pt-4 font-bold">
                <div>หมายเหตุ : สืบราคาเพื่อเสนอขออนุมัติในหลักการ</div>
                <div>งานคลังและพัสดุ</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcurementPage;
