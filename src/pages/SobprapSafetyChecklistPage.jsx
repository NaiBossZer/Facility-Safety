import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Building2, Camera, CheckCircle2, ClipboardCheck, Clock3,
  FileText, ImagePlus, Loader2, RefreshCw, ShieldCheck, X, XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Badge } from "../components/ui/Badge";
import { SectionTitle } from "../components/ui/SectionTitle";
import { cx } from "../lib/helpers";
import { SOBPRAP_SCOPES, SOBPRAP_CHECKLISTS, SOBPRAP_REFERENCE_ISSUES } from "../data/sobprapSafetyChecklist";

const RESULT_OPTIONS = [
  { value: "pass", label: "เรียบร้อย", icon: CheckCircle2, classes: "border-emerald-300 text-emerald-700 bg-emerald-50" },
  { value: "fail", label: "ไม่เรียบร้อย", icon: XCircle, classes: "border-red-300 text-red-700 bg-red-50" },
  { value: "na", label: "ไม่เกี่ยวข้อง", icon: AlertTriangle, classes: "border-slate-300 text-slate-600 bg-slate-50" },
];
const ACTION_STATUS = {
  pending: { label: "รอดำเนินการ", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "กำลังดำเนินการ", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  resolved: { label: "แก้ไขแล้ว", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};
const localDate = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const newId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : "safety-" + Date.now() + "-" + Math.random().toString(36).slice(2));
const formatDate = (value) => value ? new Date(value + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "-";
const allItems = (groups) => groups.flatMap((g) => g.items.map((item) => ({ ...item, groupKey: g.key, groupTitle: g.title })));

function StatusButtons({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:w-[390px]">
      {RESULT_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button key={option.value} type="button" onClick={() => onChange(selected ? "" : option.value)}
            className={cx("flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-bold transition",
              selected ? option.classes + " ring-2 ring-offset-1 ring-current/20" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            <Icon className="h-4 w-4 shrink-0" /><span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SobprapSafetyChecklistPage({ currentUser }) {
  const [tab, setTab] = useState("new");
  const [scopeKey, setScopeKey] = useState("project");
  const [inspectionDate, setInspectionDate] = useState(localDate);
  const [answers, setAnswers] = useState({});
  const [generalNote, setGeneralNote] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inspections, setInspections] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [updatingAction, setUpdatingAction] = useState("");

  const scope = SOBPRAP_SCOPES.find((item) => item.key === scopeKey) || SOBPRAP_SCOPES[0];
  const groups = SOBPRAP_CHECKLISTS[scopeKey] || [];
  const items = useMemo(() => allItems(groups), [groups]);
  const answeredCount = items.filter((item) => answers[item.key]?.status).length;
  const failCount = items.filter((item) => answers[item.key]?.status === "fail").length;
  const passCount = items.filter((item) => answers[item.key]?.status === "pass").length;
  const naCount = items.filter((item) => answers[item.key]?.status === "na").length;
  const progress = items.length ? Math.round(answeredCount * 100 / items.length) : 0;

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    const [inspectionResult, actionResult] = await Promise.all([
      supabase.from("safety_checklist_inspections").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("safety_checklist_actions").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    if (inspectionResult.error) setError("โหลดประวัติการตรวจไม่สำเร็จ: " + inspectionResult.error.message);
    else setInspections(inspectionResult.data || []);
    if (actionResult.error) setError((prev) => prev ? prev + " | " : "" + "โหลดรายการติดตามไม่สำเร็จ: " + actionResult.error.message);
    else setActions(actionResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  const setItemAnswer = (itemKey, patch) => {
    setAnswers((previous) => ({ ...previous, [itemKey]: { ...(previous[itemKey] || {}), ...patch } }));
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const allowed = selected.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 10 * 1024 * 1024);
    if (allowed.length !== selected.length) setError("รองรับเฉพาะ JPG, PNG, WEBP และไฟล์ละไม่เกิน 10 MB");
    setFiles((previous) => [...previous, ...allowed].slice(0, 5));
    event.target.value = "";
  };

  const saveInspection = async () => {
    setNotice("");
    setError("");
    if (!currentUser?.id) {
      setError("ไม่พบผู้ใช้งานที่เข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
      return;
    }
    if (answeredCount !== items.length) {
      setError("กรุณาเลือกผลตรวจให้ครบทุกข้อ (" + answeredCount + "/" + items.length + ")");
      return;
    }
    const missingNotes = items.filter((item) => answers[item.key]?.status === "fail" && !answers[item.key]?.note?.trim());
    if (missingNotes.length) {
      setError("กรุณาระบุรายละเอียดสำหรับรายการที่ไม่เรียบร้อยทุกข้อ");
      return;
    }

    setSaving(true);
    const inspectionId = newId();
    const uploadedPaths = [];
    try {
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = currentUser.id + "/" + inspectionId + "/" + newId() + "_" + safeName;
        const { error: uploadError } = await supabase.storage.from("safety-checklist-evidence").upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
      }

      const { error: insertError } = await supabase.from("safety_checklist_inspections").insert({
        id: inspectionId,
        scope_key: scope.key,
        scope_name: scope.name + " (" + scope.detail + ")",
        form_code: scope.formCode,
        inspected_on: inspectionDate,
        inspector_id: currentUser.id,
        inspector_name: currentUser.name || currentUser.email || "ผู้ตรวจ",
        answers,
        general_note: generalNote.trim(),
        evidence_paths: uploadedPaths,
        created_by: currentUser.id,
        updated_by: currentUser.id,
      });
      if (insertError) throw insertError;

      const failed = items.filter((item) => answers[item.key]?.status === "fail");
      if (failed.length) {
        const rows = failed.map((item) => ({
          inspection_id: inspectionId,
          item_key: item.key,
          item_label: item.label,
          location: scope.name + " · " + item.groupTitle,
          issue: answers[item.key].note.trim(),
          priority: item.groupKey === "electrical" || item.label.includes("ถังดับเพลิง") ? "urgent" : "high",
          created_by: currentUser.id,
        }));
        const { error: actionError } = await supabase.from("safety_checklist_actions").insert(rows);
        if (actionError) throw new Error("บันทึกผลตรวจแล้ว แต่สร้างรายการติดตามแก้ไขไม่สำเร็จ: " + actionError.message);
      }

      setAnswers({});
      setGeneralNote("");
      setFiles([]);
      setInspectionDate(localDate());
      setNotice("บันทึกผลตรวจ " + scope.formCode + " เรียบร้อยแล้ว" + (failed.length ? " · สร้างรายการติดตาม " + failed.length + " รายการ" : ""));
      await loadRecords();
      setTab(failed.length ? "actions" : "history");
    } catch (saveError) {
      setError(saveError.message || "บันทึกผลตรวจไม่สำเร็จ");
      if (uploadedPaths.length) await supabase.storage.from("safety-checklist-evidence").remove(uploadedPaths);
    } finally {
      setSaving(false);
    }
  };

  const openInspection = async (record) => {
    setSelectedInspection(record);
    setSelectedEvidence([]);
    if (record.evidence_paths?.length) {
      const signed = await Promise.all(record.evidence_paths.map(async (path) => {
        const { data } = await supabase.storage.from("safety-checklist-evidence").createSignedUrl(path, 900);
        return data?.signedUrl || "";
      }));
      setSelectedEvidence(signed.filter(Boolean));
    }
  };

  const updateAction = async (actionId, patch) => {
    setUpdatingAction(actionId);
    setError("");
    const payload = { ...patch, updated_by: currentUser?.id, updated_at: new Date().toISOString() };
    if (patch.status === "resolved") payload.resolved_at = new Date().toISOString();
    if (patch.status && patch.status !== "resolved") payload.resolved_at = null;
    const { error: updateError } = await supabase.from("safety_checklist_actions").update(payload).eq("id", actionId);
    if (updateError) setError("อัปเดตสถานะการแก้ไขไม่สำเร็จ: " + updateError.message);
    else await loadRecords();
    setUpdatingAction("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade">
      <div className="rounded-3xl bg-gradient-to-br from-[#123B63] via-[#174b73] to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="border-white/20 bg-white/10 text-white">ระบบ Facility-Safety · สบปราบ</Badge>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">แบบตรวจสอบความปลอดภัย</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">บันทึกผลตรวจตามแบบฟอร์ม FM พร้อมหลักฐานภาพถ่ายและติดตามการแก้ไขรายการที่ไม่เรียบร้อย</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs text-blue-100">แบบตรวจทั้งหมด</p>
            <p className="mt-1 text-3xl font-black">7 <span className="text-sm font-semibold">แบบ</span></p>
            <p className="mt-1 text-xs text-blue-100">FM_0000 – FM_6000</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-blue-100">ประวัติการตรวจ</p><p className="mt-1 text-2xl font-bold">{inspections.length}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-blue-100">รายการรอดำเนินการ</p><p className="mt-1 text-2xl font-bold">{actions.filter((a) => a.status === "pending").length}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-blue-100">กำลังแก้ไข</p><p className="mt-1 text-2xl font-bold">{actions.filter((a) => a.status === "in_progress").length}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-blue-100">แก้ไขแล้ว</p><p className="mt-1 text-2xl font-bold">{actions.filter((a) => a.status === "resolved").length}</p></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab("new")} className={cx("rounded-xl px-4 py-2.5 text-sm font-bold", tab === "new" ? "bg-[#123B63] text-white" : "border border-slate-200 bg-white text-slate-600")}>
          <ClipboardCheck className="mr-2 inline h-4 w-4" />เริ่มตรวจใหม่
        </button>
        <button onClick={() => setTab("history")} className={cx("rounded-xl px-4 py-2.5 text-sm font-bold", tab === "history" ? "bg-[#123B63] text-white" : "border border-slate-200 bg-white text-slate-600")}>
          <Clock3 className="mr-2 inline h-4 w-4" />ประวัติการตรวจ
        </button>
        <button onClick={() => setTab("actions")} className={cx("rounded-xl px-4 py-2.5 text-sm font-bold", tab === "actions" ? "bg-[#123B63] text-white" : "border border-slate-200 bg-white text-slate-600")}>
          <AlertTriangle className="mr-2 inline h-4 w-4" />ติดตามการแก้ไข
        </button>
        <button onClick={() => void loadRecords()} className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600"><RefreshCw className="mr-1.5 inline h-4 w-4" />รีเฟรช</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {tab === "new" && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Building2} title="เลือกพื้นที่ตรวจสอบ" desc="เลือกแบบฟอร์มให้ตรงกับพื้นที่ที่ต้องการตรวจ" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SOBPRAP_SCOPES.map((item) => (
                <button key={item.key} onClick={() => { setScopeKey(item.key); setAnswers({}); setGeneralNote(""); }}
                  className={cx("rounded-xl border-2 p-4 text-left transition", scopeKey === item.key ? "border-[#123B63] bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300")}>
                  <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-slate-800">{item.name}</span><Badge className={scopeKey === item.key ? "border-blue-200 bg-blue-100 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}>{item.formCode}</Badge></div>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block text-sm"><span className="mb-1 block font-semibold text-slate-600">วันที่ตรวจ</span><input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
              <div className="block text-sm"><span className="mb-1 block font-semibold text-slate-600">ผู้ตรวจ</span><div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700">{currentUser?.name || currentUser?.email || "ไม่ระบุ"}</div></div>
              <div className="block text-sm"><span className="mb-1 block font-semibold text-slate-600">แบบฟอร์ม</span><div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-semibold text-slate-700">{scope.formCode} · {scope.name}</div></div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-lg font-bold text-slate-800">รายการตรวจสอบ · {scope.name}</h2><p className="text-xs text-slate-500">{scope.formCode} · ตอบผลตรวจทุกข้อก่อนบันทึก</p></div>
              <div className="flex flex-wrap gap-2 text-xs"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">เรียบร้อย {passCount}</Badge><Badge className="border-red-200 bg-red-50 text-red-700">ไม่เรียบร้อย {failCount}</Badge><Badge className="border-slate-200 bg-slate-50 text-slate-600">ไม่เกี่ยวข้อง {naCount}</Badge></div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#D6A84F] transition-all" style={{ width: progress + "%" }} /></div>
            <p className="mt-1 text-right text-xs text-slate-500">ตรวจแล้ว {answeredCount} / {items.length} ข้อ ({progress}%)</p>
            <div className="mt-5 space-y-5">
              {groups.map((group) => (
                <div key={group.key}>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-sm font-extrabold text-[#123B63]">{group.title}</h3>
                  <div className="space-y-3">
                    {group.items.map((item, index) => {
                      const answer = answers[item.key] || {};
                      return (
                        <div key={item.key} className={cx("rounded-xl border p-4", answer.status === "fail" ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white")}>
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span><p className="pt-1 text-sm font-medium leading-relaxed text-slate-700">{item.label}</p></div>
                            <StatusButtons value={answer.status} onChange={(value) => setItemAnswer(item.key, { status: value, note: value === "fail" ? answer.note || "" : "" })} />
                          </div>
                          {answer.status === "fail" && <label className="mt-3 block text-sm"><span className="mb-1 block font-semibold text-red-700">รายละเอียดปัญหา (จำเป็น)</span><textarea rows={2} value={answer.note || ""} onChange={(e) => setItemAnswer(item.key, { note: e.target.value })} placeholder="ระบุตำแหน่ง ลักษณะความเสียหาย หรือความเสี่ยงที่พบ" className="w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400" /></label>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {scopeKey === "building_1" && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <h3 className="font-bold text-amber-900">ข้อสังเกตจากเอกสาร FM อาคาร 1</h3>
              <p className="mt-1 text-xs text-amber-800">เป็นรายการปัญหาที่ระบุไว้ในเอกสารแนบเดิม ใช้เป็นจุดเน้นในการตรวจซ้ำ ไม่ได้ตั้งผลตรวจเป็น “ไม่เรียบร้อย” ให้อัตโนมัติ</p>
              <ul className="mt-3 space-y-2">{SOBPRAP_REFERENCE_ISSUES.map((issue, index) => <li key={index} className="rounded-lg border border-amber-200/80 bg-white/70 p-3 text-sm"><p className="font-semibold text-slate-800">{issue.category}</p><p className="mt-0.5 text-xs text-slate-500">{issue.location}</p><p className="mt-1 text-sm text-slate-700">{issue.issue}</p></li>)}</ul>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={FileText} title="หมายเหตุและหลักฐานประกอบ" desc="แนบภาพถ่ายประกอบผลการตรวจได้สูงสุด 5 ภาพ (10 MB ต่อภาพ)" />
            <textarea rows={3} value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} placeholder="หมายเหตุเพิ่มเติมของการตรวจครั้งนี้" className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400" />
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-600 hover:border-blue-400 hover:bg-blue-50">
              <ImagePlus className="h-5 w-5" />เลือกภาพหลักฐาน<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="hidden" />
            </label>
            {files.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{files.map((file, index) => <span key={index} className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700"><Camera className="h-3.5 w-3.5" />{file.name}<button type="button" onClick={() => setFiles((previous) => previous.filter((_, i) => i !== index))} aria-label="ลบรูป"><X className="h-3.5 w-3.5" /></button></span>)}</div>}
            <button onClick={saveInspection} disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B63] px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#0d2e4b] disabled:cursor-not-allowed disabled:bg-slate-400">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังบันทึก...</> : <><ShieldCheck className="h-4 w-4" />บันทึกผลตรวจ {scope.formCode}</>}
            </button>
          </section>
        </>
      )}

      {tab === "history" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Clock3} title="ประวัติการตรวจสอบ" desc="รายการตรวจที่บันทึกไว้ในระบบ Facility-Safety" />
          {loading ? <div className="py-10 text-center text-sm text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />กำลังโหลด...</div> : inspections.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">ยังไม่มีประวัติการตรวจ</p> : (
            <div className="space-y-3">{inspections.map((record) => {
              const recordItems = allItems(SOBPRAP_CHECKLISTS[record.scope_key] || []);
              const resultValues = Object.values(record.answers || {});
              const failed = resultValues.filter((answer) => answer.status === "fail").length;
              return <div key={record.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-800">{record.scope_name}</p><Badge className="border-blue-200 bg-blue-50 text-blue-700">{record.form_code}</Badge></div><p className="mt-1 text-xs text-slate-500">{formatDate(record.inspected_on)} · ผู้ตรวจ {record.inspector_name}</p></div>
                  <div className="flex items-center gap-2"><Badge className={failed ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{failed ? "ไม่เรียบร้อย " + failed + " ข้อ" : "ไม่พบรายการไม่เรียบร้อย"}</Badge><button onClick={() => void openInspection(record)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">รายละเอียด</button></div>
                </div>
                {selectedInspection?.id === record.id && <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="space-y-2">{recordItems.map((item) => { const answer = record.answers?.[item.key] || {}; const option = RESULT_OPTIONS.find((entry) => entry.value === answer.status); return <div key={item.key} className="flex flex-col justify-between gap-1 rounded-lg bg-slate-50 p-3 sm:flex-row"><span className="text-sm text-slate-700">{item.label}</span><span className={cx("text-xs font-bold", answer.status === "fail" ? "text-red-700" : answer.status === "pass" ? "text-emerald-700" : "text-slate-500")}>{option?.label || "ไม่ระบุ"}{answer.note ? " · " + answer.note : ""}</span></div>; })}</div>
                  {record.general_note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">หมายเหตุ: {record.general_note}</p>}
                  {selectedEvidence.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{selectedEvidence.map((url, index) => <a key={index} href={url} target="_blank" rel="noreferrer"><img src={url} alt="หลักฐานการตรวจ" className="h-28 w-full rounded-lg object-cover" /></a>)}</div>}
                </div>}
              </div>;
            })}</div>
          )}
        </section>
      )}

      {tab === "actions" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={AlertTriangle} title="ติดตามรายการแก้ไข" desc="รายการที่ตรวจพบว่าไม่เรียบร้อยจากแบบตรวจ FM" />
          {loading ? <div className="py-10 text-center text-sm text-slate-500">กำลังโหลด...</div> : actions.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">ยังไม่มีรายการที่ต้องติดตามแก้ไข</p> : (
            <div className="space-y-3">{actions.map((action) => <div key={action.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-slate-800">{action.item_label}</p><Badge className={ACTION_STATUS[action.status]?.classes || ""}>{ACTION_STATUS[action.status]?.label || action.status}</Badge></div>
              <p className="mt-1 text-xs text-slate-500">{action.location} · ระดับ {action.priority === "urgent" ? "เร่งด่วน" : "สูง"}</p>
              <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">{action.issue}</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label className="text-xs font-semibold text-slate-500">ผู้รับผิดชอบ<input defaultValue={action.assigned_to || ""} onBlur={(e) => { if (e.target.value !== (action.assigned_to || "")) void updateAction(action.id, { assigned_to: e.target.value }); }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700" placeholder="ระบุชื่อผู้รับผิดชอบ" /></label>
                <label className="text-xs font-semibold text-slate-500">กำหนดแล้วเสร็จ<input type="date" defaultValue={action.due_date || ""} onBlur={(e) => { if (e.target.value !== (action.due_date || "")) void updateAction(action.id, { due_date: e.target.value || null }); }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700" /></label>
                <label className="text-xs font-semibold text-slate-500">สถานะ<select value={action.status} disabled={updatingAction === action.id} onChange={(e) => void updateAction(action.id, { status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700"><option value="pending">รอดำเนินการ</option><option value="in_progress">กำลังดำเนินการ</option><option value="resolved">แก้ไขแล้ว</option></select></label>
              </div>
              <label className="mt-2 block text-xs font-semibold text-slate-500">บันทึกผลการแก้ไข<textarea defaultValue={action.resolution_note || ""} onBlur={(e) => { if (e.target.value !== (action.resolution_note || "")) void updateAction(action.id, { resolution_note: e.target.value }); }} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700" placeholder="ระบุวิธีแก้ไขหรือรายละเอียดเพิ่มเติม" /></label>
            </div>)}</div>
          )}
        </section>
      )}

      {selectedInspection && tab !== "history" && setSelectedInspection(null)}
    </div>
  );
}

export default SobprapSafetyChecklistPage;
