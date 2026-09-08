// ============================================================
// MahidolTopBar.jsx — Official Mahidol University Global Navigation Bar
// อัตลักษณ์และแถบนำทางหลัก คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล
// ============================================================
import React from "react";
import { ExternalLink, Building2, ShieldCheck, Compass } from "lucide-react";
import { Badge } from "../ui/Badge";

export function MahidolTopBar() {
  const portalUrl = import.meta.env.VITE_PORTAL_URL || "http://localhost:5173";

  return (
    <div className="no-print sticky top-0 z-50 border-b border-white/10 bg-[#0e2b42] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-6">
        {/* Left: Official Logos & Unit Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/mahidol-logo.png"
              alt="ตราสัญลักษณ์มหาวิทยาลัยมหิดล"
              className="h-9 w-auto rounded-lg bg-white p-1 shadow-xs transition hover:scale-105"
            />
            <img
              src="/envi-logo.jpg"
              alt="คณะสิ่งแวดล้อมและทรัพยากรศาสตร์"
              className="hidden h-9 w-auto rounded-lg bg-white p-0.5 shadow-xs transition hover:scale-105 sm:block"
            />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide sm:text-sm text-white">
                งานพันธกิจเพื่อสังคม
              </span>
              <span className="hidden sm:inline-block rounded-full bg-[#D6A84F]/20 px-2 py-0.5 text-[10px] font-bold text-[#D6A84F] border border-[#D6A84F]/40">
                สบปราบ ลำปาง
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#D6A84F] sm:text-[11px] truncate max-w-[240px] sm:max-w-none">
              คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล
            </p>
          </div>
        </div>

        {/* Center: System Badge (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-blue-100 border border-white/15">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D6A84F]" />
            <span className="font-semibold">ระบบบริหารจัดการอาคาร สาธารณูปโภค &amp; เชื้อเพลิง</span>
          </div>
        </div>

        {/* Right: Return to Portal Link & Switcher */}
        <div className="flex items-center gap-2">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดหน้าหลัก Mahidol Lampang Portal ในแท็บใหม่"
            className="group flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-[#D6A84F] hover:text-[#123B63] hover:border-[#D6A84F] active:scale-95"
          >
            <Compass className="h-3.5 w-3.5 text-[#D6A84F] group-hover:text-[#123B63] transition" />
            <span className="hidden sm:inline">สู่หน้าหลัก</span> Portal
            <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default MahidolTopBar;
