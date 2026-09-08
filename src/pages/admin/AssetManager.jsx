// ============================================================
// AssetManager.jsx — Master Data: ครุภัณฑ์และระบบหลักของอาคารสถานที่
// ============================================================
import React, { useState, useMemo } from "react";
import {
  Wrench,
  Search,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Archive,
  Edit2,
  X,
  ShieldAlert,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { fmt } from "../../lib/helpers";

export function AssetManager() {
  const { assets, addAsset, updateAsset, deleteAsset, cat } = useAppData();
  const buildings = cat?.buildings || [];
  const categories = cat?.categories || [];

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const filteredAssets = useMemo(() => {
    return (assets || []).filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.name?.toLowerCase().includes(q) ||
        a.code?.toLowerCase().includes(q) ||
        a.responsiblePerson?.toLowerCase().includes(q);
      const matchCat = filterCat === "all" || a.categoryId === filterCat;
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [assets, search, filterCat, filterStatus]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active พร้อมใช้</Badge>;
      case "repairing":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 animate-pulse">กำลังซ่อมบำรุง</Badge>;
      case "archived":
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Archived เก็บถาวร</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SectionTitle
          icon={Wrench}
          title={`ทะเบียนครุภัณฑ์และระบบหลัก (${(assets || []).length} รายการ)`}
          desc="ฐานข้อมูลครุภัณฑ์ ระบบปรับอากาศ ปั๊มน้ำ โซลาร์เซลล์ และเครื่องจักรกล"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#002D62] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-900 active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> เพิ่มครุภัณฑ์ใหม่
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อครุภัณฑ์, รหัส หรือผู้รับผิดชอบ…"
            className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="active">Active พร้อมใช้</option>
          <option value="repairing">กำลังซ่อมบำรุง</option>
          <option value="archived">Archived เก็บถาวร</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50 font-bold text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">รหัสครุภัณฑ์</th>
              <th className="px-4 py-3 text-left">ชื่อครุภัณฑ์ / ระบบ</th>
              <th className="px-4 py-3 text-left">หมวดหมู่ &amp; อาคาร</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
              <th className="px-4 py-3 text-right">มูลค่าจัดหา (บาท)</th>
              <th className="px-4 py-3 text-left">ผู้รับผิดชอบ</th>
              <th className="px-4 py-3 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  ไม่พบข้อมูลครุภัณฑ์ตามเงื่อนไข
                </td>
              </tr>
            ) : (
              filteredAssets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {ast.code}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{ast.name}</p>
                    <p className="text-[11px] text-slate-400">{ast.locationDetail || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="font-medium">{ast.categoryName || "-"}</p>
                    <p className="text-[11px] text-slate-400">{ast.buildingName || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {getStatusBadge(ast.status)}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-800 whitespace-nowrap">
                    {ast.purchaseCost ? fmt(ast.purchaseCost) : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {ast.responsiblePerson || "-"}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setEditingAsset(ast)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {ast.status !== "archived" && (
                        <button
                          onClick={() => deleteAsset(ast.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                          title="ย้ายไปเก็บถาวร (Archive)"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Asset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-600" />
                เพิ่มครุภัณฑ์ / ระบบหลักใหม่
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const bldId = fd.get("buildingId");
                const bld = buildings.find((b) => b.id === bldId);
                const catId = fd.get("categoryId");
                const c = categories.find((x) => x.id === catId);

                addAsset({
                  code: fd.get("code"),
                  name: fd.get("name"),
                  categoryId: catId,
                  categoryName: c?.name || "-",
                  buildingId: bldId,
                  buildingName: bld?.name || "-",
                  locationDetail: fd.get("locationDetail"),
                  purchaseCost: Number(fd.get("purchaseCost")) || 0,
                  responsiblePerson: fd.get("responsiblePerson"),
                  installationDate: fd.get("installationDate"),
                  status: "active",
                });
                setShowAddModal(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">รหัสครุภัณฑ์</label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="เช่น EQ-AC-01"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">มูลค่าจัดหา (บาท)</label>
                  <input
                    type="number"
                    name="purchaseCost"
                    defaultValue="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อครุภัณฑ์ / ระบบ</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="เช่น ระบบปรับอากาศ VRV ชั้น 2"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">หมวดหมู่</label>
                  <select name="categoryId" className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">อาคารติดตั้ง</label>
                  <select name="buildingId" className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800">
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ตำแหน่งติดตั้งระบุละเอียด</label>
                <input
                  type="text"
                  name="locationDetail"
                  placeholder="เช่น ห้องประชุมใหญ่ ชั้น 2"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">วันที่ติดตั้ง</label>
                  <input
                    type="date"
                    name="installationDate"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ผู้รับผิดชอบหลัก</label>
                  <input
                    type="text"
                    name="responsiblePerson"
                    placeholder="เช่น นายอภิวัฒน์"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#002D62] py-2.5 font-bold text-white shadow-md hover:bg-blue-900"
                >
                  บันทึกครุภัณฑ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Asset */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">
                แก้ไขครุภัณฑ์ {editingAsset.code}
              </h3>
              <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                updateAsset(editingAsset.id, {
                  name: fd.get("name"),
                  status: fd.get("status"),
                  responsiblePerson: fd.get("responsiblePerson"),
                  locationDetail: fd.get("locationDetail"),
                });
                setEditingAsset(null);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อครุภัณฑ์</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingAsset.name}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">สถานะ</label>
                <select
                  name="status"
                  defaultValue={editingAsset.status}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 font-semibold"
                >
                  <option value="active">Active พร้อมใช้</option>
                  <option value="repairing">กำลังซ่อมบำรุง</option>
                  <option value="archived">Archived เก็บถาวร</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ผู้รับผิดชอบ</label>
                <input
                  type="text"
                  name="responsiblePerson"
                  defaultValue={editingAsset.responsiblePerson}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ตำแหน่งติดตั้ง</label>
                <input
                  type="text"
                  name="locationDetail"
                  defaultValue={editingAsset.locationDetail}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#002D62] py-2.5 font-bold text-white shadow-md hover:bg-blue-900"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetManager;
