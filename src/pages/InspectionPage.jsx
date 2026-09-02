// ============================================================
// InspectionPage.jsx — Dual-Track Inspection System
// Track 1: ความปลอดภัยและกฎหมาย (Safety & Legal)
// Track 2: ความต่อเนื่องสาธารณูปโภค (Facility Continuity)
// Real-time Checklist & Content Editor: เพิ่ม/แก้ไข/ปรับเกณฑ์ได้ทันที
// ============================================================
import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Camera,
  Trash2,
  Gauge,
  Send,
  Loader2,
  Plus,
  Edit2,
  Save,
  X,
  PlusCircle,
  Settings2,
} from "lucide-react";
import { useAppData } from "../store/AppDataProvider";
import { Badge } from "../components/ui/Badge";
import { SectionTitle } from "../components/ui/SectionTitle";
import { EmptyState } from "../components/ui/EmptyState";
import { cx, fmt } from "../lib/helpers";
import { RESULT_OPT, INSPECTION_TRACKS } from "../config/workflow";
import { getColor, getIcon } from "../config/theme";

// Checklist Item Row with Quick Inline Edit support
function ChecklistItemRow({ item, value, onChange, index, onQuickEdit, onDelete }) {
  const isDanger = item.critical && value === "fail";

  return (
    <div
      className={cx(
        "group relative rounded-2xl border p-4 transition-all duration-300",
        isDanger
          ? "border-red-300 bg-red-50/70 shadow-md shadow-red-100"
          : value === "warn"
          ? "border-amber-200 bg-amber-50/50"
          : value === "pass"
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cx(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              isDanger ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
            )}
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className={cx(
                  "text-sm font-medium leading-relaxed",
                  isDanger ? "text-red-800 font-bold" : "text-slate-700"
                )}
              >
                {item.label}
              </p>
              {/* Quick Inline Edit trigger */}
              <button
                onClick={() => onQuickEdit(item)}
                className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                title="แก้ไขหัวข้อหรือเกณฑ์มาตรฐานนี้"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {item.standard && (
              <p className="mt-0.5 text-xs text-slate-400">เกณฑ์มาตรฐาน: {item.standard}</p>
            )}

            {item.parts && item.parts.length > 0 && (
              <p className="mt-0.5 text-[11px] text-indigo-600">
                อะไหล่ผูกไว้: {item.parts.map((p) => `${p.name} (${p.qty} ${p.unit})`).join(", ")}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.critical && (
                <Badge className="border-red-200 bg-red-100 text-red-700">
                  <ShieldAlert className="h-3 w-3" /> จุดวิกฤต (Critical)
                </Badge>
              )}
              {isDanger && (
                <Badge className="border-red-300 bg-red-600 text-white" pulse>
                  ยกระดับเป็น URGENT อัตโนมัติ
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* 3 Status Toggle Buttons */}
        <div className="grid shrink-0 grid-cols-3 gap-2 lg:w-96">
          {RESULT_OPT.map((o) => {
            const on = value === o.key;
            const sc = getColor(o.color);

            return (
              <button
                key={o.key}
                onClick={() => onChange(item.id, on ? null : o.key)}
                className={cx(
                  "flex items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95",
                  on
                    ? cx(sc.solid, "text-white border-transparent shadow-lg")
                    : cx("bg-white", sc.border, sc.text, "hover:bg-slate-50")
                )}
              >
                {o.key === "pass" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {o.key === "warn" && <AlertTriangle className="h-4 w-4 shrink-0" />}
                {o.key === "fail" && <XCircle className="h-4 w-4 shrink-0" />}
                <span className="truncate">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function InspectionPage({ currentUser }) {
  const { cat, submitInspection, toast, setPage } = useAppData();

  // 1. Dual Track State
  const [activeTrack, setActiveTrack] = useState("safety_legal"); // "safety_legal" | "facility_continuity"

  const buildings = cat?.buildings || [];
  const allCategories = cat?.categories || [];

  // Filter Categories by Active Track
  const trackCategories = useMemo(() => {
    return allCategories.filter((c) => (c.track || "safety_legal") === activeTrack);
  }, [allCategories, activeTrack]);

  const [buildingId, setBuildingId] = useState(buildings[0]?.id || "bld_1");
  const [categoryId, setCategoryId] = useState(trackCategories[0]?.id || null);

  // Sync category when track changes
  useEffect(() => {
    if (trackCategories.length > 0) {
      if (!trackCategories.some((c) => c.id === categoryId)) {
        setCategoryId(trackCategories[0].id);
      }
    } else {
      setCategoryId(null);
    }
  }, [activeTrack, trackCategories, categoryId]);

  const [results, setResults] = useState({});
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);

  // Real-time Editor Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);

  // Dynamic items from useCatalog hook
  const items = categoryId && cat?.itemsOf ? cat.itemsOf(categoryId) : [];

  useEffect(() => {
    setResults({});
    setNote("");
    setPhotos([]);
  }, [categoryId, buildingId, activeTrack]);

  const criticalHits = items.filter((i) => i.critical && results[i.id] === "fail");
  const failCount = Object.values(results).filter((r) => r === "fail").length;
  const warnCount = Object.values(results).filter((r) => r === "warn").length;
  const passCount = Object.values(results).filter((r) => r === "pass").length;
  const answered = passCount + warnCount + failCount;
  const progress = items.length > 0 ? Math.round((answered / items.length) * 100) : 0;
  const level = criticalHits.length ? "urgent" : failCount ? "high" : warnCount ? "normal" : null;

  const currentBuilding = buildings.find((b) => b.id === buildingId);
  const currentCategory = trackCategories.find((c) => c.id === categoryId);
  const CategoryIcon = getIcon(currentCategory?.icon || "Layers");
  const catColor = getColor(currentCategory?.color || "indigo");

  const addPhoto = () => {
    const n = photos.length + 1;
    const bName = currentBuilding?.name || "BLD";
    setPhotos((p) => [
      ...p,
      {
        id: Date.now() + n,
        name: `DMG_${bName.replace(/\s+/g, "")}_${String(n).padStart(3, "0")}.jpg`,
        size: (1.2 + Math.random() * 2.6).toFixed(1),
      },
    ]);
  };

  const handleSaveItemRealtime = () => {
    if (!editingItem?.label?.trim()) {
      toast.error("กรุณากรอกชื่อรายการตรวจ");
      return;
    }
    if (editingItem.id) {
      cat.updateItem(editingItem.id, editingItem);
      toast.success("อัปเดตรายการตรวจเช็คเรียบร้อย");
    } else {
      cat.addItem({ ...editingItem, categoryId });
      toast.success("เพิ่มรายการตรวจเช็คใหม่ลงในหมวดนี้แล้ว");
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleAddPartInItem = () => {
    setEditingItem((prev) => ({
      ...prev,
      parts: [...(prev.parts || []), { name: "", qty: 1, unit: "ชิ้น", unitPrice: 0 }],
    }));
  };

  const handleSubmit = () => {
    if (answered === 0) {
      toast.error("กรุณาเลือกสถานะอย่างน้อย 1 รายการก่อนส่งรายงาน");
      return;
    }

    setSending(true);
    setTimeout(() => {
      try {
        const inspectorName = currentUser
          ? `${currentUser.name} (${currentUser.position})`
          : "ไม่ระบุผู้ตรวจ";
        submitInspection({
          buildingId,
          track: activeTrack,
          inspector: inspectorName,
          date: new Date().toISOString().slice(0, 10),
          results,
          notes: note ? { general: note } : {},
        });

        setResults({});
        setNote("");
        setPhotos([]);
        setSending(false);
        setPage("workorder");
      } catch (err) {
        console.error("[InspectionPage] submitInspection ล้มเหลว:", err);
        toast.error("เกิดข้อผิดพลาดในการบันทึก — กรุณาลองใหม่อีกครั้ง");
        setSending(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* 🚀 Dual-Track Switcher Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Track 1: Safety & Legal */}
        <button
          onClick={() => setActiveTrack("safety_legal")}
          className={cx(
            "relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 active:scale-98 shadow-sm",
            activeTrack === "safety_legal"
              ? "border-red-500 bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-200"
              : "border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/40 text-slate-700"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cx(
                "rounded-xl p-3 shadow-md",
                activeTrack === "safety_legal" ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
              )}
            >
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    activeTrack === "safety_legal"
                      ? "bg-white text-red-700 font-extrabold"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  มาตรฐานความปลอดภัย & กฎหมาย
                </Badge>
                {activeTrack === "safety_legal" && (
                  <span className="flex h-3 w-3 rounded-full bg-white animate-ping" />
                )}
              </div>
              <h3 className="mt-2 text-base font-extrabold">1. การตรวจสอบอาคารตามกฎหมาย</h3>
              <p
                className={cx(
                  "mt-1 text-xs leading-relaxed",
                  activeTrack === "safety_legal" ? "text-red-100" : "text-slate-400"
                )}
              >
                โครงสร้าง, ระบบอัคคีภัย, ไฟฟ้าแรงสูง, ทางหนีไฟ (สำหรับออกรายงานประจำปี)
              </p>
            </div>
          </div>
        </button>

        {/* Track 2: Facility Continuity */}
        <button
          onClick={() => setActiveTrack("facility_continuity")}
          className={cx(
            "relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all duration-300 active:scale-98 shadow-sm",
            activeTrack === "facility_continuity"
              ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-200"
              : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cx(
                "rounded-xl p-3 shadow-md",
                activeTrack === "facility_continuity" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"
              )}
            >
              <Wrench className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    activeTrack === "facility_continuity"
                      ? "bg-white text-indigo-700 font-extrabold"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }
                >
                  ความต่อเนื่องสาธารณูปโภค
                </Badge>
                {activeTrack === "facility_continuity" && (
                  <span className="flex h-3 w-3 rounded-full bg-white animate-ping" />
                )}
              </div>
              <h3 className="mt-2 text-base font-extrabold">2. การตรวจสอบระบบสาธารณูปโภค</h3>
              <p
                className={cx(
                  "mt-1 text-xs leading-relaxed",
                  activeTrack === "facility_continuity" ? "text-indigo-100" : "text-slate-400"
                )}
              >
                แอร์, ปั๊มน้ำ, โซลาร์เซลล์, ยานพาหนะ (สำหรับออกใบแจ้งซ่อม & งพ.001 / งพ.003)
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Building & Category Selector Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          icon={Building2}
          title={`เลือกพื้นที่และหมวดการตรวจ (${INSPECTION_TRACKS[activeTrack].shortTitle})`}
          desc="ระบุอาคารและหมวดงานที่ต้องการบันทึกผลตรวจ"
        />

        {/* Building selection */}
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">เลือกอาคาร</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => setBuildingId(b.id)}
              className={cx(
                "rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 active:scale-95",
                buildingId === b.id
                  ? "border-slate-800 bg-slate-800 text-white shadow-lg shadow-slate-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <p className="text-sm font-bold">{b.name}</p>
              <p
                className={cx(
                  "truncate text-[10px]",
                  buildingId === b.id ? "text-slate-200" : "text-slate-400"
                )}
              >
                {b.code || b.detail || "-"}
              </p>
            </button>
          ))}
        </div>

        {/* Category selection */}
        <div className="flex items-center justify-between mb-2 mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            หมวดการตรวจ ({trackCategories.length} หมวดในแทร็กนี้)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {trackCategories.map((c) => {
            const Icon = getIcon(c.icon || "Layers");
            const on = categoryId === c.id;
            const sc = getColor(c.color || "slate");
            const count = cat?.itemsOf ? cat.itemsOf(c.id).length : 0;

            return (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={cx(
                  "flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all duration-200 active:scale-95",
                  on
                    ? cx("border-transparent shadow-lg text-white", sc.solid)
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                )}
              >
                <span className={cx("rounded-lg p-2", on ? "bg-white/20" : sc.soft)}>
                  <Icon className={cx("h-4 w-4", on ? "text-white" : sc.text)} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{c.name}</p>
                  <p className={cx("text-[11px]", on ? "text-white/75" : "text-slate-400")}>
                    {count} รายการตรวจ
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Red Alert Banner on Critical Hits */}
      {criticalHits.length > 0 && (
        <div className="animate-fade overflow-hidden rounded-2xl border-2 border-red-400 bg-gradient-to-r from-red-600 to-red-700 p-5 text-white shadow-2xl shadow-red-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="animate-pulse rounded-xl bg-white/20 p-3">
                <ShieldAlert className="h-6 w-6" />
              </span>
              <div>
                <p className="text-lg font-extrabold">
                  🚨 RED ALERT – ตรวจพบจุดวิกฤตด้านความปลอดภัย
                </p>
                <ul className="mt-1.5 space-y-1 text-sm text-red-50">
                  {criticalHits.map((h) => (
                    <li key={h.id} className="flex items-start gap-1.5">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {h.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Badge className="self-start border-white/40 bg-white text-red-700 sm:self-center" pulse>
              ระดับ URGENT เร่งด่วน
            </Badge>
          </div>
        </div>
      )}

      {/* Progress & Summary Bar with Real-time Add Item Button */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={cx("rounded-lg p-2", catColor.soft)}>
              <CategoryIcon className={cx("h-4 w-4", catColor.text)} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800">{currentCategory?.name || "หมวดการตรวจ"}</p>
                {/* 🌟 Real-time Add Item Trigger */}
                <button
                  onClick={() => {
                    setEditingItem({
                      label: "",
                      standard: "",
                      critical: false,
                      parts: [],
                    });
                    setShowItemModal(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition"
                  title="เพิ่มข้อตรวจเช็คใหม่ลงในหมวดนี้แบบ Real-time"
                >
                  <Plus className="h-3 w-3" /> เพิ่มข้อตรวจ
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {currentBuilding?.name || "-"} · ตรวจแล้ว {answered}/{items.length} รายการ
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> ปกติ {passCount}
            </Badge>
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
              <AlertTriangle className="h-3 w-3" /> เฝ้าระวัง {warnCount}
            </Badge>
            <Badge className="border-red-200 bg-red-50 text-red-700">
              <XCircle className="h-3 w-3" /> ไม่ผ่าน {failCount}
            </Badge>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cx(
              "h-full rounded-full transition-all duration-500",
              criticalHits.length ? "bg-red-500" : failCount ? "bg-amber-500" : "bg-indigo-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dynamic Checklist Rows */}
      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="ยังไม่มีรายการตรวจในหมวดนี้"
          desc="คุณสามารถกดปุ่ม '+ เพิ่มข้อตรวจ' ด้านบนเพื่อสร้างรายการตรวจสอบได้ทันที"
        />
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <ChecklistItemRow
              key={it.id}
              item={it}
              index={idx}
              value={results[it.id] || null}
              onChange={(id, v) =>
                setResults((p) => {
                  const n = { ...p };
                  if (v) n[id] = v;
                  else delete n[id];
                  return n;
                })
              }
              onQuickEdit={(item) => {
                setEditingItem(item);
                setShowItemModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Real-time Item Editor Modal */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-indigo-600" />
                {editingItem.id ? "แก้ไขข้อตรวจเช็ค" : "เพิ่มข้อตรวจเช็คใหม่"}
              </h4>
              <button
                onClick={() => setShowItemModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <label className="block">
                <span className="font-bold text-slate-700">ชื่อรายการตรวจสอบ</span>
                <input
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="เช่น ตรวจสอบความดันและสภาพถังดับเพลิง"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-medium"
                />
              </label>

              <label className="block">
                <span className="font-bold text-slate-700">เกณฑ์มาตรฐานการประเมิน (Standard)</span>
                <input
                  value={editingItem.standard || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, standard: e.target.value })}
                  placeholder="เช่น เข็มวัดอยู่ในช่องสีเขียว สลักและซีลไม่ขาด"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </label>

              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 border border-red-100">
                <input
                  type="checkbox"
                  id="critical_modal"
                  checked={editingItem.critical || false}
                  onChange={(e) => setEditingItem({ ...editingItem, critical: e.target.checked })}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="critical_modal" className="font-bold text-red-700 cursor-pointer">
                  เป็นจุดวิกฤต (Critical Safety Issue) — ยกระดับเป็นด่วนที่สุดอัตโนมัติ
                </label>
              </div>

              {/* Parts & Spares config */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">อะไหล่/วัสดุสำรองที่ผูกไว้ (สำหรับใบแจ้งซ่อม & งพ.001)</span>
                  <button
                    onClick={handleAddPartInItem}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    + เพิ่มอะไหล่
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingItem.parts || []).map((p, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 rounded-xl border p-2 bg-slate-50">
                      <input
                        placeholder="ชื่ออะไหล่/งาน"
                        value={p.name}
                        onChange={(e) => {
                          const pList = [...editingItem.parts];
                          pList[pIdx] = { ...pList[pIdx], name: e.target.value };
                          setEditingItem({ ...editingItem, parts: pList });
                        }}
                        className="flex-1 rounded-lg border bg-white p-1.5 text-xs"
                      />
                      <input
                        placeholder="จน."
                        type="number"
                        value={p.qty}
                        onChange={(e) => {
                          const pList = [...editingItem.parts];
                          pList[pIdx] = { ...pList[pIdx], qty: Number(e.target.value) || 1 };
                          setEditingItem({ ...editingItem, parts: pList });
                        }}
                        className="w-14 rounded-lg border bg-white p-1.5 text-xs text-center"
                      />
                      <input
                        placeholder="หน่วย"
                        value={p.unit || "ชิ้น"}
                        onChange={(e) => {
                          const pList = [...editingItem.parts];
                          pList[pIdx] = { ...pList[pIdx], unit: e.target.value };
                          setEditingItem({ ...editingItem, parts: pList });
                        }}
                        className="w-14 rounded-lg border bg-white p-1.5 text-xs text-center"
                      />
                      <input
                        placeholder="ราคา"
                        type="number"
                        value={p.unitPrice}
                        onChange={(e) => {
                          const pList = [...editingItem.parts];
                          pList[pIdx] = { ...pList[pIdx], unitPrice: Number(e.target.value) || 0 };
                          setEditingItem({ ...editingItem, parts: pList });
                        }}
                        className="w-20 rounded-lg border bg-white p-1.5 text-xs text-right"
                      />
                      <button
                        onClick={() => {
                          setEditingItem({
                            ...editingItem,
                            parts: editingItem.parts.filter((_, i) => i !== pIdx),
                          });
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setShowItemModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveItemRealtime}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
              >
                <Save className="h-3.5 w-3.5" /> บันทึกรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes & Submission Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            icon={FileText}
            title="หมายเหตุและข้อเสนอแนะเพิ่มเติม"
            desc="ระบุตำแหน่งความเสียหาย หรือสิ่งที่ต้องซ่อมแซมเร่งด่วน"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="ระบุข้อบกพร่องที่พบ เช่น พบจุดต่อท่อน้ำรั่วซึมชั้น 2 หรือเสาโครงสร้างมีรอยร้าว..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />

          <div className="mt-4">
            <button
              onClick={addPhoto}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-4 text-sm font-bold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.99]"
            >
              <Camera className="h-5 w-5" /> อัปโหลดรูปถ่ายหลักฐานหน้างาน
            </button>

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 shrink-0 text-slate-500" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-slate-700">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.size} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPhotos((x) => x.filter((i) => i.id !== p.id))}
                      className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1 text-slate-500 opacity-0 shadow transition group-hover:opacity-100 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Gauge} title="สรุปการประเมินรอบนี้" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ประเภทการตรวจ</span>
              <Badge
                className={
                  activeTrack === "safety_legal"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }
              >
                {INSPECTION_TRACKS[activeTrack].shortTitle}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">อาคาร</span>
              <span className="font-semibold text-slate-700">{currentBuilding?.name || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">หมวด</span>
              <span className="font-semibold text-slate-700">{currentCategory?.name || "-"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
              <span className="text-slate-500">ระดับความเร่งด่วน</span>
              {level ? (
                <Badge
                  className={cx(
                    getColor(level === "urgent" ? "red" : level === "high" ? "amber" : "sky").soft,
                    getColor(level === "urgent" ? "red" : level === "high" ? "amber" : "sky").softText,
                    getColor(level === "urgent" ? "red" : level === "high" ? "amber" : "sky").border
                  )}
                  pulse={level === "urgent"}
                >
                  {level === "urgent" ? "เร่งด่วนวิกฤต" : level === "high" ? "สำคัญ" : "ทั่วไป"}
                </Badge>
              ) : (
                <Badge className="border-slate-200 bg-slate-100 text-slate-500">ยังไม่ประเมิน</Badge>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sending}
            className={cx(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-95",
              sending
                ? "cursor-not-allowed bg-slate-400"
                : criticalHits.length
                ? "bg-red-600 shadow-red-200 hover:bg-red-700"
                : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
            )}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> กำลังบันทึกรายงาน...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> บันทึกผลการตรวจสอบ
              </>
            )}
          </button>

          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-400">
            ระบบจะสร้างใบแจ้งซ่อม (Work Order)
            <br />
            อัตโนมัติเมื่อพบสิ่งผิดปกติ
          </p>
        </div>
      </div>
    </div>
  );
}

export default InspectionPage;
