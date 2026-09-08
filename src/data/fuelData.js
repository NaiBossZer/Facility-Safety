// ============================================================
// fuelData.js — ข้อมูลและโมเดลระบบจัดการเชื้อเพลิง (Fuel Management)
// คณะสิ่งแวดล้อมและทรัพยากรศาสตร์ มหาวิทยาลัยมหิดล (งานพันธกิจเพื่อสังคม ลำปาง)
// ============================================================

export const INITIAL_VEHICLES = [
  {
    id: "veh-01",
    plateNumber: "6ฝ-0559",
    province: "กรุงเทพมหานคร",
    brandModel: "Toyota Hilux Revo Double Cab 2.4",
    type: "กระบะ 4 ประตู (ดีเซล)",
    assignedUnit: "งานพันธกิจเพื่อสังคม (ลำปาง)",
    primaryDriver: "นายจตุพร",
    currentOdometer: 673210, // เลขไมล์ล่าสุด ณ สิ้นเดือน ส.ค. 2569
    avgConsumptionKmPerLiter: 11.5, // ค่าเฉลี่ยมาตรฐาน (กม./ลิตร)
    fuelType: "ดีเซล B7 / PTT Fleet Card",
    fleetCardNumber: "PTT-FLEET-5590-2026",
    fleetCardLimitMonthly: 15000,
    status: "active",
    tankCapacityLiters: 80,
    nextMaintenanceKm: 675000, // รอบเช็คระยะถัดไป
  },
];

// ข้อมูลการเดินทางจริงจากตารางบันทึกการใช้รถยนต์ 6ฝ-0559 ประจำเดือน สิงหาคม 2569 (ตามเอกสารแนบ งพส.206/2569)
export const INITIAL_VEHICLE_TRIPS = [
  {
    id: "trip-01",
    vehicleId: "veh-01",
    date: "2026-08-03",
    route: "ผาลาด - เทศบาล",
    startOdo: 672705,
    endOdo: 672734,
    distanceKm: 29,
    driver: "จตุพร",
    purpose: "ติดต่อราชการเทศบาลตำบลแม่เมาะ/ผาลาด",
    notes: "",
  },
  {
    id: "trip-02",
    vehicleId: "veh-01",
    date: "2026-08-06",
    route: "ผาลาด - สบปราบ",
    startOdo: 672734,
    endOdo: 672785,
    distanceKm: 51,
    driver: "จตุพร",
    purpose: "สำรวจพื้นที่โครงการพันธกิจเพื่อสังคม อ.สบปราบ",
    notes: "",
  },
  {
    id: "trip-03",
    vehicleId: "veh-01",
    date: "2026-08-06",
    route: "สบปราบ - ผาลาด",
    startOdo: 672785,
    endOdo: 672835,
    distanceKm: 50,
    driver: "จตุพร",
    purpose: "เดินทางกลับศูนย์ประสานงานผาลาด",
    notes: "",
  },
  {
    id: "trip-04",
    vehicleId: "veh-01",
    date: "2026-08-13",
    route: "ผาลาด - สบปราบ",
    startOdo: 672835,
    endOdo: 672889,
    distanceKm: 54,
    driver: "จตุพร",
    purpose: "ลงพื้นที่ติดตามแปลงทดลองเกษตรสบปราบ",
    notes: "",
  },
  {
    id: "trip-05",
    vehicleId: "veh-01",
    date: "2026-08-14",
    route: "สบปราบ - รับอุปกรณ์ซ่อมบำรุง",
    startOdo: 672889,
    endOdo: 672914,
    distanceKm: 25,
    driver: "จตุพร",
    purpose: "รับอุปกรณ์ซ่อมบำรุงระบบประปาและสาธารณูปโภค",
    notes: "",
  },
  {
    id: "trip-06",
    vehicleId: "veh-01",
    date: "2026-08-14",
    route: "สบปราบ - ผาลาด",
    startOdo: 672914,
    endOdo: 672965,
    distanceKm: 51,
    driver: "จตุพร",
    purpose: "ขนย้ายอุปกรณ์กลับศูนย์ประสานงานผาลาด",
    notes: "",
  },
  {
    id: "trip-07",
    vehicleId: "veh-01",
    date: "2026-08-17",
    route: "ผาลาด - เทศบาล",
    startOdo: 672965,
    endOdo: 672995,
    distanceKm: 30,
    driver: "จตุพร",
    purpose: "ส่งเอกสารรายงานร่วมโครงการสิ่งแวดล้อม",
    notes: "",
  },
  {
    id: "trip-08",
    vehicleId: "veh-01",
    date: "2026-08-20",
    route: "ผาลาด - สบปราบ",
    startOdo: 672995,
    endOdo: 673045,
    distanceKm: 50,
    driver: "จตุพร",
    purpose: "ส่งทีมนักวิจัยเก็บตัวอย่างดินและน้ำ",
    notes: "",
  },
  {
    id: "trip-09",
    vehicleId: "veh-01",
    date: "2026-08-20",
    route: "สบปราบ - ซื้อของใช้งานบ้าน",
    startOdo: 673045,
    endOdo: 673055,
    distanceKm: 10,
    driver: "จตุพร",
    purpose: "จัดซื้อวัสดุสิ้นเปลืองงานบ้านพักและศูนย์ปฏิบัติการ",
    notes: "",
  },
  {
    id: "trip-10",
    vehicleId: "veh-01",
    date: "2026-08-21",
    route: "สบปราบ - ผาลาด",
    startOdo: 673055,
    endOdo: 673108,
    distanceKm: 53,
    driver: "จตุพร",
    purpose: "นำส่งตัวอย่างงานวิจัยกลับผาลาด",
    notes: "",
  },
  {
    id: "trip-11",
    vehicleId: "veh-01",
    date: "2026-08-27",
    route: "ผาลาด - สบปราบ",
    startOdo: 673108,
    endOdo: 673158,
    distanceKm: 50,
    driver: "จตุพร",
    purpose: "ตรวจความเรียบร้อยแปลงสาธิตปลายเดือน",
    notes: "",
  },
  {
    id: "trip-12",
    vehicleId: "veh-01",
    date: "2026-08-27",
    route: "สบปราบ - ผาลาด",
    startOdo: 673158,
    endOdo: 673210,
    distanceKm: 52,
    driver: "จตุพร",
    purpose: "เดินทางกลับศูนย์ผาลาดและจอดประจำที่",
    notes: "รวม 505 กม. เดือน ส.ค. 69 ไม่มีการรูดบัตร Fleet Card",
  },
];

