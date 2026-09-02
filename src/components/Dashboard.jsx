import { useAppData } from '../store/AppDataProvider';
import { Card, CardHeader } from './ui/Card';
import { IconButton } from './ui/IconButton';

const Dashboard = () => {
  const { workOrders } = useAppData();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Card>
        <CardHeader 
          title="ใบสั่งงานล่าสุด" 
          subtitle="รายการสถานะงานซ่อมบำรุงในปัจจุบัน" 
        />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-700">ID</th>
                <th className="p-4 text-sm font-semibold text-slate-700">รายละเอียด</th>
                <th className="p-4 text-sm font-semibold text-slate-700">สถานะ</th>
                <th className="p-4 text-sm font-semibold text-slate-700 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders?.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-900">{wo.id}</td>
                  <td className="p-4 text-sm text-slate-600">{wo.description}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {wo.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <IconButton 
                      icon="edit" 
                      onClick={() => console.log('Edit', wo.id)} 
                      className="text-slate-500 hover:text-blue-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;