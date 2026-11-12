import { useMemo, useRef, useState } from "react";

type Page = "dashboard" | "buildings" | "checklist" | "defect" | "tracking" | "history" | "reports";
type IconName =
  | "grid"
  | "shield"
  | "clipboard"
  | "clock"
  | "tool"
  | "chart"
  | "building"
  | "check"
  | "alert"
  | "hourglass"
  | "arrow"
  | "calendar"
  | "user"
  | "search"
  | "filter"
  | "camera"
  | "droplet"
  | "layers"
  | "sun"
  | "zap"
  | "flame"
  | "menu"
  | "x"
  | "save"
  | "chevron"
  | "download"
  | "eye"
  | "map";

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    tool: (
      <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.5 6 7.2 3.7a4 4 0 0 0 5 5L5 16l-2 5 5-2 7.2-7.2a4 4 0 0 0 5-5L18 9l-2.5-2.5 2.2-2.2Z" />
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h2M14 8h2M8 12h2M14 12h2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="M12 3 2 21h20L12 3Z" />
        <path d="M12 9v5M12 18h.01" />
      </>
    ),
    hourglass: (
      <>
        <path d="M6 2h12M6 22h12M7 2c0 5 2 7 5 10-3 3-5 5-5 10M17 2c0 5-2 7-5 10 3 3 5 5 5 10" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="7.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
    camera: (
      <>
        <path d="M3 7h4l2-3h6l2 3h4v13H3V7Z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    droplet: <path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" />,
    layers: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </>
    ),
    zap: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    flame: (
      <path d="M12 22c4 0 7-3 7-7 0-5-4-6-3-11-4 2-7 5-6 9-2-1-3-3-3-5-2 2-3 5-2 8 1 4 4 6 7 6Z" />
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    x: <path d="m5 5 14 14M19 5 5 19" />,
    save: (
      <>
        <path d="M4 3h14l2 2v16H4V3Z" />
        <path d="M8 3v6h8V3M8 21v-7h8v7" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    download: (
      <>
        <path d="M12 3v13M7 11l5 5 5-5M4 21h16" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "ภาพรวม", icon: "grid" },
  { id: "buildings", label: "ตรวจสอบความปลอดภัย", icon: "shield" },
  { id: "checklist", label: "รายการตรวจสอบ", icon: "clipboard" },
  { id: "history", label: "ประวัติการตรวจ", icon: "clock" },
  { id: "tracking", label: "แจ้งซ่อม / ติดตามแก้ไข", icon: "tool" },
  { id: "reports", label: "รายงานผลการตรวจสอบ", icon: "chart" },
];

const buildings = [
  {
    code: "FM_0000",
    name: "ภาพรวมโครงการ",
    total: 142,
    done: 114,
    status: "กำลังตรวจสอบ",
    tone: "blue",
  },
  {
    code: "FM_1000",
    name: "อาคาร 1 (สำนักงาน)",
    total: 32,
    done: 26,
    status: "กำลังตรวจสอบ",
    tone: "blue",
  },
  {
    code: "FM_2000",
    name: "อาคาร 2 (อาคารช่าง)",
    total: 28,
    done: 28,
    status: "ตรวจเรียบร้อย",
    tone: "green",
  },
  {
    code: "FM_3000",
    name: "อาคาร 3 (สโมสร)",
    total: 24,
    done: 18,
    status: "พบข้อบกพร่อง",
    tone: "red",
  },
  { code: "FM_4000", name: "อาคาร 4", total: 18, done: 18, status: "ตรวจเรียบร้อย", tone: "green" },
  { code: "FM_5000", name: "อาคาร 5", total: 20, done: 12, status: "รอดำเนินการ", tone: "orange" },
  { code: "FM_6000", name: "อาคาร 6", total: 20, done: 12, status: "รอดำเนินการ", tone: "orange" },
];

const checklistSeed = [
  {
    id: 1,
    group: "ระบบน้ำและสุขาภิบาล",
    icon: "droplet" as IconName,
    title: "ท่อประปาและจุดเชื่อมต่อ",
    detail: "ตรวจสอบสภาพการรั่วซึม จุดเชื่อมต่อ และการระบายน้ำ",
    status: "ok",
  },
  {
    id: 2,
    group: "ระบบน้ำและสุขาภิบาล",
    icon: "droplet" as IconName,
    title: "สุขภัณฑ์และอุปกรณ์ประกอบ",
    detail: "ตรวจสอบความพร้อมใช้งาน ความสะอาด และความชำรุด",
    status: "",
  },
  {
    id: 3,
    group: "โครงสร้างอาคาร",
    icon: "layers" as IconName,
    title: "ผนัง พื้น และเพดาน",
    detail: "ตรวจสอบรอยแตกร้าว การทรุดตัว และความเสียหายที่มองเห็นได้",
    status: "issue",
  },
  {
    id: 4,
    group: "ระบบแสงสว่าง",
    icon: "sun" as IconName,
    title: "โคมไฟและแสงสว่างฉุกเฉิน",
    detail: "ตรวจสอบการทำงานและระดับแสงสว่างในพื้นที่",
    status: "",
  },
  {
    id: 5,
    group: "ระบบไฟฟ้า",
    icon: "zap" as IconName,
    title: "ตู้ควบคุมและอุปกรณ์ไฟฟ้า",
    detail: "ตรวจสอบฝาครอบ ป้ายเตือน และสภาพสายไฟ",
    status: "na",
  },
  {
    id: 6,
    group: "ระบบป้องกันอัคคีภัย",
    icon: "flame" as IconName,
    title: "ถังดับเพลิงและทางหนีไฟ",
    detail: "ตรวจสอบตำแหน่ง สภาพพร้อมใช้ และเส้นทางเข้าถึง",
    status: "",
  },
];

const historyRows = [
  ["12 มิ.ย. 2568", "อาคาร 2 (อาคารช่าง)", "วรวิทย์ ใจดี", "28", "0", "เรียบร้อย"],
  ["10 มิ.ย. 2568", "อาคาร 4", "ศิริพร แก้วคำ", "18", "1", "เรียบร้อย"],
  ["8 มิ.ย. 2568", "อาคาร 3 (สโมสร)", "วรวิทย์ ใจดี", "24", "3", "ติดตามแก้ไข"],
  ["4 มิ.ย. 2568", "อาคาร 1 (สำนักงาน)", "นภัสสร กิตติ", "32", "2", "กำลังตรวจ"],
  ["30 พ.ค. 2568", "อาคาร 5", "ศิริพร แก้วคำ", "20", "0", "เรียบร้อย"],
];

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}

function Progress({
  value,
  color = "blue",
  small = false,
}: {
  value: number;
  color?: string;
  small?: boolean;
}) {
  return (
    <div className={`progress ${small ? "h-1.5" : "h-2"}`}>
      <span className={`progress-${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function Dashboard({ go }: { go: (page: Page) => void }) {
  const summaries = [
    {
      label: "รายการตรวจสอบทั้งหมด",
      value: "142",
      note: "7 อาคารและพื้นที่",
      icon: "clipboard" as IconName,
      tone: "navy",
    },
    {
      label: "ตรวจสอบเรียบร้อย",
      value: "114",
      note: "80.3% ของรายการทั้งหมด",
      icon: "check" as IconName,
      tone: "green",
    },
    {
      label: "พบข้อบกพร่อง",
      value: "8",
      note: "ต้องติดตามแก้ไข",
      icon: "alert" as IconName,
      tone: "red",
    },
    {
      label: "รอดำเนินการแก้ไข",
      value: "5",
      note: "2 รายการใกล้ครบกำหนด",
      icon: "hourglass" as IconName,
      tone: "orange",
    },
  ];
  return (
    <>
      <PageTitle
        title="ตรวจสอบความปลอดภัยอาคาร"
        description="ระบบตรวจสอบและติดตามความปลอดภัยของอาคารและพื้นที่ภายในโครงการ สบปราบ"
        actions={
          <>
            <button className="btn secondary" onClick={() => go("history")}>
              <Icon name="clock" />
              ดูประวัติการตรวจสอบ
            </button>
            <button className="btn primary" onClick={() => go("buildings")}>
              <Icon name="shield" />
              เริ่มตรวจสอบ
            </button>
          </>
        }
      />

      <section className="hero-strip">
        <div className="hero-mark">
          <Icon name="shield" size={30} />
        </div>
        <div className="hero-meta">
          <span>วันที่ตรวจสอบล่าสุด</span>
          <strong>12 มิถุนายน 2568</strong>
        </div>
        <div className="hero-divider" />
        <div className="hero-meta">
          <span>ผู้ตรวจสอบล่าสุด</span>
          <strong>นายวรวิทย์ ใจดี</strong>
        </div>
        <div className="hero-divider" />
        <div className="hero-meta">
          <span>อาคารและพื้นที่ทั้งหมด</span>
          <strong>7 พื้นที่</strong>
        </div>
        <div className="hero-progress">
          <div>
            <span>ความคืบหน้ารวม</span>
            <strong>80%</strong>
          </div>
          <Progress value={80} color="cyan" />
        </div>
      </section>

      <div className="summary-grid">
        {summaries.map((s) => (
          <article className={`summary-card summary-${s.tone}`} key={s.label}>
            <div className="summary-icon">
              <Icon name={s.icon} />
            </div>
            <div>
              <p>{s.label}</p>
              <strong>{s.value}</strong>
              <small>{s.note}</small>
            </div>
          </article>
        ))}
      </div>

      <section className="section-head">
        <div>
          <h2>อาคารและพื้นที่</h2>
          <p>เลือกพื้นที่เพื่อเริ่มหรือตรวจสอบความคืบหน้า</p>
        </div>
        <button className="text-btn" onClick={() => go("buildings")}>
          ดูทั้งหมด <Icon name="arrow" size={17} />
        </button>
      </section>
      <div className="building-grid dashboard-buildings">
        {buildings.slice(1, 4).map((b) => (
          <BuildingCard key={b.code} building={b} go={go} />
        ))}
      </div>

      <div className="lower-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>ข้อบกพร่องที่ต้องติดตาม</h3>
              <p>รายการเร่งด่วนและใกล้ครบกำหนด</p>
            </div>
            <button className="text-btn" onClick={() => go("tracking")}>
              ดูทั้งหมด
            </button>
          </div>
          <div className="issue-list">
            <IssueRow
              title="ผนังแตกร้าวบริเวณโถงทางเดิน"
              place="อาคาร 3 · ชั้น 2"
              due="ครบกำหนด 16 มิ.ย. 68"
              tone="red"
            />
            <IssueRow
              title="ไฟส่องสว่างฉุกเฉินไม่ทำงาน"
              place="อาคาร 1 · ทางออกทิศเหนือ"
              due="ครบกำหนด 18 มิ.ย. 68"
              tone="orange"
            />
            <IssueRow
              title="ป้ายบอกทางหนีไฟชำรุด"
              place="อาคาร 5 · ชั้น 1"
              due="ครบกำหนด 21 มิ.ย. 68"
              tone="blue"
            />
          </div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-title">
            <div>
              <h3>กิจกรรมล่าสุด</h3>
              <p>อัปเดตจากทีมตรวจสอบ</p>
            </div>
          </div>
          <div className="timeline">
            <div>
              <i className="green" />
              <p>
                <strong>ปิดการตรวจ อาคาร 2</strong>
                <span>วรวิทย์ ใจดี · 12 มิ.ย. 68, 15:40</span>
              </p>
            </div>
            <div>
              <i className="orange" />
              <p>
                <strong>มอบหมายรายการแก้ไข 2 รายการ</strong>
                <span>ศิริพร แก้วคำ · 12 มิ.ย. 68, 13:15</span>
              </p>
            </div>
            <div>
              <i className="blue" />
              <p>
                <strong>บันทึกแบบร่าง อาคาร 1</strong>
                <span>นภัสสร กิตติ · 12 มิ.ย. 68, 10:02</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function BuildingCard({
  building: b,
  go,
}: {
  building: (typeof buildings)[0];
  go: (p: Page) => void;
}) {
  const pct = Math.round((b.done / b.total) * 100);
  return (
    <article className="building-card">
      <div className="building-top">
        <div className="building-icon">
          <Icon name={b.code === "FM_0000" ? "map" : "building"} size={25} />
        </div>
        <Badge tone={b.tone}>{b.status}</Badge>
      </div>
      <div className="building-code">{b.code}</div>
      <h3>{b.name}</h3>
      <div className="building-stats">
        <span>
          ตรวจแล้ว {b.done} จาก {b.total} รายการ
        </span>
        <strong>{pct}%</strong>
      </div>
      <Progress
        value={pct}
        color={
          b.tone === "red"
            ? "red"
            : b.tone === "orange"
              ? "orange"
              : b.tone === "green"
                ? "green"
                : "blue"
        }
        small
      />
      <button className="building-button" onClick={() => go("checklist")}>
        {pct === 100 ? "ดูรายละเอียด" : b.done ? "ตรวจสอบต่อ" : "เริ่มตรวจสอบ"}
        <Icon name="arrow" size={17} />
      </button>
    </article>
  );
}

function Buildings({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <PageTitle
        eyebrow="ความปลอดภัยอาคาร"
        title="เลือกอาคารและพื้นที่"
        description="เลือกพื้นที่เพื่อเริ่มตรวจสอบ หรือกลับไปดำเนินการจากแบบร่างล่าสุด"
      />
      <div className="notice">
        <Icon name="save" />
        <div>
          <strong>มีแบบตรวจที่ยังดำเนินการไม่เสร็จ 3 รายการ</strong>
          <span>ระบบบันทึกข้อมูลล่าสุดไว้แล้ว คุณสามารถกลับมาทำต่อได้ทุกเมื่อ</span>
        </div>
        <button onClick={() => go("checklist")}>เปิดแบบร่างล่าสุด</button>
      </div>
      <div className="filter-row">
        <div className="search">
          <Icon name="search" size={18} />
          <input placeholder="ค้นหารหัสหรือชื่ออาคาร" />
        </div>
        <button className="btn secondary">
          <Icon name="filter" />
          สถานะทั้งหมด
        </button>
      </div>
      <div className="building-grid">
        {buildings.map((b) => (
          <BuildingCard key={b.code} building={b} go={go} />
        ))}
      </div>
    </>
  );
}

function Checklist({ go, notify }: { go: (p: Page) => void; notify: (s: string) => void }) {
  const [items, setItems] = useState(checklistSeed);
  const [notes, setNotes] = useState<Record<number, string>>({
    3: "พบรอยแตกร้าวยาวประมาณ 40 ซม. บริเวณมุมผนัง",
  });
  const [activeGroup, setActiveGroup] = useState("ทั้งหมด");
  const [confirm, setConfirm] = useState(false);
  const [photos, setPhotos] = useState<Record<number, string[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoItem, setPhotoItem] = useState<number | null>(null);
  const groups = ["ทั้งหมด", ...Array.from(new Set(items.map((i) => i.group)))];
  const done = items.filter((i) => i.status).length;
  const missingIssueNotes = items.filter(
    (i) => i.status === "issue" && !notes[i.id]?.trim(),
  ).length;
  const visible = activeGroup === "ทั้งหมด" ? items : items.filter((i) => i.group === activeGroup);

  function setStatus(id: number, status: string) {
    setItems((v) => v.map((i) => (i.id === id ? { ...i, status } : i)));
  }
  function pickPhoto(id: number) {
    setPhotoItem(id);
    inputRef.current?.click();
  }
  function onPhotos(files: FileList | null) {
    if (!files || photoItem === null) return;
    const urls = Array.from(files)
      .slice(0, 5 - (photos[photoItem]?.length || 0))
      .map((f) => URL.createObjectURL(f));
    setPhotos((p) => ({ ...p, [photoItem]: [...(p[photoItem] || []), ...urls] }));
  }
  return (
    <>
      <div className="check-topbar">
        <button className="back-link" onClick={() => go("buildings")}>
          ‹ กลับไปเลือกอาคาร
        </button>
        <div>
          <Badge tone="blue">กำลังตรวจสอบ</Badge>
          <span>บันทึกล่าสุด 10:02 น.</span>
        </div>
      </div>
      <section className="inspection-head">
        <div className="inspection-symbol">
          <Icon name="building" size={28} />
        </div>
        <div className="inspection-info">
          <span>FM_1000 · แบบตรวจความปลอดภัย</span>
          <h1>อาคาร 1 (สำนักงาน)</h1>
          <div>
            <span>
              <Icon name="calendar" size={16} />
              12 มิถุนายน 2568
            </span>
            <span>
              <Icon name="user" size={16} />
              นภัสสร กิตติ
            </span>
          </div>
        </div>
        <div className="inspection-progress">
          <div>
            <span>ความคืบหน้า</span>
            <strong>
              {done}/{items.length} รายการ
            </strong>
          </div>
          <Progress value={Math.round((done / items.length) * 100)} />
          <small>{Math.round((done / items.length) * 100)}% ของรายการทั้งหมด</small>
        </div>
      </section>

      <div className="check-layout">
        <aside className="category-panel">
          <div className="category-title">หมวดการตรวจสอบ</div>
          {groups.map((g) => (
            <button
              className={activeGroup === g ? "active" : ""}
              key={g}
              onClick={() => setActiveGroup(g)}
            >
              {g}
              <span>
                {g === "ทั้งหมด"
                  ? `${done}/${items.length}`
                  : items.filter((i) => i.group === g && i.status).length +
                    "/" +
                    items.filter((i) => i.group === g).length}
              </span>
            </button>
          ))}
        </aside>
        <div className="check-main">
          <div className="check-section-title">
            <div>
              <h2>{activeGroup === "ทั้งหมด" ? "รายการตรวจสอบทั้งหมด" : activeGroup}</h2>
              <p>กรุณาเลือกผลการตรวจและบันทึกหมายเหตุหากพบข้อบกพร่อง</p>
            </div>
            <span>{visible.length} รายการ</span>
          </div>
          {visible.map((item) => (
            <article
              className={`check-card ${item.status === "issue" ? "has-issue" : ""}`}
              key={item.id}
            >
              <div className="check-index">{String(item.id).padStart(2, "0")}</div>
              <div className="check-content">
                <div className="check-heading">
                  <div className="check-category-icon">
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div>
                    <small>{item.group}</small>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </div>
                <div className="status-options">
                  <button
                    className={item.status === "ok" ? "selected ok" : ""}
                    onClick={() => setStatus(item.id, "ok")}
                  >
                    <span>
                      <Icon name="check" size={16} />
                    </span>
                    เรียบร้อย
                  </button>
                  <button
                    className={item.status === "issue" ? "selected issue" : ""}
                    onClick={() => setStatus(item.id, "issue")}
                  >
                    <span>
                      <Icon name="x" size={16} />
                    </span>
                    ไม่เรียบร้อย
                  </button>
                  <button
                    className={item.status === "na" ? "selected na" : ""}
                    onClick={() => setStatus(item.id, "na")}
                  >
                    <span>—</span>ไม่เกี่ยวข้อง
                  </button>
                </div>
                {(item.status === "issue" || notes[item.id]) && (
                  <div className="note-field">
                    <label>รายละเอียดปัญหา {item.status === "issue" && <b>* จำเป็น</b>}</label>
                    <textarea
                      value={notes[item.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                      placeholder="ระบุรายละเอียด ตำแหน่ง และลักษณะปัญหาที่พบ"
                    />
                  </div>
                )}
                <div className="photo-row">
                  {(photos[item.id] || []).map((p, n) => (
                    <img src={p} alt={`หลักฐาน ${n + 1}`} key={p} />
                  ))}
                  <button onClick={() => pickPhoto(item.id)}>
                    <Icon name="camera" size={19} />
                    แนบภาพหลักฐาน <span>{(photos[item.id] || []).length}/5</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => onPhotos(e.target.files)}
          />
        </div>
      </div>
      <div className="sticky-actions">
        <div>
          <Icon name="alert" />
          <p>
            <strong>
              {items.length - done > 0
                ? `ยังไม่ได้ตรวจสอบ ${items.length - done} รายการ`
                : missingIssueNotes > 0
                  ? `ต้องกรอกรายละเอียดปัญหา ${missingIssueNotes} รายการ`
                  : "ตรวจสอบข้อมูลครบถ้วนแล้ว"}
            </strong>
            <span>คุณสามารถบันทึกแบบร่างและกลับมาทำต่อภายหลัง</span>
          </p>
        </div>
        <span className="action-spacer" />
        <button className="btn secondary" onClick={() => notify("บันทึกแบบร่างเรียบร้อยแล้ว")}>
          <Icon name="save" />
          บันทึกแบบร่าง
        </button>
        <button className="btn primary" onClick={() => setConfirm(true)}>
          จบการตรวจสอบ <Icon name="arrow" />
        </button>
      </div>
      {confirm && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-icon">
              <Icon name="alert" size={26} />
            </div>
            <h2>ยืนยันจบการตรวจสอบ?</h2>
            <p>
              {done < items.length
                ? `ยังมี ${items.length - done} รายการที่ยังไม่ได้ตรวจสอบ กรุณาตรวจสอบให้ครบ หรือบันทึกเป็นแบบร่าง`
                : missingIssueNotes > 0
                  ? `มีข้อบกพร่อง ${missingIssueNotes} รายการที่ยังไม่ได้บันทึกรายละเอียด กรุณากรอกหมายเหตุให้ครบก่อนจบการตรวจ`
                  : "ข้อมูลจะถูกส่งเข้าระบบติดตามผลและไม่สามารถแก้ไขได้"}
            </p>
            <div>
              <button className="btn secondary" onClick={() => setConfirm(false)}>
                กลับไปตรวจสอบ
              </button>
              <button
                className="btn primary"
                disabled={done < items.length || missingIssueNotes > 0}
                onClick={() => {
                  setConfirm(false);
                  notify("จบการตรวจสอบเรียบร้อยแล้ว");
                  go("defect");
                }}
              >
                ยืนยันจบการตรวจ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Defect({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <PageTitle
        eyebrow="รายละเอียดข้อบกพร่อง · DF-2568-0038"
        title="ผนังแตกร้าวบริเวณโถงทางเดิน"
        description="ตรวจพบจากแบบตรวจ FM_3000 · อาคาร 3 (สโมสร)"
        actions={
          <>
            <button className="btn secondary" onClick={() => go("tracking")}>
              กลับหน้าติดตาม
            </button>
            <button className="btn primary">แก้ไขข้อมูล</button>
          </>
        }
      />
      <div className="defect-layout">
        <div>
          <section className="panel defect-hero">
            <div className="defect-image">
              <div>
                <Icon name="camera" size={30} />
                <span>ภาพหลักฐานจากการตรวจ</span>
              </div>
            </div>
            <div className="thumbs">
              <button className="active">
                <Icon name="camera" />
              </button>
              <button>
                <Icon name="camera" />
              </button>
              <span>2 ภาพ</span>
            </div>
          </section>
          <section className="panel detail-section">
            <h3>รายละเอียดปัญหา</h3>
            <p>
              พบรอยแตกร้าวยาวประมาณ 40 ซม. บริเวณมุมผนังด้านทิศเหนือ มีเศษปูนร่อนเล็กน้อย
              ควรให้ช่างตรวจสอบโครงสร้างและซ่อมแซมโดยเร็ว
            </p>
            <div className="location-box">
              <Icon name="map" />
              <div>
                <span>ตำแหน่งที่พบ</span>
                <strong>อาคาร 3 (สโมสร) · ชั้น 2 · โถงทางเดินทิศเหนือ</strong>
              </div>
            </div>
          </section>
        </div>
        <aside className="panel defect-meta">
          <div className="panel-title">
            <div>
              <h3>ข้อมูลการติดตาม</h3>
            </div>
            <Badge tone="orange">กำลังดำเนินการ</Badge>
          </div>
          <dl>
            <div>
              <dt>รหัสรายการ</dt>
              <dd>DF-2568-0038</dd>
            </div>
            <div>
              <dt>วันที่ตรวจพบ</dt>
              <dd>8 มิถุนายน 2568</dd>
            </div>
            <div>
              <dt>ผู้ตรวจสอบ</dt>
              <dd>นายวรวิทย์ ใจดี</dd>
            </div>
            <div>
              <dt>ระดับความเร่งด่วน</dt>
              <dd>
                <Badge tone="red">สูง</Badge>
              </dd>
            </div>
            <div>
              <dt>ผู้รับผิดชอบ</dt>
              <dd>ทีมช่างโยธา</dd>
            </div>
            <div>
              <dt>กำหนดแก้ไข</dt>
              <dd className="danger">16 มิถุนายน 2568</dd>
            </div>
          </dl>
          <button className="btn primary full">อัปเดตสถานะ</button>
        </aside>
      </div>
      <section className="panel detail-section">
        <h3>ประวัติการดำเนินการ</h3>
        <div className="timeline horizontal">
          <div>
            <i className="green" />
            <p>
              <strong>สร้างรายการติดตาม</strong>
              <span>8 มิ.ย. 68 · วรวิทย์ ใจดี</span>
            </p>
          </div>
          <div>
            <i className="blue" />
            <p>
              <strong>มอบหมายทีมช่างโยธา</strong>
              <span>9 มิ.ย. 68 · ผู้ดูแลระบบ</span>
            </p>
          </div>
          <div>
            <i className="orange" />
            <p>
              <strong>เริ่มดำเนินการ</strong>
              <span>11 มิ.ย. 68 · สมชาย งานดี</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function IssueRow({
  title,
  place,
  due,
  tone,
}: {
  title: string;
  place: string;
  due: string;
  tone: string;
}) {
  return (
    <div className="issue-row">
      <div className={`issue-symbol ${tone}`}>
        <Icon name="alert" size={18} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{place}</span>
      </div>
      <Badge tone={tone}>{due}</Badge>
      <Icon name="chevron" size={18} />
    </div>
  );
}

function Tracking({ go }: { go: (p: Page) => void }) {
  const issues = [
    {
      id: "DF-2568-0038",
      title: "ผนังแตกร้าวบริเวณโถงทางเดิน",
      building: "อาคาร 3 · ชั้น 2",
      owner: "ทีมช่างโยธา",
      due: "16 มิ.ย. 68",
      status: "กำลังดำเนินการ",
      tone: "orange",
      priority: "สูง",
    },
    {
      id: "DF-2568-0041",
      title: "ไฟส่องสว่างฉุกเฉินไม่ทำงาน",
      building: "อาคาร 1 · ทางออกทิศเหนือ",
      owner: "ทีมช่างไฟฟ้า",
      due: "18 มิ.ย. 68",
      status: "รอดำเนินการ",
      tone: "red",
      priority: "สูง",
    },
    {
      id: "DF-2568-0044",
      title: "ป้ายบอกทางหนีไฟชำรุด",
      building: "อาคาร 5 · ชั้น 1",
      owner: "งานอาคารสถานที่",
      due: "21 มิ.ย. 68",
      status: "รอดำเนินการ",
      tone: "orange",
      priority: "กลาง",
    },
    {
      id: "DF-2568-0031",
      title: "ก๊อกน้ำอ่างล้างมือรั่วซึม",
      building: "อาคาร 4 · ห้องน้ำชั้น 1",
      owner: "ทีมช่างประปา",
      due: "12 มิ.ย. 68",
      status: "แก้ไขเรียบร้อย",
      tone: "green",
      priority: "ต่ำ",
    },
  ];
  return (
    <>
      <PageTitle
        title="ติดตามการแก้ไขข้อบกพร่อง"
        description="ติดตามสถานะ มอบหมายผู้รับผิดชอบ และตรวจสอบรายการที่ยังไม่ปิดงาน"
        actions={
          <button className="btn primary">
            <Icon name="tool" />
            สร้างรายการแจ้งซ่อม
          </button>
        }
      />
      <div className="summary-grid compact">
        <article className="mini-stat">
          <span>รายการที่เปิดอยู่</span>
          <strong>8</strong>
          <small>ทั้งหมด 12 รายการ</small>
        </article>
        <article className="mini-stat red">
          <span>รอดำเนินการ</span>
          <strong>5</strong>
          <small>2 รายการใกล้ครบกำหนด</small>
        </article>
        <article className="mini-stat orange">
          <span>กำลังดำเนินการ</span>
          <strong>3</strong>
          <small>อยู่ระหว่างแก้ไข</small>
        </article>
        <article className="mini-stat green">
          <span>แก้ไขเรียบร้อย</span>
          <strong>4</strong>
          <small>ภายในเดือนนี้</small>
        </article>
      </div>
      <section className="panel table-panel">
        <div className="filter-row">
          <div className="search grow">
            <Icon name="search" size={18} />
            <input placeholder="ค้นหารายการปัญหา อาคาร หรือผู้รับผิดชอบ" />
          </div>
          <button className="btn secondary">
            <Icon name="filter" />
            ทุกสถานะ
          </button>
          <button className="btn secondary">ทุกอาคาร</button>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>รายการปัญหา</th>
                <th>อาคาร / ตำแหน่ง</th>
                <th>ผู้รับผิดชอบ</th>
                <th>กำหนดแก้ไข</th>
                <th>สถานะการแก้ไข</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => (
                <tr key={i.id} onClick={() => go("defect")}>
                  <td>
                    <small>
                      {i.id} · ความสำคัญ{i.priority}
                    </small>
                    <strong>{i.title}</strong>
                  </td>
                  <td>{i.building}</td>
                  <td>{i.owner}</td>
                  <td>{i.due}</td>
                  <td>
                    <Badge tone={i.tone}>{i.status}</Badge>
                  </td>
                  <td>
                    <button className="icon-button">
                      <Icon name="chevron" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function History({ go }: { go: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const rows = useMemo(() => historyRows.filter((r) => r.join(" ").includes(search)), [search]);
  return (
    <>
      <PageTitle
        title="ประวัติการตรวจสอบ"
        description="ค้นหาและดูรายละเอียดผลการตรวจสอบย้อนหลังของทุกอาคารและพื้นที่"
        actions={
          <button className="btn secondary">
            <Icon name="download" />
            ส่งออกข้อมูล
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="filter-row history-filter">
          <div className="search grow">
            <Icon name="search" size={18} />
            <input
              placeholder="ค้นหาอาคาร ผู้ตรวจสอบ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn secondary">
            <Icon name="calendar" />
            1–30 มิ.ย. 2568
          </button>
          <button className="btn secondary">อาคารทั้งหมด</button>
          <button className="btn secondary">ทุกสถานะ</button>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>วันที่ตรวจสอบ</th>
                <th>อาคาร / พื้นที่</th>
                <th>ผู้ตรวจสอบ</th>
                <th>รายการตรวจ</th>
                <th>ข้อบกพร่อง</th>
                <th>สถานะการตรวจ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <strong>{r[0]}</strong>
                  </td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]} รายการ</td>
                  <td>
                    <span className={Number(r[4]) ? "count-danger" : ""}>{r[4]}</span>
                  </td>
                  <td>
                    <Badge
                      tone={r[5] === "เรียบร้อย" ? "green" : r[5] === "กำลังตรวจ" ? "blue" : "orange"}
                    >
                      {r[5]}
                    </Badge>
                  </td>
                  <td>
                    <button className="table-action" onClick={() => go("checklist")}>
                      <Icon name="eye" size={17} />
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>แสดง 1–5 จาก 28 รายการ</span>
          <div>
            <button disabled>‹</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>›</button>
          </div>
        </div>
      </section>
    </>
  );
}

function Reports() {
  const bars = [84, 62, 91, 75, 56, 68];
  return (
    <>
      <PageTitle
        title="รายงานผลการตรวจสอบ"
        description="สรุปผลการตรวจและสถานะข้อบกพร่อง เพื่อใช้วางแผนดูแลอาคาร"
        actions={
          <button className="btn primary">
            <Icon name="download" />
            ดาวน์โหลดรายงาน PDF
          </button>
        }
      />
      <div className="report-filter">
        <div>
          <span>รอบรายงาน</span>
          <strong>1–30 มิถุนายน 2568</strong>
        </div>
        <button className="btn secondary">
          <Icon name="calendar" />
          เลือกช่วงเวลา
        </button>
      </div>
      <div className="summary-grid compact">
        <article className="mini-stat">
          <span>รอบการตรวจทั้งหมด</span>
          <strong>28</strong>
          <small>เพิ่มขึ้น 4 จากเดือนก่อน</small>
        </article>
        <article className="mini-stat green">
          <span>อัตราตรวจครบถ้วน</span>
          <strong>92%</strong>
          <small>เป้าหมาย 95%</small>
        </article>
        <article className="mini-stat red">
          <span>ข้อบกพร่องที่พบ</span>
          <strong>12</strong>
          <small>8 รายการยังเปิดอยู่</small>
        </article>
        <article className="mini-stat orange">
          <span>เวลาแก้ไขเฉลี่ย</span>
          <strong>3.2 วัน</strong>
          <small>เร็วขึ้น 0.8 วัน</small>
        </article>
      </div>
      <div className="report-grid">
        <section className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>ความครบถ้วนของการตรวจรายอาคาร</h3>
              <p>สัดส่วนรายการที่ตรวจแล้วในรอบปัจจุบัน</p>
            </div>
          </div>
          <div className="bar-chart">
            {bars.map((b, i) => (
              <div key={i}>
                <span>{b}%</span>
                <div>
                  <i style={{ height: `${b}%` }} />
                </div>
                <small>อาคาร {i + 1}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-title">
            <div>
              <h3>ข้อบกพร่องตามหมวด</h3>
              <p>จำนวนรายการที่พบในรอบนี้</p>
            </div>
          </div>
          <div className="category-report">
            {["ระบบไฟฟ้า", "โครงสร้างอาคาร", "ระบบน้ำและสุขาภิบาล", "ระบบป้องกันอัคคีภัย"].map((x, i) => (
              <div key={x}>
                <span>{x}</span>
                <div>
                  <i style={{ width: `${[75, 55, 35, 20][i]}%` }} />
                </div>
                <strong>{[4, 3, 3, 2][i]}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel insight">
        <div className="insight-icon">
          <Icon name="chart" />
        </div>
        <div>
          <h3>ข้อเสนอแนะสำหรับรอบถัดไป</h3>
          <p>
            ควรเร่งติดตามรายการระบบไฟฟ้า 2 รายการที่ใกล้ครบกำหนด และเพิ่มความถี่การตรวจอาคาร 3
            เนื่องจากพบข้อบกพร่องต่อเนื่อง 2 รอบ
          </p>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  function go(p: Page) {
    setPage(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function notify(s: string) {
    setToast(s);
    window.setTimeout(() => setToast(""), 2800);
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Icon name="shield" size={25} />
          </div>
          <div>
            <strong>Facility-Safety</strong>
            <span>สบปราบ</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <Icon name="x" />
          </button>
        </div>
        <nav>
          <div className="nav-label">เมนูหลัก</div>
          {navItems.map((item) => (
            <button
              className={
                page === item.id || (page === "defect" && item.id === "tracking") ? "active" : ""
              }
              key={item.id}
              onClick={() => go(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === "tracking" && <b>8</b>}
            </button>
          ))}
        </nav>
        <div className="side-help">
          <div>
            <Icon name="shield" />
          </div>
          <strong>ศูนย์ช่วยเหลือ</strong>
          <p>พบปัญหาการใช้งานระบบ ติดต่อผู้ดูแลโครงการ</p>
          <button>ติดต่อผู้ดูแล</button>
        </div>
        <div className="profile">
          <div className="avatar">วก</div>
          <div>
            <strong>วรวิทย์ ใจดี</strong>
            <span>ผู้ตรวจสอบอาคาร</span>
          </div>
          <Icon name="chevron" size={16} />
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} />}
      <div className="workspace">
        <header className="mobile-header">
          <button onClick={() => setMobileOpen(true)}>
            <Icon name="menu" />
          </button>
          <div className="brand-mark">
            <Icon name="shield" />
          </div>
          <strong>Facility-Safety</strong>
          <span />
          <div className="avatar">วก</div>
        </header>
        <main className={page === "checklist" ? "wide-main" : ""}>
          {page === "dashboard" && <Dashboard go={go} />}
          {page === "buildings" && <Buildings go={go} />}
          {page === "checklist" && <Checklist go={go} notify={notify} />}
          {page === "defect" && <Defect go={go} />}
          {page === "tracking" && <Tracking go={go} />}
          {page === "history" && <History go={go} />}
          {page === "reports" && <Reports />}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <Icon name="check" />
          {toast}
        </div>
      )}
    </div>
  );
}