// ประวัติการเติมน้ำมันรถยนต์ (Refuel Logs)
export const INITIAL_REFUEL_LOGS = [
  {
    id: "refuel-01",
    vehicleId: "veh-01",
    date: "2026-07-28",
    odometerReading: 672500,
    volumeLiters: 65.0,
    pricePerLiter: 33.5,
    totalAmount: 2177.5,
    driverName: "จตุพร",
    paymentMethod: "PTT Fleet Card",
    receiptNo: "PTT-LP-260728-881",
    stationName: "ปตท. สบปราบ ลำปาง",
    receiptAttachment: null,
    odometerImage: null,
    notes: "เติมเต็มถังก่อนเริ่มภารกิจเดือน ส.ค.",
  },
];

// ข้อมูลคลังถังกลางเครื่องตัดหญ้า (Mower Central Tank: ถัง 200 ลิตร สำหรับน้ำมันแก๊สโซฮอล์ 95)
export const MOWER_TANK_CONFIG = {
  capacityLiters: 200,
  minSafetyStockLiters: 40, // จุดสั่งซื้อเตือนเมื่อต่ำกว่า 40 ลิตร
  fuelName: "แก๊สโซฮอล์ 95 (สำหรับเครื่องตัดหญ้าสะพายบ่า)",
  location: "โรงเก็บเครื่องมือช่างและงานสวน ชั้น 1 อาคารบริการ",
  avgConsumptionPerHr: 1.25, // ลิตร/ชั่วโมงทำงานเครื่องตัดหญ้า
  pricePerLiterEst: 38.5,
};

