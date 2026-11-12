import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Building2, Upload, RefreshCw, X, MapPin, ListFilter, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import fy2570Source from "../data/facilityMaintenanceFY2570.json";

const MONTHS = [
  { key: "10", name: "ตุลาคม", year: 2569 }, { key: "11", name: "พฤศจิกายน", year: 2569 },
  { key: "12", name: "ธันวาคม", year: 2569 }, { key: "01", name: "มกราคม", year: 2570 },
  { key: "02", name: "กุมภาพันธ์", year: 2570 }, { key: "03", name: "มีนาคม", year: 2570 },
  { key: "04", name: "เมษายน", year: 2570 }, { key: "05", name: "พฤษภาคม", year: 2570 },
  { key: "06", name: "มิถุนายน", year: 2570 }, { key: "07", name: "กรกฎาคม", year: 2570 },
  { key: "08", name: "สิงหาคม", year: 2570 }, { key: "09", name: "กันยายน", year: 2570 },
];
const isAdmin = (user) => ["admin", "SUPER_ADMIN", "FACILITY_ADMIN"].includes(user?.role) ||
  ["SUPER_ADMIN", "FACILITY_ADMIN"].includes(user?.centralRole);

function getTaskWeeks(task, monthKey) {
  return (task.planned_weeks || []).filter((week) => week.startsWith(`${monthKey}-`))
    .map((week) => Number(week.split("-W")[1])).filter(Number.isFinite);
}

