// ============================================================
// CatalogManager.jsx — Category & Checklist Items Manager
// ============================================================
import React, { useState } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  Save,
  X,
} from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { Badge } from "../../components/ui/Badge";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { getColor, getIcon, COLOR_OPTIONS, ICON_OPTIONS } from "../../config/theme";
import { FREQUENCY_OPTIONS } from "../../config/workflow";
import { fmt, cx } from "../../lib/helpers";

export function CatalogManager() {
  const { cat, toast } = useAppData();
  const categories = cat?.allCategories || [];

  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || null);
  const [editingCat, setEditingCat] = useState(null); // { id, name, color, icon }
  const [editingItem, setEditingItem] = useState(null); // item draft
  const [showItemDrawer, setShowItemDrawer] = useState(false);

  const activeCat = categories.find((c) => c.id === selectedCatId) || categories[0];
  const items = selectedCatId ? cat.itemsOf(selectedCatId, { includeInactive: true }) : [];

  // Category Actions
  const handleSaveCat = () => {
    if (!editingCat.name.trim()) {
      toast.error("กรุณากรอกชื่อหมวด");
      return;
    }
    if (editingCat.id) {
      cat.updateCategory(editingCat.id, editingCat);
      toast.success("อัปเดตข้อมูลหมวดเรียบร้อย");
    } else {
      cat.addCategory(editingCat);
      toast.success("เพิ่มหมวดการตรวจใหม่เรียบร้อย");
    }
    setEditingCat(null);
  };

  // Item Actions
  const handleSaveItem = () => {
    if (!editingItem.label.trim()) {
      toast.error("กรุณากรอกชื่อรายการตรวจ");
      return;
    }
    if (editingItem.id) {
      cat.updateItem(editingItem.id, editingItem);
      toast.success("อัปเดตรายการตรวจเรียบร้อย");
    } else {
      cat.addItem({ ...editingItem, categoryId: selectedCatId });
      toast.success("เพิ่มรายการตรวจเรียบร้อย");
    }
    setShowItemDrawer(false);
    setEditingItem(null);
  };

  const handleAddPart = () => {
    setEditingItem((prev) => ({
      ...prev,
      parts: [
        ...(prev.parts || []),
        { name: "", qty: 1, unit: "ชิ้น", unitPrice: 0 },
      ],
    }));
  };

  const handleUpdatePart = (idx, patch) => {
    setEditingItem((prev) => {
      const pList = [...(prev.parts || [])];
      pList[idx] = { ...pList[idx], ...patch };
      return { ...prev, parts: pList };
    });
  };

  const handleRemovePart = (idx) => {
    setEditingItem((prev) => ({
      ...prev,
      parts: (prev.parts || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Category Horizontal Selector + Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = getIcon(c.icon || "Layers");
            const on = selectedCatId === c.id;
            const sc = getColor(c.color || "slate");

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={cx(
                  "flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95",
                  on
                    ? cx(sc.solid, "text-white border-transparent shadow-md")
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{c.name}</span>
                {c.active === false && (
                  <span className="ml-1 text-[10px] text-red-500 font-normal">(ปิด)</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setEditingCat({ name: "", color: "blue", icon: "Layers" })}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-slate-900 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" /> เพิ่มหมวด
        </button>
      </div>

      {/* Category Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-800">
                {editingCat.id ? "แก้ไขหมวดการตรวจ" : "เพิ่มหมวดการตรวจใหม่"}
              </h4>
              <button
                onClick={() => setEditingCat(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <label className="block">
                <span className="font-bold text-slate-600">ชื่อหมวด</span>
                <input
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  placeholder="เช่น ระบบดับเพลิงและความปลอดภัย"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                />
              </label>

              {/* Color Presets */}
              <div>
                <span className="block font-bold text-slate-600 mb-1.5">ชุดสี</span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setEditingCat({ ...editingCat, color: c.key })}
                      className={cx(
                        "h-7 w-7 rounded-lg transition-transform",
                        c.solid,
                        editingCat.color === c.key ? "ring-2 ring-indigo-600 scale-110" : ""
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setEditingCat(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveCat}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
              >
                <Save className="h-3.5 w-3.5" /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Section for selected Category */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="font-extrabold text-slate-800">
              รายการตรวจเช็ค: {activeCat?.name || "-"}
            </h3>
            <p className="text-xs text-slate-400">ทั้งหมด {items.length} รายการตรวจ</p>
          </div>

          <button
            onClick={() => {
              setEditingItem({
                label: "",
                standard: "",
                critical: false,
                frequency: "monthly",
                parts: [],
              });
              setShowItemDrawer(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> เพิ่มรายการตรวจ
          </button>
        </div>

        {/* Item Rows */}
        <div className="mt-4 divide-y divide-slate-100">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{it.label}</p>
                  <p className="text-xs text-slate-400">
                    เกณฑ์: {it.standard || "-"} · อะไหล่ {it.parts?.length || 0} รายการ (
                    {fmt(cat.partsTotal(it))} บาท)
                  </p>
                  <div className="mt-1 flex gap-2">
                    {it.critical && (
                      <Badge className="border-red-200 bg-red-50 text-red-700">จุดวิกฤต</Badge>
                    )}
                    {it.active === false && (
                      <Badge className="border-slate-200 bg-slate-100 text-slate-400">
                        ปิดใช้งาน
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-9 sm:pl-0">
                <button
                  onClick={() => cat.toggleItem(it.id, !it.active)}
                  className="rounded-lg border p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  title={it.active !== false ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                >
                  {it.active !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingItem(it);
                    setShowItemDrawer(true);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  <Edit2 className="h-3 w-3" /> แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Form Drawer */}
      {showItemDrawer && editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-lg bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-extrabold text-slate-800">
                  {editingItem.id ? "แก้ไขรายการตรวจ" : "เพิ่มรายการตรวจใหม่"}
                </h4>
                <button
                  onClick={() => setShowItemDrawer(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <label className="block">
                  <span className="font-bold text-slate-600">ชื่อรายการตรวจ</span>
                  <input
                    value={editingItem.label}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, label: e.target.value })
                    }
                    placeholder="เช่น ตรวจสอบความดันถังดับเพลิง"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                  />
                </label>

                <label className="block">
                  <span className="font-bold text-slate-600">เกณฑ์มาตรฐานการตรวจ</span>
                  <input
                    value={editingItem.standard || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, standard: e.target.value })
                    }
                    placeholder="เช่น เข็มวัดความดันอยู่ในช่องสีเขียว"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                  />
                </label>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="crit"
                    checked={editingItem.critical || false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, critical: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-red-600"
                  />
                  <label htmlFor="crit" className="font-bold text-red-600 cursor-pointer">
                    กำหนดเป็นจุดวิกฤต (Critical) — ยกระดับเป็น Urgent ทันทีเมื่อไม่ผ่าน
                  </label>
                </div>

                {/* Parts Table Editor */}
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">รายการอะไหล่/วัสดุสำรอง</span>
                    <button
                      onClick={handleAddPart}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      + เพิ่มอะไหล่
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(editingItem.parts || []).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 bg-slate-50"
                      >
                        <input
                          placeholder="ชื่ออะไหล่"
                          value={p.name}
                          onChange={(e) => handleUpdatePart(pIdx, { name: e.target.value })}
                          className="flex-1 rounded-lg border bg-white p-1.5 text-xs"
                        />
                        <input
                          placeholder="จน."
                          type="number"
                          value={p.qty}
                          onChange={(e) =>
                            handleUpdatePart(pIdx, { qty: Number(e.target.value) || 1 })
                          }
                          className="w-14 rounded-lg border bg-white p-1.5 text-xs text-center"
                        />
                        <input
                          placeholder="ราคา"
                          type="number"
                          value={p.unitPrice}
                          onChange={(e) =>
                            handleUpdatePart(pIdx, { unitPrice: Number(e.target.value) || 0 })
                          }
                          className="w-20 rounded-lg border bg-white p-1.5 text-xs text-right"
                        />
                        <button
                          onClick={() => handleRemovePart(pIdx)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                onClick={() => setShowItemDrawer(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveItem}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
              >
                <Save className="h-3.5 w-3.5" /> บันทึกรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogManager;
