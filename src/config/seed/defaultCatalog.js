// ============================================================
// defaultCatalog.js — ข้อมูลตั้งต้นแยก 2 Track ชัดเจน
// Track 1: safety_legal (กฎหมายและความปลอดภัย)
// Track 2: facility_continuity (ความต่อเนื่องสาธารณูปโภค)
// ============================================================

export function buildDefaultCatalog() {
  return {
    catalogVersion: 2,
    categories: [
      // ----------------------------------------------------
      // TRACK 1: ความปลอดภัยและกฎหมาย (Safety & Legal Compliance)
      // ----------------------------------------------------
      {
        id: "cat_structure",
        track: "safety_legal",
        name: "โครงสร้างอาคาร & ความมั่นคงแข็งแรง",
        color: "slate",
        icon: "Building2",
        order: 1,
        active: true,
      },
      {
        id: "cat_fire_safety",
        track: "safety_legal",
        name: "ระบบป้องกัน & ระงับอัคคีภัย",
        color: "red",
        icon: "Flame",
        order: 2,
        active: true,
      },
      {
        id: "cat_elec_safety",
        track: "safety_legal",
        name: "ระบบไฟฟ้าหลัก & สายล่อฟ้าแรงสูง",
        color: "amber",
        icon: "Zap",
        order: 3,
        active: true,
      },
      {
        id: "cat_egress_lifesafety",
        track: "safety_legal",
        name: "เส้นทางหนีไฟ ป้ายเตือน & ทางออกฉุกเฉิน",
        color: "rose",
        icon: "DoorOpen",
        order: 4,
        active: true,
      },

      // ----------------------------------------------------
      // TRACK 2: ความต่อเนื่องสาธารณูปโภค (Facility Continuity)
      // ----------------------------------------------------
      {
        id: "cat_hvac_water",
        track: "facility_continuity",
        name: "ระบบปรับอากาศ & ปั๊มน้ำอาคาร",
        color: "sky",
        icon: "Wind",
        order: 5,
        active: true,
      },
      {
        id: "cat_solar_farm",
        track: "facility_continuity",
        name: "ระบบ Solar Cell & Smart Farm",
        color: "emerald",
        icon: "Lightbulb",
        order: 6,
        active: true,
      },
      {
        id: "cat_sanitation_plumbing",
        track: "facility_continuity",
        name: "ระบบประปา สุขาภิบาล & ถังเก็บน้ำ",
        color: "cyan",
        icon: "Droplets",
        order: 7,
        active: true,
      },
      {
        id: "cat_fleet_vehicle",
        track: "facility_continuity",
        name: "ยานพาหนะ & เครื่องจักรกล",
        color: "violet",
        icon: "Wrench",
        order: 8,
        active: true,
      },
    ],

    items: [
      // Track 1: โครงสร้างอาคาร
      {
        id: "itm_st1",
        categoryId: "cat_structure",
        label: "ฐานราก/เสาเข็ม – ตรวจสอบการทรุดตัวหรือเอียงของฐานราก",
        standard: "ไม่มีรอยแตกร้าวทรุดตัวเกิน 5 มม. หรือเอียงเกินมาตรฐาน มยผ.",
        frequency: "yearly",
        critical: true,
        parts: [{ id: "p1", name: "งานเสริมฐานราก + Micro Pile", qty: 1, unit: "งาน", unitPrice: 185000 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_st2",
        categoryId: "cat_structure",
        label: "เสาและคาน – รอยแตกร้าววิบัติ (Structural Crack)",
        standard: "ไม่พบรอยแตกร้าวแนวดิ่งลึกถึงเหล็กเสริมหรือสนิมดันคอนกรีตแตก",
        frequency: "yearly",
        critical: true,
        parts: [
          { id: "p2", name: "วัสดุ Epoxy Injection + Carbon Fiber Wrap", qty: 12, unit: "เมตร", unitPrice: 4500 },
          { id: "p3", name: "ปูนซ่อมโครงสร้าง Non-Shrink Grout", qty: 20, unit: "ถุง", unitPrice: 480 },
        ],
        order: 2,
        active: true,
      },
      {
        id: "itm_st3",
        categoryId: "cat_structure",
        label: "หลังคา/โครงถักเหล็ก – การโก่งตัวและสนิมกัดกร่อนโครงสร้าง",
        standard: "โครงเหล็กไม่มีสนิมกินลึก และแผ่นหลังคาไม่แอ่นตัว",
        frequency: "biannual",
        critical: false,
        parts: [{ id: "p4", name: "แผ่นเมทัลชีทกันความร้อน + สกรูยึด", qty: 30, unit: "แผ่น", unitPrice: 620 }],
        order: 3,
        active: true,
      },

      // Track 1: อัคคีภัย
      {
        id: "itm_fi1",
        categoryId: "cat_fire_safety",
        label: "ถังดับเพลิงมือถือ – ตรวจสอบแรงดันและสภาพพร้อมใช้",
        standard: "เกจ์วัดความดันอยู่ในแถบสีเขียว สลักและซีลไม่ขาด ไม่หมดอายุ",
        frequency: "monthly",
        critical: true,
        parts: [{ id: "p5", name: "บรรจุผงเคมีแห้ง/ก๊าซ CO2 ขนาด 15 ปอนด์", qty: 12, unit: "ถัง", unitPrice: 450 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_fi2",
        categoryId: "cat_fire_safety",
        label: "ตู้สายฉีดน้ำดับเพลิง (Fire Hose Cabinet) & วาล์วควบคุม",
        standard: "สายส่งน้ำไม่รั่วซึม หัวฉีดปรับได้ และแรงดันปลายสายไม่น้อยกว่า 4.5 bar",
        frequency: "biannual",
        critical: true,
        parts: [{ id: "p6", name: "สายส่งน้ำดับเพลิงสังเคราะห์ 1.5 นิ้ว ยาว 30 ม.", qty: 4, unit: "ชุด", unitPrice: 3800 }],
        order: 2,
        active: true,
      },
      {
        id: "itm_fi3",
        categoryId: "cat_fire_safety",
        label: "ระบบแจ้งเหตุเพลิงไหม้ (Fire Alarm Panel & Smoke Detector)",
        standard: "ทดสอบสัญญาณเตือนทำงานสมบูรณ์ทุกโซน ไม่มีสัญลักษณ์ Trouble",
        frequency: "monthly",
        critical: true,
        parts: [{ id: "p7", name: "Smoke Detector ชนิด Photoelectric", qty: 10, unit: "ตัว", unitPrice: 1450 }],
        order: 3,
        active: true,
      },

      // Track 1: ไฟฟ้าแรงสูง & สายล่อฟ้า
      {
        id: "itm_el1",
        categoryId: "cat_elec_safety",
        label: "ตู้ MDB และจุดต่อบัสบาร์ (Thermo Scan)",
        standard: "อุณหภูมิจุดต่อไม่เกิน 65°C ไม่พบจุดความร้อนสะสม (Hot Spot)",
        frequency: "biannual",
        critical: true,
        parts: [{ id: "p8", name: "งานขันแน่นบัสบาร์ + เปลี่ยนหางปลาแรงสูง", qty: 1, unit: "งาน", unitPrice: 18500 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_el2",
        categoryId: "cat_elec_safety",
        label: "ระบบสายดิน (Grounding) และหลักดิน",
        standard: "ค่าความต้านทานดินต้องต่ำกว่า 5 โอห์ม ตามมาตรฐาน วสท.",
        frequency: "yearly",
        critical: true,
        parts: [{ id: "p9", name: "แท่งกราวด์ทองแดง 5/8 นิ้ว + สาย THW 35 sq.mm.", qty: 6, unit: "ชุด", unitPrice: 2750 }],
        order: 2,
        active: true,
      },

      // Track 1: ทางหนีไฟ
      {
        id: "itm_eg1",
        categoryId: "cat_egress_lifesafety",
        label: "ไฟฉุกเฉินและป้ายทางออกหนีไฟ (Emergency Light / Exit Sign)",
        standard: "สำรองไฟส่องสว่างได้ไม่น้อยกว่า 2 ชั่วโมง เมื่อตัดไฟหลัก",
        frequency: "monthly",
        critical: true,
        parts: [{ id: "p10", name: "แบตเตอรี่ไฟฉุกเฉิน 12V 7.2Ah + หลอด LED", qty: 18, unit: "ชุด", unitPrice: 2350 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_eg2",
        categoryId: "cat_egress_lifesafety",
        label: "ประตูหนีไฟและอุปกรณ์ Panic Bar",
        standard: "เปิดออกได้สะดวก ไม่มีสิ่งกีดขวาง และปิดกลับสนิทอัตโนมัติ",
        frequency: "monthly",
        critical: true,
        parts: [{ id: "p11", name: "ชุดคานผลักประตูหนีไฟ (Panic Exit Device)", qty: 3, unit: "ชุด", unitPrice: 4200 }],
        order: 2,
        active: true,
      },

      // ----------------------------------------------------
      // Track 2: แอร์และปั๊มน้ำ (Facility Continuity)
      // ----------------------------------------------------
      {
        id: "itm_hv1",
        categoryId: "cat_hvac_water",
        label: "เครื่องปรับอากาศ – ตรวจวัดความเย็นและการรั่วซึมของน้ำยา",
        standard: "อุณหภูมิหน้าช่องจ่ายลม 12-16°C กระแสไฟไม่เกินพิกัด",
        frequency: "monthly",
        critical: false,
        parts: [{ id: "p12", name: "น้ำยาแอร์ R32 พร้อมค่าบริการเติม", qty: 6, unit: "เครื่อง", unitPrice: 1650 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_hv2",
        categoryId: "cat_hvac_water",
        label: "ล้างแผงคอยล์เย็น/คอยล์ร้อน และเปลี่ยนฟิลเตอร์",
        standard: "ทำความสะอาดตามรอบทุก 3-6 เดือนเพื่อลดโหลดกินไฟ",
        frequency: "quarterly",
        critical: false,
        parts: [{ id: "p13", name: "ค่าบริการล้างแอร์ขนาด 25,000 BTU", qty: 14, unit: "เครื่อง", unitPrice: 750 }],
        order: 2,
        active: true,
      },
      {
        id: "itm_hv3",
        categoryId: "cat_hvac_water",
        label: "ปั๊มน้ำเพิ่มแรงดัน (Booster Pump) – เสียงและการสั่นสะเทือน",
        standard: "แรงดันคงที่ 2.5-3.5 bar ปั๊มตัด-ต่อตามเกณฑ์ ไม่มีเสียงลูกปืนแตก",
        frequency: "weekly",
        critical: false,
        parts: [{ id: "p14", name: "ปั๊มน้ำอัตโนมัติแรงดันคงที่ 400W + ตู้ควบคุม", qty: 2, unit: "ชุด", unitPrice: 8500 }],
        order: 3,
        active: true,
      },

      // Track 2: Solar & Farm
      {
        id: "itm_so1",
        categoryId: "cat_solar_farm",
        label: "Inverter โซลาร์เซลล์ – ตรวจสอบ Error Code และประสิทธิภาพแปลงไฟ",
        standard: "ไม่ฟ้อง Error E-042 หรือ Warning และอุณหภูมิระบายความร้อนปกติ",
        frequency: "weekly",
        critical: false,
        parts: [{ id: "p15", name: "Grid-Tie Inverter 10kW 3-Phase", qty: 1, unit: "เครื่อง", unitPrice: 62000 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_so2",
        categoryId: "cat_solar_farm",
        label: "แผงโซลาร์เซลล์ – ล้างฝุ่นคราบตะกรันและตรวจวัดกระแส String",
        standard: "แผงสะอาด ไม่มีเงาบัง กระแสแต่ละ String สม่ำเสมอ",
        frequency: "monthly",
        critical: false,
        parts: [{ id: "p16", name: "ค่าบริการล้างแผงโซลาร์เซลล์", qty: 120, unit: "แผง", unitPrice: 65 }],
        order: 2,
        active: true,
      },

      // Track 2: ประปาและสุขาภิบาล
      {
        id: "itm_pl1",
        categoryId: "cat_sanitation_plumbing",
        label: "ถังพักน้ำดีและถังเก็บน้ำดาดฟ้า – ความสะอาดและลูกลอยตัดน้ำ",
        standard: "ไม่มีตะกอนก้นถัง วาล์วลูกลอยตัดสนิทน้ำไม่ล้นท่อ Overflow",
        frequency: "monthly",
        critical: false,
        parts: [{ id: "p17", name: "วาล์วลูกลอยทองเหลือง 2 นิ้ว", qty: 3, unit: "ตัว", unitPrice: 1250 }],
        order: 1,
        active: true,
      },

      // Track 2: ยานพาหนะ
      {
        id: "itm_vh1",
        categoryId: "cat_fleet_vehicle",
        label: "ระดับของเหลว – น้ำมันเครื่อง น้ำมันเบรก และน้ำหล่อเย็นเครื่องยนต์",
        standard: "ระดับของเหลวอยู่ระหว่างขีด Min-Max ไม่รั่วหยดใต้ท้องรถ",
        frequency: "weekly",
        critical: false,
        parts: [{ id: "p18", name: "น้ำมันเครื่องดีเซลสังเคราะห์ + กรองแท้", qty: 3, unit: "ชุด", unitPrice: 2450 }],
        order: 1,
        active: true,
      },
      {
        id: "itm_vh2",
        categoryId: "cat_fleet_vehicle",
        label: "ระบบเบรกและผ้าเบรก – ระยะเบรกและความหนาผ้าเบรก",
        standard: "ความหนาผ้าเบรกไม่น้อยกว่า 3 มม. เหยียบเบรกไม่จมหรือดึงข้าง",
        frequency: "monthly",
        critical: true,
        parts: [{ id: "p19", name: "ชุดผ้าเบรกหน้า-หลัง + น้ำมันเบรก DOT4", qty: 2, unit: "ชุด", unitPrice: 4600 }],
        order: 2,
        active: true,
      },
    ],

    buildings: [
      { id: "bld_1", name: "อาคาร 1", code: "B1", detail: "อาคารอำนวยการและสำนักงานคณบดี", order: 1, active: true },
      { id: "bld_2", name: "อาคาร 2", code: "B2", detail: "อาคารเรียนรวมและปฏิบัติการวิทยาศาสตร์", order: 2, active: true },
      { id: "bld_3", name: "อาคาร 3", code: "B3", detail: "คลังพัสดุกลางและศูนย์โลจิสติกส์", order: 3, active: true },
      { id: "bld_4", name: "อาคาร 4", code: "B4", detail: "หอประชุมใหญ่และศูนย์กิจกรรมนักศึกษา", order: 4, active: true },
      { id: "bld_5", name: "อาคาร 5", code: "B5", detail: "โรงเรือน Smart Farm & Solar Rooftop", order: 5, active: true },
      { id: "bld_6", name: "อาคาร 6", code: "B6", detail: "โรงจอดรถ ยานพาหนะและอาคารซ่อมบำรุง", order: 6, active: true },
    ],

    vendors: [
      { id: "ven_1", name: "บริษัท ไทยเทคนิค ซัพพลาย จำกัด", tax: "0105542001234", tel: "02-591-8800", factor: 1.0, order: 1, active: true },
      { id: "ven_2", name: "หจก. ศรีอยุธยาการช่างและบริการ", tax: "0143551000987", tel: "035-241-556", factor: 1.075, order: 2, active: true },
      { id: "ven_3", name: "ร้าน พี.เอ็น. วัสดุภัณฑ์และวิศวกรรม", tax: "3100600123456", tel: "081-445-2290", factor: 1.142, order: 3, active: true },
    ],

    budget: {
      fiscalYear: 2569,
      total: 2500000,
    },

    // รายชื่อบุคลากร — ใช้ Login เข้าระบบ (pin เริ่มต้น 1234)
    personnel: [
      {
        id: "per_1",
        name: "นายสมชาย ตรวจดี",
        position: "เจ้าหน้าที่ตรวจสอบอาคารและความปลอดภัย",
        department: "งานอาคารสถานที่และยานพาหนะ",
        role: "inspector",
        phone: "081-234-5678",
        email: "somchai.tru@mahidol.edu",
        isResponsible: true,
        pin: "1234",
      },
      {
        id: "per_2",
        name: "นายประเสริฐ มั่นคงชัย",
        position: "หัวหน้างานอาคารสถานที่และความปลอดภัย",
        department: "งานอาคารสถานที่และยานพาหนะ",
        role: "section_head",
        phone: "089-987-6543",
        email: "prasert.man@mahidol.edu",
        isResponsible: true,
        pin: "1234",
      },
      {
        id: "per_3",
        name: "ผศ.ดร. นิทัศน์ สมานพงษ์",
        position: "รองคณบดีฝ่ายบริหารและพันธกิจเพื่อสังคม",
        department: "สำนักงานคณบดี",
        role: "deputy_dean",
        phone: "054-234-000",
        email: "nitad.sam@mahidol.edu",
        isResponsible: false,
        pin: "1234",
      },
    ],
  };
}