export function FacilityMappingPage({ currentUser, onNavigate }) {
  const [tab, setTab] = useState("overview");
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState("");
  const [groups, setGroups] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [monthIndex, setMonthIndex] = useState(0);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [systemFilter, setSystemFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [editingBuildingId, setEditingBuildingId] = useState("");
  const [buildingTypeDraft, setBuildingTypeDraft] = useState("");

  const admin = isAdmin(currentUser);
  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const [planResult, buildingResult] = await Promise.all([
      supabase.from("facility_fiscal_year_plans")
        .select("id,fiscal_year,title,starts_on,ends_on,facility_maintenance_groups(id,source_number,name,facility_maintenance_tasks(id,source_row,description,frequency_text,planned_weeks,source_note,facility_maintenance_task_buildings(building_id)))")
        .order("fiscal_year", { ascending: false }),
      supabase.from("buildings").select("id,name,code,building_type,active").order("order"),
    ]);
    if (planResult.error) setMessage(`ยังโหลดแผนไม่ได้: ${planResult.error.message}`);
    else {
      const nextPlans = planResult.data || [];
      setPlans(nextPlans);
      setPlanId((current) => current && nextPlans.some((p) => p.id === current) ? current : nextPlans[0]?.id || "");
    }
    if (buildingResult.error) setMessage((current) => current || `โหลดรายชื่ออาคารไม่ได้: ${buildingResult.error.message}`);
    else setBuildings(buildingResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const activePlan = plans.find((p) => p.id === planId) || null;
  const allTasks = useMemo(() => (activePlan?.facility_maintenance_groups || [])
    .flatMap((group) => (group.facility_maintenance_tasks || []).map((task) => ({
      ...task, groupId: group.id, groupName: group.name, groupNumber: group.source_number,
      buildingIds: (task.facility_maintenance_task_buildings || []).map((link) => link.building_id),
    }))), [activePlan]);

  const visibleTasks = useMemo(() => allTasks.filter((task) => {
    const systemOk = systemFilter === "all" || String(task.groupNumber) === systemFilter;
    const buildingOk = buildingFilter === "all" ||
      (buildingFilter === "campus" ? task.buildingIds.length === 0 : task.buildingIds.includes(buildingFilter));
    return systemOk && buildingOk;
  }), [allTasks, systemFilter, buildingFilter]);

  const monthTasks = useMemo(() => visibleTasks.flatMap((task) =>
    getTaskWeeks(task, MONTHS[monthIndex].key).map((week) => ({ ...task, week }))
  ).sort((a, b) => a.week - b.week || a.groupNumber - b.groupNumber), [visibleTasks, monthIndex]);

  const importPlan = async () => {
    if (!admin) return;
    setBusy(true); setMessage("");
    try {
      const { data: existing, error: findError } = await supabase.from("facility_fiscal_year_plans")
        .select("id").eq("fiscal_year", 2570).maybeSingle();
      if (findError) throw findError;
      if (existing?.id) {
        setMessage("มีแผนปีงบประมาณ 2570 อยู่แล้ว ระบบจะไม่เขียนทับข้อมูลเดิม");
        await load();
        return;
      }
      const { data: plan, error: planError } = await supabase.from("facility_fiscal_year_plans").insert({
        fiscal_year: fy2570Source.fiscal_year, title: fy2570Source.title,
        starts_on: fy2570Source.starts_on, ends_on: fy2570Source.ends_on,
        source_workbook: fy2570Source.source_workbook, source_sheet: fy2570Source.source_sheet,
        source_metadata: { week_marker_color: fy2570Source.week_marker_color, schedule_semantics: fy2570Source.schedule_semantics },
        created_by: currentUser.id,
      }).select("id").single();
      if (planError) throw planError;
      for (const group of fy2570Source.groups) {
        const { data: savedGroup, error: groupError } = await supabase.from("facility_maintenance_groups")
          .insert({ plan_id: plan.id, source_number: group.number, name: group.name, sort_order: group.number })
          .select("id").single();
        if (groupError) throw groupError;
        const rows = group.tasks.map((task, index) => ({
          group_id: savedGroup.id, source_row: task.source_row, description: task.description,
          frequency_text: task.frequency, planned_weeks: task.planned_weeks,
          source_note: task.source_note || null, sort_order: index + 1,
        }));
        const { error: tasksError } = await supabase.from("facility_maintenance_tasks").insert(rows);
        if (tasksError) throw tasksError;
      }
      setMessage("นำเข้าแผน FY2570 สำเร็จ: 10 ระบบ 39 รายการ โดยไม่สร้างงานตรวจหรือใบงานอัตโนมัติ");
      await load();
    } catch (error) {
      setMessage(`นำเข้าไม่สำเร็จ: ${error.message}`);
    } finally { setBusy(false); }
  };

  const openTask = (task) => {
    setSelectedTask(task);
    setSelectedBuildings(task.buildingIds || []);
  };

  const saveTaskBuildings = async () => {
    if (!admin || !selectedTask) return;
    setBusy(true); setMessage("");
    try {
      const { error: deleteError } = await supabase.from("facility_maintenance_task_buildings")
        .delete().eq("task_id", selectedTask.id);
      if (deleteError) throw deleteError;
      if (selectedBuildings.length) {
        const { error: insertError } = await supabase.from("facility_maintenance_task_buildings")
          .insert(selectedBuildings.map((building_id) => ({ task_id: selectedTask.id, building_id })));
        if (insertError) throw insertError;
      }
      setMessage("บันทึกขอบเขตอาคารของรายการแผนแล้ว");
      setSelectedTask(null);
      await load();
    } catch (error) { setMessage(`บันทึกไม่ได้: ${error.message}`); }
    finally { setBusy(false); }
  };

  const startInspection = (buildingId) => {
    if (!buildingId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("building_id", buildingId);
    url.searchParams.set("facility_page", "inspection");
    window.history.pushState({}, "", url);
    onNavigate?.("facility-inspection");
    setSelectedTask(null);
  };

  const tabs = [
    ["overview", "ภาพรวม", CalendarDays],
    ["calendar", "ปฏิทินแผนงาน", CalendarDays],
    ["buildings", "อาคารและพื้นที่", Building2],
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B58A36]">FACILITY MANAGEMENT</p>
          <h1 className="mt-1 text-2xl font-black text-[#123B63] sm:text-3xl">Facility Mapping &amp; Maintenance</h1>
          <p className="mt-1 text-sm text-slate-500">แผนส่วนกลาง · ปฏิทินรายเดือน · ตรวจอาคารตามประเภท</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
            {plans.length ? plans.map((plan) => <option key={plan.id} value={plan.id}>ปีงบประมาณ {plan.fiscal_year}</option>) : <option value="">ยังไม่มีแผน</option>}
          </select>
          <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><RefreshCw size={16}/> รีเฟรช</button>
          {admin && !plans.some((p) => p.fiscal_year === 2570) && (
            <button disabled={busy} onClick={() => void importPlan()} className="inline-flex items-center gap-2 rounded-xl bg-[#123B63] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Upload size={16}/> นำเข้าแผน FY2570</button>
          )}
        </div>
      </div>

      {message && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-bold ${tab === id ? "border-[#D6A84F] text-[#123B63]" : "border-transparent text-slate-500 hover:text-slate-800"}`}><Icon size={16}/>{label}</button>)}
      </div>

      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">กำลังโหลดข้อมูล Facility Mapping…</div> : (
        <>
          {tab === "overview" && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["ระบบงาน", activePlan?.facility_maintenance_groups?.length || 0, "กลุ่มในแผนปีที่เลือก"],
              ["รายการแผน", allTasks.length, "รายการบำรุงรักษา"],
              ["อาคาร", buildings.length, "ข้อมูลอาคารในฐานข้อมูล"],
              ["ปีงบประมาณ", activePlan?.fiscal_year || "—", activePlan ? `${activePlan.starts_on} ถึง ${activePlan.ends_on}` : "ยังไม่มีแผน"],
            ].map(([label, value, sub]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-[#123B63]">{value}</p><p className="mt-1 text-xs text-slate-400">{sub}</p></div>)}
            <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2"><ShieldCheck className="text-[#B58A36]" size={20}/><h2 className="font-extrabold text-[#123B63]">หลักการทำงานของแผน</h2></div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <li>• สีส้มในต้นฉบับแสดงสัปดาห์ที่วางแผนไว้</li>
                <li>• ความถี่ว่างจะคงเป็นค่าว่าง ไม่อนุมานเอง</li>
                <li>• งานที่ไม่ผูกอาคารถือเป็นแผนระดับศูนย์</li>
                <li>• แผนไม่สร้างการตรวจ ใบงาน หรือการแจ้งเตือนอัตโนมัติ</li>
              </ul>
            </div>
          </div>}

          {tab === "calendar" && <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3"><button onClick={() => setMonthIndex((v) => (v + 11) % 12)} className="rounded-lg border p-2"><ChevronLeft size={18}/></button><div><h2 className="text-lg font-black text-[#123B63]">{MONTHS[monthIndex].name} {MONTHS[monthIndex].year + 543 - 543}</h2><p className="text-xs text-slate-500">ปีงบประมาณ 2570 · แสดงสัปดาห์ตามเครื่องหมายสีส้ม</p></div><button onClick={() => setMonthIndex((v) => (v + 1) % 12)} className="rounded-lg border p-2"><ChevronRight size={18}/></button></div>
              <div className="flex flex-wrap gap-2">
                <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="all">ทุกระบบงาน</option>{(activePlan?.facility_maintenance_groups || []).map((g) => <option key={g.id} value={String(g.source_number)}>{g.name}</option>)}</select>
                <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="all">ทุกขอบเขต</option><option value="campus">งานส่วนกลาง</option>{buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[1,2,3,4,5].map((week) => {
                const weekTasks = monthTasks.filter((task) => task.week === week);
                return <section key={week} className="min-h-36 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#123B63]">สัปดาห์ที่ {week}</h3><span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">{weekTasks.length} รายการ</span></div>
                  <div className="space-y-2">{weekTasks.map((task) => <button key={task.id + task.week} onClick={() => openTask(task)} className="w-full rounded-xl border border-orange-200 bg-orange-50 p-3 text-left hover:border-orange-400 hover:bg-orange-100"><p className="text-[11px] font-bold text-orange-800">{task.groupName}</p><p className="mt-1 text-sm font-semibold leading-snug text-slate-800">{task.description}</p><p className="mt-1 text-[11px] text-slate-500">{task.frequency_text || "ไม่ระบุความถี่"}</p></button>)}</div>
                </section>;
              })}
            </div>
            {!monthTasks.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">ไม่มีรายการที่ทำเครื่องหมายไว้ในเดือนนี้ตามตัวกรอง</div>}
          </div>}

          {tab === "buildings" && <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-[#123B63]">ทะเบียนอาคาร</h2><p className="text-sm text-slate-500">ข้อมูลจริงจาก public.buildings — ไม่สร้างชื่ออาคารหรือพิกัดสมมติ</p></div><Building2 className="text-slate-400"/></div>
            {buildings.length ? <div className="grid gap-3 md:grid-cols-2">{buildings.map((b) => <div key={b.id} className="rounded-xl border p-4"><p className="font-bold text-slate-800">{b.name}</p><p className="mt-1 text-xs text-slate-500">{b.code || "ไม่มีรหัส"} · {b.building_type || "ยังไม่กำหนดประเภท"}</p>{admin && <div className="mt-3 flex gap-2"><input value={editingBuildingId === b.id ? buildingTypeDraft : (b.building_type || "")} onFocus={() => { setEditingBuildingId(b.id); setBuildingTypeDraft(b.building_type || ""); }} onChange={(e) => setBuildingTypeDraft(e.target.value)} placeholder="building_type เช่น office" className="min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-xs"/><button onClick={async () => { setBusy(true); const {error}=await supabase.from("buildings").update({building_type:buildingTypeDraft.trim() || null}).eq("id",b.id); setMessage(error ? error.message : "บันทึกประเภทอาคารแล้ว"); setEditingBuildingId(""); await load(); setBusy(false); }} disabled={busy || editingBuildingId !== b.id} className="rounded-lg border px-3 py-1.5 text-xs font-bold">บันทึกประเภท</button></div>}<button onClick={() => startInspection(b.id)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#123B63] px-3 py-2 text-xs font-bold text-white"><ClipboardCheck size={14}/> เปิดหน้าตรวจอาคาร</button></div>)}</div> : <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">ยังไม่มีข้อมูลอาคารในฐานข้อมูล กรุณาเพิ่มทะเบียนอาคารจริงก่อนเชื่อม GLB และเปิดการตรวจ</div>}
          </div>}
        </>
      )}

      {selectedTask && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedTask(null); }}>
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#B58A36]">{selectedTask.groupName}</p><h2 className="mt-1 text-xl font-black text-[#123B63]">รายละเอียดรายการแผน</h2></div><button onClick={() => setSelectedTask(null)} className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div>
          <p className="mt-4 font-semibold text-slate-800">{selectedTask.description}</p>
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><p>ความถี่: {selectedTask.frequency_text || "ไม่ได้ระบุในต้นฉบับ"}</p><p className="mt-1">สัปดาห์ที่วางแผน: {getTaskWeeks(selectedTask, MONTHS[monthIndex].key).join(", ") || "—"}</p>{selectedTask.source_note && <p className="mt-1">หมายเหตุ: {selectedTask.source_note}</p>}</div>
          <div className="mt-5"><h3 className="text-sm font-extrabold text-slate-800">ขอบเขตอาคารที่เกี่ยวข้อง</h3><p className="mt-1 text-xs text-slate-500">ไม่เลือกอาคาร = งานส่วนกลาง · เลือกได้หลายอาคาร</p>
            <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-xl border p-3">{buildings.map((building) => <label key={building.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedBuildings.includes(building.id)} disabled={!admin} onChange={(e) => setSelectedBuildings((list) => e.target.checked ? [...list, building.id] : list.filter((id) => id !== building.id))}/>{building.name}</label>)}{!buildings.length && <p className="text-sm text-slate-500">ยังไม่มีทะเบียนอาคาร</p>}</div>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {admin && <button disabled={busy} onClick={() => void saveTaskBuildings()} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">บันทึกขอบเขตอาคาร</button>}
            {selectedBuildings.map((id) => <button key={id} onClick={() => startInspection(id)} className="rounded-xl bg-[#123B63] px-4 py-2 text-sm font-bold text-white">ไปหน้าตรวจ: {buildings.find((b) => b.id === id)?.name || id}</button>)}
            <button onClick={() => setSelectedTask(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">ปิด</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default FacilityMappingPage;
