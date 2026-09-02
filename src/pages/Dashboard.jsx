import { useAppData } from "../store/AppDataProvider";
import { Card } from "../components/ui/Card"; // สมมติว่ามีคอมโพเนนต์ Card

export function Dashboard() {
  const { workOrders, goto, setSelectedWO } = useAppData();

  // คำนวณ Stats จาก workOrders
  const stats = {
    total: workOrders.length,
    open: workOrders.filter((w) => w.status < 7).length,
    urgent: workOrders.filter((w) => w.priority === "urgent" && w.status < 7).length,
    done: workOrders.filter((w) => w.status === 7).length,
  };

  const handleSelect = (wo) => {
    setSelectedWO(wo);
    goto("detail");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="ทั้งหมด" value={stats.total} color="text-gray-600" />
        <Card title="กำลังดำเนินการ" value={stats.open} color="text-blue-600" />
        <Card title="เร่งด่วน" value={stats.urgent} color="text-red-600" />
        <Card title="เสร็จสิ้น" value={stats.done} color="text-green-600" />
      </div>

      {/* List Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">รายการล่าสุด</h2>
        <div className="space-y-2">
          {workOrders.map((wo) => (
            <div 
              key={wo.id} 
              onClick={() => handleSelect(wo)}
              className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition"
            >
              {wo.title} - <span className="text-sm text-gray-500">{wo.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}