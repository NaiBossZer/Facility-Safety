import { useAppData } from "../store/AppDataProvider";
import { Card } from "../components/ui/Card";
import { AlertTriangle, CheckCircle2, Wrench, Clock } from "lucide-react";

export function Dashboard() {
  const { stats } = useAppData();

  const metrics = [
    { label: "งานทั้งหมด", val: stats.total, icon: ClipboardCheck, color: "text-slate-600" },
    { label: "กำลังดำเนินการ", val: stats.open, icon: Wrench, color: "text-blue-600" },
    { label: "เร่งด่วน", val: stats.urgent, icon: AlertTriangle, color: "text-red-600" },
    { label: "เสร็จสิ้น", val: stats.done, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">สรุปภาพรวม</h2>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <div className="flex items-center gap-3">
              <m.icon className={cx("h-8 w-8", m.color)} />
              <div>
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="text-2xl font-bold text-slate-800">{m.val}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* ส่วนตารางงานด่วนจะเพิ่มในขั้นตอนถัดไป */}
    </div>
  );
}