// ตารางบันทึกการเบิก-เติมน้ำมันถังกลางเครื่องตัดหญ้า (ตามโครงสร้าง Excel หน่วยงาน)
export const INITIAL_MOWER_TRANSACTIONS = [
  {
    id: "mw-tx-01",
    date: "2026-08-01",
    type: "deposit", // เติมเข้า
    depositLiters: 100.0,
    withdrawLiters: 0,
    balanceLiters: 160.0, // (เดิม 60 + 100)
    requestedBy: "นายสมชาย (หัวหน้าหมวดสวน)",
    purpose: "จัดซื้อเติมถังกลางสำรองรับฤดูฝน (ใบเสร็จ บมจ.ปตท.)",
    receiptAttachment: "slip-aug-01.jpg",
    receiptNo: "INV-PTT-44091",
    totalAmount: 3850,
  },
  {
    id: "mw-tx-02",
    date: "2026-08-05",
    type: "withdraw", // เบิกออก
    depositLiters: 0,
    withdrawLiters: 15.0,
    balanceLiters: 145.0,
    requestedBy: "นายสุรชัย (คนงานสวน 1)",
    purpose: "ตัดหญ้าสนามฟุตบอลและลานจอดรถหน้าอาคารหลัก (12 ชม.เครื่อง)",
    receiptAttachment: null,
    receiptNo: "-",
    totalAmount: 0,
  },
  {
    id: "mw-tx-03",
    date: "2026-08-12",
    type: "withdraw",
    depositLiters: 0,
    withdrawLiters: 20.0,
    balanceLiters: 125.0,
    requestedBy: "นายบุญเลิศ (คนงานสวน 2)",
    purpose: "ตัดหญ้าแนวรั้วรอบแปลงสาธิตเกษตรและทางเดินรอบสระ (16 ชม.เครื่อง)",
    receiptAttachment: null,
    receiptNo: "-",
    totalAmount: 0,
  },
  {
    id: "mw-tx-04",
    date: "2026-08-19",
    type: "withdraw",
    depositLiters: 0,
    withdrawLiters: 18.0,
    balanceLiters: 107.0,
    requestedBy: "นายสมชาย (หัวหน้าหมวดสวน)",
    purpose: "ตัดหญ้าและตัดแต่งกิ่งไม้บริเวณแนวเสาไฟฟ้าแรงสูง (14 ชม.เครื่อง)",
    receiptAttachment: null,
    receiptNo: "-",
    totalAmount: 0,
  },
  {
    id: "mw-tx-05",
    date: "2026-08-26",
    type: "withdraw",
    depositLiters: 0,
    withdrawLiters: 12.0,
    balanceLiters: 95.0,
    requestedBy: "นายสุรชัย (คนงานสวน 1)",
    purpose: "ตัดหญ้าบริเวณบ้านพักอาจารย์และเจ้าหน้าที่ (10 ชม.เครื่อง)",
    receiptAttachment: null,
    receiptNo: "-",
    totalAmount: 0,
  },
];

// แผนการประเมินการใช้น้ำมันล่วงหน้า (Fuel Planning & Forecasting)
export const INITIAL_FUEL_PLANS = [
  {
    id: "plan-aug-01",
    month: "2026-08",
    targetType: "vehicle",
    assetName: "รถยนต์ 6ฝ-0559 กทม.",
    targetDate: "2026-08-01",
    estimatedWorkUnit: 520, // คาดการณ์ 520 กม.
    unitLabel: "กม.",
    avgRate: 11.5, // 11.5 กม./ลิตร
    estimatedLiters: 45.2, // 520 / 11.5
    estimatedBudget: 1515, // 45.2 * 33.5
    actualWorkUnit: 505, // วิ่งจริง 505 กม.
    actualLiters: 43.9, // 505 / 11.5
    actualBudget: 0, // ไม่ได้เติมเพิ่ม (ใช้ค้างถัง)
    variancePercentage: -2.9, // (43.9 - 45.2) / 45.2 * 100 = -2.876% -> -2.9%
    status: "completed",
    varianceReason: "ปฏิบัติงานตามเส้นทางปกติ ประหยัดน้ำมันได้ตามแผน",
  },
  {
    id: "plan-aug-02",
    month: "2026-08",
    targetType: "mower",
    assetName: "เครื่องตัดหญ้าสะพายบ่า (3 เครื่อง)",
    targetDate: "2026-08-01",
    estimatedWorkUnit: 50, // วางแผนตัด 50 ชั่วโมง
    unitLabel: "ชั่วโมง",
    avgRate: 1.25, // 1.25 ลิตร/ชม.
    estimatedLiters: 62.5, // 50 * 1.25
    estimatedBudget: 2406,
    actualWorkUnit: 52, // ทำจริง 52 ชั่วโมง
    actualLiters: 65.0, // เบิกจริง 65 ลิตร
    actualBudget: 2502,
    variancePercentage: 4.0, // ใช้จริงเกินแผน 4% (ไม่เกิน Threshold 15%)
    status: "completed",
    varianceReason: "หญ้าหนาแน่นช่วงหน้าฝนรอบแปลงทดลอง",
  },
  {
    id: "plan-sep-01",
    month: "2026-09",
    targetType: "vehicle",
    assetName: "รถยนต์ 6ฝ-0559 กทม.",
    targetDate: "2026-09-01",
    estimatedWorkUnit: 600,
    unitLabel: "กม.",
    avgRate: 11.5,
    estimatedLiters: 52.2,
    estimatedBudget: 1750,
    actualWorkUnit: 0,
    actualLiters: 0,
    actualBudget: 0,
    variancePercentage: 0,
    status: "active",
    varianceReason: "",
  },
  {
    id: "plan-sep-02",
    month: "2026-09",
    targetType: "mower",
    assetName: "เครื่องตัดหญ้าสะพายบ่า (3 เครื่อง)",
    targetDate: "2026-09-01",
    estimatedWorkUnit: 60,
    unitLabel: "ชั่วโมง",
    avgRate: 1.25,
    estimatedLiters: 75.0,
    estimatedBudget: 2887,
    actualWorkUnit: 0,
    actualLiters: 0,
    actualBudget: 0,
    variancePercentage: 0,
    status: "active",
    varianceReason: "",
  },
];
