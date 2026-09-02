function DashboardPage({ workOrders, inspections, goto, setSelectedWO }) {
  // 1. คำนวณ Stats จาก workOrders ที่ส่งเข้ามา
  const stats = {
    total: workOrders.length,
    open: workOrders.filter(w => w.status < 7).length,
    urgent: workOrders.filter(w => w.priority === "urgent" && w.status < 7).length,
    done: workOrders.filter(w => w.status === 7).length
  };

  const metrics = [
    { label: "งานทั้งหมด", val: stats.total, icon: ClipboardCheck, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "กำลังดำเนินการ", val: stats.open, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "เร่งด่วน", val: stats.urgent, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "เสร็จสิ้น", val: stats.done, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 animate-fade">
      {/* 2. แสดง Metric สรุปภาพรวมแบบของเดิม */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cx("rounded-xl p-2.5", m.bg)}>
                <m.icon className={cx("h-6 w-6", m.color)} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="text-2xl font-bold text-slate-800">{m.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. เสริมด้วยเนื้อหาเพิ่มเติมจากที่ออกแบบไว้ (Recent Activities) */}
      <SectionTitle icon={Wrench} title="ใบแจ้งซ่อมล่าสุด" desc="รายการความเคลื่อนไหวล่าสุดในระบบ" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {[...workOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((w) => (
            <button key={w.id} onClick={() => { setSelectedWO(w.id); goto("workorder"); }}
              className="grid w-full grid-cols-1 gap-2 px-4 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-12">
              <span className="col-span-3 font-mono text-xs text-slate-500">{w.id}</span>
              <span className="col-span-6 truncate text-sm font-semibold text-slate-700">{w.title}</span>
              <span className="col-span-3 text-right">
                <Badge className={st(w.status).soft}>{st(w.status).name}</Badge>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}