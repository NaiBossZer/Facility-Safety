import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, RefreshCw, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export function FacilityInspectionReviewPage({ currentUser, onBack }) {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [selected,setSelected]=useState(null);
  const [reviewNotes,setReviewNotes]=useState("");
  const [riskAssessment,setRiskAssessment]=useState("");
  const [signedEvidence,setSignedEvidence]=useState({});
  const canReview=["safety_officer","safety officer","admin","SUPER_ADMIN","FACILITY_ADMIN"].includes(String(currentUser?.role||"").toLowerCase())||["SUPER_ADMIN","FACILITY_ADMIN"].includes(currentUser?.centralRole);

  const load=useCallback(async()=>{
    setLoading(true);setMessage("");
    const {data,error}=await supabase.from("facility_inspection_records")
      .select("id,building_id,inspector_id,inspection_date,status,template_version,review_notes,risk_assessment,created_at,buildings(name,code),facility_checklist_templates(name),facility_inspection_item_results(id,result,remark,evidence_paths,facility_checklist_template_items(category,title))")
      .order("created_at",{ascending:false}).limit(100);
    if(error)setMessage(error.message);else setRecords(data||[]);
    setLoading(false);
  },[]);
  useEffect(()=>{void load()},[load]);

  const openRecord=async(record)=>{
    setSelected(record);setReviewNotes(record.review_notes||"");setRiskAssessment(record.risk_assessment||"");
    const paths=(record.facility_inspection_item_results||[]).flatMap((item)=>item.evidence_paths||[]);
    const pairs=await Promise.all(paths.map(async(path)=>{
      const {data,error}=await supabase.storage.from("facility-inspection-evidence").createSignedUrl(path,300);
      return [path,error?null:data?.signedUrl];
    }));
    setSignedEvidence(Object.fromEntries(pairs));
  };

  const submitReview=async()=>{
    if(!canReview||!selected)return;
    setBusy(true);setMessage("");
    const {error}=await supabase.from("facility_inspection_records").update({
      status:"reviewed",reviewer_id:currentUser.id,reviewed_at:new Date().toISOString(),
      review_notes:reviewNotes.trim()||null,risk_assessment:riskAssessment.trim()||null,
      updated_at:new Date().toISOString(),
    }).eq("id",selected.id);
    if(error)setMessage(error.message);else{setMessage("บันทึกผลทบทวนโดย Safety Officer แล้ว");setSelected(null);await load();}
    setBusy(false);
  };

  return <div className="mx-auto max-w-6xl space-y-5 animate-fade">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/> กลับ Facility Mapping</button>
    <header><p className="text-xs font-bold tracking-widest text-[#B58A36]">SAFETY REVIEW</p><h1 className="mt-1 text-2xl font-black text-[#123B63]">ทบทวนผลการตรวจอาคาร</h1><p className="mt-1 text-sm text-slate-500">Safety Officer ตรวจสอบรายการไม่ผ่าน ภาพหลักฐาน และบันทึกการประเมินความเสี่ยง</p></header>
    {message&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</div>}
    {!canReview&&<div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">บัญชีนี้ไม่มีสิทธิ์ทบทวนผลตรวจ</div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-extrabold text-[#123B63]">รายการตรวจที่ส่งแล้ว</h2><button onClick={()=>void load()} className="rounded-lg border p-2"><RefreshCw size={15}/></button></div>
      {loading?<p className="p-6 text-center text-sm text-slate-500">กำลังโหลด…</p>:records.length===0?<p className="p-6 text-center text-sm text-slate-500">ยังไม่มีรายการตรวจที่ส่งเข้าระบบ</p>:<div className="space-y-2">{records.map((record)=>{
        const results=record.facility_inspection_item_results||[];
        const failed=results.filter((r)=>r.result==="fail").length;
        return <button key={record.id} onClick={()=>void openRecord(record)} className="flex w-full flex-col gap-2 rounded-xl border p-4 text-left hover:border-[#123B63] sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-bold text-slate-800">{record.buildings?.name||record.building_id}</p><p className="mt-1 text-xs text-slate-500">{record.inspection_date} · {record.facility_checklist_templates?.name||"Checklist"} · Version {record.template_version}</p></div>
          <div className="flex items-center gap-3"><span className="text-xs text-rose-700">ไม่ผ่าน {failed} รายการ</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${record.status==="reviewed"?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}`}>{record.status==="reviewed"?"ทบทวนแล้ว":"รอทบทวน"}</span><Eye size={16} className="text-slate-400"/></div>
        </button>;
      })}</div>}
    </section>
    {selected&&<div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null)}}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#B58A36]">INSPECTION REVIEW</p><h2 className="mt-1 text-xl font-black text-[#123B63]">{selected.buildings?.name||selected.building_id}</h2><p className="text-xs text-slate-500">{selected.inspection_date} · {selected.facility_checklist_templates?.name} v{selected.template_version}</p></div><button onClick={()=>setSelected(null)} className="rounded-lg border px-3 py-2 text-sm">ปิด</button></div>
        <div className="mt-5 space-y-3">{(selected.facility_inspection_item_results||[]).map((item)=> <article key={item.id} className="rounded-xl border p-4">
          <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-[#B58A36]">{item.facility_checklist_template_items?.category}</p><p className="mt-1 font-bold text-slate-800">{item.facility_checklist_template_items?.title}</p>{item.remark&&<p className="mt-2 text-sm text-slate-600">{item.remark}</p>}</div><span className={`rounded-full px-3 py-1 text-xs font-black ${item.result==="fail"?"bg-rose-100 text-rose-800":"bg-emerald-100 text-emerald-800"}`}>{item.result==="fail"?"ไม่ผ่าน":"ผ่าน"}</span></div>
          {!!item.evidence_paths?.length&&<div className="mt-3 grid grid-cols-2 gap-2">{item.evidence_paths.map((path)=><a key={path} href={signedEvidence[path]} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border bg-slate-50">{signedEvidence[path]?<img src={signedEvidence[path]} alt="หลักฐานการตรวจ" className="h-36 w-full object-cover"/>:<span className="grid h-36 place-items-center text-xs text-slate-400">กำลังโหลดภาพ…</span>}</a>)}</div>}
        </article>)}</div>
        <div className="mt-5 grid gap-3">
          <label className="text-sm font-bold text-slate-700">ผลการประเมินความเสี่ยง<textarea value={riskAssessment} onChange={(e)=>setRiskAssessment(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border p-3 text-sm" placeholder="บันทึกการประเมินความเสี่ยงและลำดับความสำคัญ"/></label>
          <label className="text-sm font-bold text-slate-700">ข้อเสนอแนะ / การติดตามแก้ไข<textarea value={reviewNotes} onChange={(e)=>setReviewNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border p-3 text-sm" placeholder="ระบุข้อเสนอแนะหรือแนวทางติดตามแก้ไข (ไม่สร้างใบงานอัตโนมัติ)"/></label>
          <button disabled={!canReview||busy} onClick={()=>void submitReview()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123B63] px-5 py-3 text-sm font-black text-white disabled:opacity-40"><ShieldCheck size={17}/>{busy?"กำลังบันทึก…":"บันทึกผลทบทวน"}</button>
        </div>
      </div>
    </div>}
  </div>;
}
export default FacilityInspectionReviewPage;
