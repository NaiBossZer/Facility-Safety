import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, ImagePlus, Loader2, XCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function FacilityInspectionPage({ currentUser, onBack }) {
  const params = new URLSearchParams(window.location.search);
  const buildingId = params.get("building_id");
  const [building, setBuilding] = useState(null);
  const [template, setTemplate] = useState(null);
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [inspectionId, setInspectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!buildingId) { setError("ไม่พบ building_id กรุณาเลือกอาคารจาก Facility Mapping"); setLoading(false); return; }
      const { data: buildingData, error: buildingError } = await supabase.from("buildings")
        .select("id,name,code,building_type").eq("id", buildingId).maybeSingle();
      if (!active) return;
      if (buildingError || !buildingData) { setError(buildingError?.message || "ไม่พบข้อมูลอาคาร"); setLoading(false); return; }
      setBuilding(buildingData);
      if (!buildingData.building_type) { setError("อาคารนี้ยังไม่ได้กำหนดประเภท กรุณาให้ Admin กำหนดประเภทอาคารก่อนเริ่มตรวจ"); setLoading(false); return; }
      const { data: templateData, error: templateError } = await supabase.from("facility_checklist_templates")
        .select("id,name,building_type,version,facility_checklist_template_items(id,category,title,description,sort_order,requires_photo_on_pass)")
        .eq("building_type", buildingData.building_type).eq("is_active", true).order("version", { ascending: false }).limit(1).maybeSingle();
      if (!active) return;
      if (templateError) setError(templateError.message);
      else if (!templateData) setError("ยังไม่มี Checklist Template ที่เปิดใช้งานสำหรับประเภทอาคารนี้");
      else {
        setTemplate(templateData);
        setItems((templateData.facility_checklist_template_items || []).sort((a,b) => a.sort_order - b.sort_order));
      }
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [buildingId]);

  const complete = useMemo(() => items.every((item) => {
    const answer = answers[item.id];
    if (!answer?.result) return false;
    if (answer.result === "fail") return Boolean(answer.remark?.trim()) && answer.files?.length >= 1 && answer.files?.length <= 2;
    if (item.requires_photo_on_pass) return answer.files?.length >= 1 && answer.files?.length <= 2;
    return (answer.files?.length || 0) <= 2;
  }), [items, answers]);

  const updateAnswer = (itemId, patch) => setAnswers((current) => ({
    ...current, [itemId]: { ...(current[itemId] || { result: "", remark: "", files: [] }), ...patch },
  }));

  const validateFiles = (files) => {
    if (files.length > 2) return "แนบรูปได้สูงสุด 2 รูปต่อรายการ";
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) return "รองรับเฉพาะ JPG, PNG และ WEBP";
      if (file.size > MAX_FILE_SIZE) return "รูปภาพต้องมีขนาดไม่เกิน 5 MB ต่อรูป";
    }
    return "";
  };

  const submit = async () => {
    setError(""); setSuccess("");
    if (!complete) { setError("กรุณาเลือกผลตรวจให้ครบทุกข้อ และรายการไม่ผ่านต้องกรอกรายละเอียดพร้อมแนบรูป 1–2 รูป"); return; }
    setSaving(true);
    try {
      let recordId = inspectionId;
      if (!recordId) {
        const { data, error: createError } = await supabase.from("facility_inspection_records").insert({
          building_id: building.id, template_id: template.id, template_version: template.version,
          inspector_id: currentUser.id, inspection_date: new Date().toISOString().slice(0,10), status: "draft",
        }).select("id").single();
        if (createError) throw createError;
        recordId = data.id;
        setInspectionId(recordId);
      }
      const rows = [];
      for (const item of items) {
        const answer = answers[item.id];
        const evidencePaths = [];
        for (const file of (answer.files || [])) {
          const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
          const path = `${recordId}/${item.id}/${crypto.randomUUID()}.${extension}`;
          const { error: uploadError } = await supabase.storage.from("facility-inspection-evidence")
            .upload(path, file, { contentType: file.type, upsert: false });
          if (uploadError) throw uploadError;
          evidencePaths.push(path);
        }
        rows.push({
          inspection_id: recordId, template_item_id: item.id, result: answer.result,
          remark: answer.remark?.trim() || null, evidence_paths: evidencePaths,
        });
      }
      const { error: resultsError } = await supabase.from("facility_inspection_item_results")
        .upsert(rows, { onConflict: "inspection_id,template_item_id" });
      if (resultsError) throw resultsError;
      const { error: submitError } = await supabase.from("facility_inspection_records")
        .update({ status: "submitted", updated_at: new Date().toISOString() }).eq("id", recordId);
      if (submitError) throw submitError;
      setSuccess("ส่งผลตรวจอาคารเรียบร้อยแล้ว");
    } catch (e) { setError(e.message || "ไม่สามารถบันทึกผลตรวจได้"); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 animate-fade">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#123B63]"><ArrowLeft size={16}/> กลับ Facility Mapping</button>
      <header className="rounded-2xl bg-[#123B63] p-6 text-white">
        <p className="text-xs font-bold tracking-widest text-[#E6C477]">BUILDING INSPECTION</p>
        <h1 className="mt-2 text-2xl font-black">ตรวจอาคารตามแบบประเมินมาตรฐาน</h1>
        {building && <p className="mt-2 text-sm text-blue-100">{building.name} · {building.code || "ไม่มีรหัส"} · {building.building_type}</p>}
        {template && <p className="mt-1 text-xs text-blue-200">{template.name} · Version {template.version}</p>}
      </header>
      {loading && <div className="rounded-xl bg-white p-8 text-center text-slate-500"><Loader2 className="mx-auto animate-spin"/>กำลังโหลดแบบตรวจ…</div>}
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>}
      {!loading && items.map((item, index) => {
        const answer = answers[item.id] || { result: "", remark: "", files: [] };
        return <section key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-[#123B63]">{index + 1}</span><div className="min-w-0"><p className="text-xs font-bold text-[#B58A36]">{item.category}</p><h2 className="mt-1 font-extrabold text-slate-800">{item.title}</h2>{item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}</div></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => updateAnswer(item.id,{result:"pass"})} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold ${answer.result === "pass" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600"}`}><CheckCircle2 size={18}/> ผ่าน (Pass)</button>
            <button type="button" onClick={() => updateAnswer(item.id,{result:"fail"})} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold ${answer.result === "fail" ? "border-rose-500 bg-rose-50 text-rose-800" : "border-slate-200 text-slate-600"}`}><XCircle size={18}/> ไม่ผ่าน (Fail)</button>
          </div>
          {answer.result && <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
            {answer.result === "fail" && <label className="block text-sm font-bold text-slate-700">รายละเอียดปัญหา <span className="text-rose-600">*</span><textarea value={answer.remark} onChange={(e) => updateAnswer(item.id,{remark:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm" placeholder="ระบุสิ่งที่พบ ตำแหน่ง และรายละเอียดปัญหา"/></label>}
            <label className="block text-sm font-bold text-slate-700">รูปถ่ายหลักฐาน {answer.result === "fail" ? <span className="text-rose-600">* (1–2 รูป)</span> : item.requires_photo_on_pass ? <span className="text-rose-600">* (1–2 รูป)</span> : "(ไม่บังคับ, สูงสุด 2 รูป)"}
              <span className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600"><ImagePlus size={18}/> เลือกรูปภาพ<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { const files=Array.from(e.target.files || []); const problem=validateFiles(files); if(problem) setError(problem); else { setError(""); updateAnswer(item.id,{files}); } }}/></span>
            </label>
            {!!answer.files?.length && <p className="text-xs text-slate-500">เลือกแล้ว {answer.files.length} รูป: {answer.files.map((file) => file.name).join(", ")}</p>}
          </div>}
          {answer.result === "pass" && !item.requires_photo_on_pass && <label className="mt-3 block text-xs text-slate-500">หมายเหตุ (ไม่บังคับ)<input value={answer.remark} onChange={(e) => updateAnswer(item.id,{remark:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="หมายเหตุเพิ่มเติม"/></label>}
        </section>;
      })}
      {!loading && items.length > 0 && <div className="sticky bottom-3 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600">ตอบแล้ว {items.filter((item) => answers[item.id]?.result).length} / {items.length} รายการ</p><button disabled={saving || !complete} onClick={() => void submit()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123B63] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{saving ? <Loader2 className="animate-spin" size={16}/> : <ClipboardCheck size={16}/>} ส่งผลการตรวจ</button></div>}
    </div>
  );
}

export default FacilityInspectionPage;
