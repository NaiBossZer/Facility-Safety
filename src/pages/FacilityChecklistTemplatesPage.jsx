import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CopyPlus, Plus, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export function FacilityChecklistTemplatesPage({ currentUser, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [baseTemplateId, setBaseTemplateId] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("facility_checklist_templates")
      .select("id,building_type,name,version,is_active,created_at,facility_checklist_template_items(id,category,title,description,sort_order,requires_photo_on_pass)")
      .order("building_type").order("version", { ascending: false });
    if (error) setMessage(error.message);
    else {
      setTemplates(data || []);
      setSelectedId((current) => current && data?.some((t) => t.id === current) ? current : data?.[0]?.id || "");
    }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selected = templates.find((t) => t.id === selectedId);
  const admin = ["admin","SUPER_ADMIN","FACILITY_ADMIN"].includes(currentUser?.role) || ["SUPER_ADMIN","FACILITY_ADMIN"].includes(currentUser?.centralRole);

  const createVersion = async () => {
    if (!admin || !buildingType.trim() || !templateName.trim()) return;
    setBusy(true); setMessage("");
    try {
      const base = templates.find((t) => t.id === baseTemplateId);
      const version = base && base.building_type === buildingType.trim()
        ? Math.max(...templates.filter((t) => t.building_type === buildingType.trim()).map((t) => t.version)) + 1
        : Math.max(0, ...templates.filter((t) => t.building_type === buildingType.trim()).map((t) => t.version)) + 1;
      const { data, error } = await supabase.from("facility_checklist_templates").insert({
        building_type: buildingType.trim(), name: templateName.trim(), version, is_active: false, created_by: currentUser.id,
      }).select("id").single();
      if (error) throw error;
      if (base?.facility_checklist_template_items?.length) {
        const copies = base.facility_checklist_template_items.map((item, index) => ({
          template_id: data.id, category: item.category, title: item.title,
          description: item.description, sort_order: index + 1, requires_photo_on_pass: item.requires_photo_on_pass,
        }));
        const { error: copyError } = await supabase.from("facility_checklist_template_items").insert(copies);
        if (copyError) throw copyError;
      }
      setMessage("สร้างเวอร์ชันใหม่แล้ว ประวัติการตรวจเดิมยังอ้างอิงเวอร์ชันเดิม");
      setBuildingType(""); setTemplateName(""); setBaseTemplateId("");
      await load(); setSelectedId(data.id);
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  };

  const addItem = async () => {
    if (!admin || !selected || !category.trim() || !title.trim()) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("facility_checklist_template_items").insert({
      template_id: selected.id, category: category.trim(), title: title.trim(),
      description: description.trim() || null,
      sort_order: (selected.facility_checklist_template_items || []).length + 1,
    });
    if (error) setMessage(error.message);
    else { setCategory(""); setTitle(""); setDescription(""); setMessage("เพิ่มรายการตรวจแล้ว"); await load(); }
    setBusy(false);
  };

  const activate = async () => {
    if (!admin || !selected) return;
    setBusy(true); setMessage("");
    const { error: deactivateError } = await supabase.from("facility_checklist_templates")
      .update({ is_active: false }).eq("building_type", selected.building_type);
    if (deactivateError) { setMessage(deactivateError.message); setBusy(false); return; }
    const { error } = await supabase.from("facility_checklist_templates").update({ is_active: true }).eq("id", selected.id);
    setMessage(error?.message || "เปิดใช้งาน Template นี้แล้ว");
    await load(); setBusy(false);
  };

  return <div className="mx-auto max-w-6xl space-y-5 animate-fade">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/> กลับ Facility Mapping</button>
    <header><p className="text-xs font-bold tracking-widest text-[#B58A36]">CHECKLIST GOVERNANCE</p><h1 className="mt-1 text-2xl font-black text-[#123B63]">จัดการแม่แบบตรวจตามประเภทอาคาร</h1><p className="mt-1 text-sm text-slate-500">แยกประเภทอาคารและเก็บเวอร์ชันเพื่อรักษาความหมายของประวัติการตรวจเดิม</p></header>
    {message && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</div>}
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-extrabold text-[#123B63]">สร้าง Template / Version</h2><CopyPlus size={18} className="text-slate-400"/></div>
        <label className="block text-sm font-semibold">ประเภทอาคาร<input value={buildingType} onChange={(e)=>setBuildingType(e.target.value)} placeholder="เช่น office, greenhouse, warehouse" className="mt-1 w-full rounded-lg border p-2.5"/></label>
        <label className="block text-sm font-semibold">ชื่อแม่แบบ<input value={templateName} onChange={(e)=>setTemplateName(e.target.value)} placeholder="แบบตรวจความปลอดภัยอาคารสำนักงาน" className="mt-1 w-full rounded-lg border p-2.5"/></label>
        <label className="block text-sm font-semibold">คัดลอกรายการจากเวอร์ชันเดิม (ถ้ามี)<select value={baseTemplateId} onChange={(e)=>setBaseTemplateId(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"><option value="">เริ่มต้นใหม่</option>{templates.map((t)=><option key={t.id} value={t.id}>{t.building_type} · v{t.version} · {t.name}</option>)}</select></label>
        <button disabled={!admin || busy || !buildingType.trim() || !templateName.trim()} onClick={()=>void createVersion()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B63] p-3 text-sm font-bold text-white disabled:opacity-40"><Plus size={16}/> สร้างเวอร์ชัน</button>
        {!admin && <p className="text-xs text-rose-600">ต้องใช้สิทธิ์ Facility Admin เพื่อจัดการ Template</p>}
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-extrabold text-[#123B63]">รายการ Template</h2><button onClick={()=>void load()} className="rounded-lg border p-2"><RefreshCw size={15}/></button></div>
        {loading ? <p className="text-sm text-slate-500">กำลังโหลด…</p> : <div className="flex flex-wrap gap-2">{templates.map((t)=><button key={t.id} onClick={()=>setSelectedId(t.id)} className={`rounded-xl border px-3 py-2 text-left ${selectedId===t.id?"border-[#123B63] bg-blue-50":"border-slate-200"}`}><p className="text-sm font-bold">{t.building_type} · v{t.version}</p><p className="text-xs text-slate-500">{t.name} {t.is_active ? "· ใช้งาน" : ""}</p></button>)}</div>}
        {selected && <div className="border-t pt-4">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-extrabold text-slate-800">{selected.name}</h3><p className="text-xs text-slate-500">{selected.building_type} · Version {selected.version}</p></div><button disabled={!admin || busy || selected.is_active} onClick={()=>void activate()} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">{selected.is_active ? "กำลังใช้งาน" : "เปิดใช้งานเวอร์ชันนี้"}</button></div>
          <ol className="mt-3 space-y-2">{(selected.facility_checklist_template_items||[]).map((item,i)=><li key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="text-[11px] font-bold text-[#B58A36]">{item.category}</p><p className="text-sm font-semibold text-slate-800">{i+1}. {item.title}</p>{item.description&&<p className="mt-1 text-xs text-slate-500">{item.description}</p>}</li>)}</ol>
          <div className="mt-4 grid gap-2 sm:grid-cols-2"><input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="หมวดตรวจ" className="rounded-lg border p-2.5 text-sm"/><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="รายการตรวจ" className="rounded-lg border p-2.5 text-sm"/><input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" className="rounded-lg border p-2.5 text-sm sm:col-span-2"/><button disabled={!admin||busy||selected.is_active||!category.trim()||!title.trim()} onClick={()=>void addItem()} className="rounded-lg border border-[#123B63] px-3 py-2 text-sm font-bold text-[#123B63] disabled:opacity-40 sm:col-span-2">{selected.is_active ? "เวอร์ชันนี้เปิดใช้งานแล้ว — สร้างเวอร์ชันใหม่เพื่อแก้ไข" : "เพิ่มรายการตรวจ"}</button></div>
        </div>}
      </section>
    </div>
  </div>;
}
export default FacilityChecklistTemplatesPage;
