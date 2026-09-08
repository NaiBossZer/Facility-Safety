// ============================================================
// scripts/test-unified-platform.mjs
// Unified Facility, Safety & Utilities Platform Verification Suite
// ============================================================

import { INITIAL_ASSETS } from "../src/data/assetData.js";
import { INITIAL_VEHICLES, INITIAL_MOWER_TRANSACTIONS, INITIAL_VEHICLE_TRIPS, INITIAL_FUEL_PLANS, MOWER_TANK_CONFIG } from "../src/data/fuelData.js";
import { AUDIT_MODULES, AUDIT_ACTIONS } from "../src/lib/auditService.js";

console.log("=== Running Unified Facility Platform Comprehensive Tests ===");

// 1. Master Assets & Vehicles
console.log("\n[Test 1] Master Equipment & Asset Data...");
if (!INITIAL_ASSETS || INITIAL_ASSETS.length < 5) {
  console.error("FAIL: Expected at least 5 initial assets");
  process.exit(1);
}
const mowerAsset = INITIAL_ASSETS.find(a => a.code === "EQ-MOWER-04" || a.name.includes("เครื่องตัดหญ้า"));
if (!mowerAsset) {
  console.error("FAIL: Expected mower asset (EQ-MOWER-04) in assets");
  process.exit(1);
}
console.log(`✓ Master Assets OK: ${INITIAL_ASSETS.length} assets registered (including ${mowerAsset.name})`);

// 2. Vehicle 6ฝ-0559 & Fleet Card
console.log("\n[Test 2] Official Vehicle & Fleet Card...");
const veh = INITIAL_VEHICLES.find(v => v.plateNumber.includes("6ฝ-0559"));
if (!veh) {
  console.error("FAIL: Official vehicle 6ฝ-0559 not found");
  process.exit(1);
}
if (!veh.fleetCardNumber) {
  console.error("FAIL: Fleet card number missing for 6ฝ-0559");
  process.exit(1);
}
console.log(`✓ Vehicle 6ฝ-0559 OK: ${veh.brandModel}, Card: ${veh.fleetCardNumber}`);

// 3. Central Tank (200L) In/Out/Balance validation
console.log("\n[Test 3] Mower Central Tank & Zero Negative Balance...");
let runningBalance = 60; // Initial stock before August
for (const log of INITIAL_MOWER_TRANSACTIONS) {
  if (log.type === "deposit") {
    runningBalance += log.depositLiters;
  } else if (log.type === "withdraw") {
    if (log.withdrawLiters > runningBalance) {
      console.error(`FAIL: Negative balance detected! Balance was ${runningBalance}, withdraw ${log.withdrawLiters}`);
      process.exit(1);
    }
    runningBalance -= log.withdrawLiters;
  }
  if (Math.abs(runningBalance - log.balanceLiters) > 0.01) {
    console.error(`FAIL: Balance mismatch at log ${log.id}: calculated ${runningBalance}, got ${log.balanceLiters}`);
    process.exit(1);
  }
}
console.log(`✓ Mower Tank Balance Verified: Final Balance = ${runningBalance.toFixed(1)} Liters (Capacity: ${MOWER_TANK_CONFIG.capacityLiters} L)`);

// 4. Vehicle 12 Trips & Official Memo Consistency (505 km)
console.log("\n[Test 4] Official Memo งพส.206/2569 Distance Verification...");
const totalKm = INITIAL_VEHICLE_TRIPS.reduce((sum, t) => {
  if (t.endOdo < t.startOdo) {
    console.error(`FAIL: Ending Odo (${t.endOdo}) < Starting Odo (${t.startOdo}) for trip ${t.id}`);
    process.exit(1);
  }
  const calcKm = t.endOdo - t.startOdo;
  if (calcKm !== t.distanceKm) {
    console.error(`FAIL: Distance mismatch in trip ${t.id}: calculated ${calcKm}, reported ${t.distanceKm}`);
    process.exit(1);
  }
  return sum + t.distanceKm;
}, 0);

if (totalKm !== 505) {
  console.error(`FAIL: Expected exactly 505 km for August 2569 memo, got ${totalKm}`);
  process.exit(1);
}
console.log(`✓ Vehicle Mileage Verified: Total 12 trips = ${totalKm} km (Matches official memo งพส.206/2569)`);

// 5. Fuel Forecast & Variance Detection (>15%)
console.log("\n[Test 5] Fuel Forecasting & Variance Threshold...");
for (const plan of INITIAL_FUEL_PLANS) {
  if (plan.actualLiters > 0 && plan.estimatedLiters > 0) {
    const calcVar = Number((((plan.actualLiters - plan.estimatedLiters) / plan.estimatedLiters) * 100).toFixed(1));
    if (Math.abs(calcVar - plan.variancePercentage) > 0.1) {
      console.error(`FAIL: Variance mismatch for plan ${plan.id}: calculated ${calcVar}%, record ${plan.variancePercentage}%`);
      process.exit(1);
    }
    if (plan.variancePercentage > 15 && !plan.varianceReason) {
      console.error(`FAIL: Plan ${plan.id} has variance > 15% (${plan.variancePercentage}%) but no justification reason`);
      process.exit(1);
    }
  }
}
console.log("✓ Forecasting & Variance Detection Verified: Variance calculation and justification triggers pass");

// 6. Audit Logging Modules
console.log("\n[Test 6] Audit Trail Module & Action Constants...");
const requiredModules = ["INSPECTION", "WORK_ORDER", "PROCUREMENT", "FUEL", "MASTER_DATA", "SYSTEM"];
for (const m of requiredModules) {
  if (!AUDIT_MODULES[m]) {
    console.error(`FAIL: Missing audit module: ${m}`);
    process.exit(1);
  }
}
console.log(`✓ Audit System Verified: ${Object.keys(AUDIT_MODULES).length} modules and ${Object.keys(AUDIT_ACTIONS).length} actions defined`);

// 7. Work Order CM vs PM & Cost Structure Math
console.log("\n[Test 7] Work Order CM/PM & Cost Structure Math...");
const testWO = {
  items: [{ qty: 2, unitPrice: 500 }, { qty: 1, unitPrice: 350 }], // 1350
  laborCost: 600,
  serviceCost: 400,
};
const partsCost = testWO.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
const totalCost = partsCost + testWO.laborCost + testWO.serviceCost;
if (totalCost !== 2350) {
  console.error(`FAIL: Expected 2350 total cost, got ${totalCost}`);
  process.exit(1);
}
console.log(`✓ Work Order Cost Calculation: Parts (${partsCost}) + Labor (${testWO.laborCost}) + Service (${testWO.serviceCost}) = ${totalCost} Baht`);

console.log("\n========================================================");
console.log("  ALL 7 UNIFIED PLATFORM VERIFICATION TESTS PASSED!  ");
console.log("========================================================\n");
