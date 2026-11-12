import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, UserCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export function FacilityAssignmentsPage({ currentUser, onBack }) {
  const [buildings,setBuildings]=useState([]);
  const [inspectors,setInspectors]=useState([]);
  const [assignments,setAssignments]=useState([]);
  const [buildingId,setBuildingId]=useState("");
  const [selectedUsers,setSelectedUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const admin=["admin","SUPER_ADMIN","FACILITY_ADMIN"].includes(currentUser?.role)||["SUPER_ADMIN","FACILITY_ADMIN"].includes(currentUser?.centralRole);

  const load=useCallback(async()=>{
    setLoading(true); setMessage("");
    const [b,p,a]=await Promise.all([
      supabase.from("buildings").select("id,name,code").order("order"),
      supabase.from("staff_profiles").select("user_id,full_name,role,central_role,active").eq("active",true).order("full_name"),
      supabase.from("facility_building_inspector_assignments").select("building_id,user_id,created_at"),
    ]);
    const err=b.error||p.error||a.error;
    if(err) setMessage(err.message);
    setBuildings(b.data||[]);
    setInspectors((p.data||[]).filter((u)=>["building_inspector","building inspector","inspector"].includes(String(u.role||"").toLowerCase())));
    setAssignments(a.data||[]);
    setLoading(false);
  },[]);
  useEffect(()=>{void load()},[load]);
  useEffect(()=>{setSelectedUsers(assignments.filter((a)=>a.building_id===buildingId).map((a)=>a.user_id))},[assignments,buildingId]);

  const save=async()=>{
    if(!admin||!buildingId)return;
    setBusy(true);setMessage("");
    const {error:delError}=await supabase.from("facility_building_inspector_assignments").delete().eq("building_id",buildingId);
    if(delError){setMessage(delError.message);setBusy(false);return}
    if(selectedUsers.length){
      const {error}=await supabase.from("facility_building_inspector_assignments").insert(selectedUsers.map((user_id)=>({building_id:buildingId,user_id,assigned_by:currentUser.id})));
      if(error){setMessage(error.message);setBusy(false);return}
    }
    setMessage("บันทึกผู้ตรวจที่ได้รับมอบหมายแล้ว");
    await load();setBusy(false);
  };

  return <div className="mx-auto max-w-5xl space-y-5 animate-fade">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/> กลับ Facility Mapping</button>
    <header><p className="text-xs font-bold tracking-widest text-[#B58A36]">ACCESS CONTROL</p><h1 className="mt-1 text-2xl font-black text-[#123B63]">มอบหมายผู้ตรวจอาคาร</h1><p className="mt-1 text-sm text-slate-500">Building Inspector ตรวจได้เฉพาะอาคารที่ได้รับมอบหมาย · Safety Officer และ Facility Admin มีสิทธิ์ตามบทบาท</p></header>
    {message&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><h2 className="font-extrabold text-[#123B63]">เลือกอาคาร</h2><button onClick={()=>void load()} className="rounded-lg border p-2"><RefreshCw size={15}/></button></div>
      {loading?<p className="mt-4 text-sm text-slate-500">กำลังโหลดข้อมูล…</p>:!buildings.length?<p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">ยังไม่มีทะเบียนอาคาร กรุณาสร้างข้อมูลอาคารก่อนกำหนดผู้ตรวจ</p>:<>
        <select value={buildingId} onChange={(e)=>setBuildingId(e.target.value)} className="mt-3 w-full rounded-xl border p-3 text-sm"><option value="">เลือกอาคาร…</option>{buildings.map((b)=><option key={b.id} value={b.id}>{b.name} ({b.code||b.id})</option>)}</select>
        {buildingId&&<div className="mt-4 space-y-3">
          <div className="flex items-center gap-2"><UserCheck size={18} className="text-[#B58A36]"/><h3 className="font-bold text-slate-800">รายชื่อ Building Inspector</h3></div>
          {!inspectors.length?<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">ไม่พบผู้ใช้ที่กำหนด role เป็น building_inspector ใน staff_profiles กรุณากำหนดบทบาทก่อน</p>:inspectors.map((user)=><label key={user.user_id} className="flex items-center gap-3 rounded-xl border p-3 text-sm"><input type="checkbox" checked={selectedUsers.includes(user.user_id)} disabled={!admin} onChange={(e)=>setSelectedUsers((old)=>e.target.checked?[...old,user.user_id]:old.filter((id)=>id!==user.user_id))}/><span><strong>{user.full_name||user.user_id}</strong><span className="ml-2 text-xs text-slate-500">{user.role}</span></span></label>)}
          <button disabled={!admin||busy||!inspectors.length} onClick={()=>void save()} className="rounded-xl bg-[#123B63] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{busy?"กำลังบันทึก…":"บันทึกการมอบหมาย"}</button>
        </div>}
      </>}
      {!admin&&<p className="mt-3 text-xs text-rose-600">ต้องใช้สิทธิ์ Facility Admin เพื่อจัดการการมอบหมาย</p>}
    </section>
  </div>;
}
export default FacilityAssignmentsPage;
