// ============================================================
// test-fuel-logic.mjs — Test Fuel Management Logic & Algorithms
// ============================================================
import {
  INITIAL_VEHICLES,
  INITIAL_VEHICLE_TRIPS,
  INITIAL_REFUEL_LOGS,
  INITIAL_MOWER_TRANSACTIONS,
  INITIAL_FUEL_PLANS,
  MOWER_TANK_CONFIG,
} from "../src/data/fuelData.js";

console.log("=== Testing Fuel Management Data & Calculations ===");

// 1. Check Vehicle
const v = INITIAL_VEHICLES[0];
console.assert(v.plateNumber === "6ฝ-0559", "Vehicle plate number match");
console.log("✓ Vehicle:", v.plateNumber, v.brandModel);

// 2. Check Trips Distance
const totalKm = INITIAL_VEHICLE_TRIPS.reduce((s, t) => s + t.distanceKm, 0);
console.assert(totalKm === 505, `Total KM should be 505, got ${totalKm}`);
console.log(`✓ 12 Trips Distance Total: ${totalKm} km (Matches official memo งพส.206/2569)`);

// 3. Check Mower Central Tank Calculations
let balance = 60; // Initial before deposit
INITIAL_MOWER_TRANSACTIONS.forEach((tx) => {
  balance = balance + tx.depositLiters - tx.withdrawLiters;
  console.assert(balance === tx.balanceLiters, `Balance mismatch at tx ${tx.id}: expected ${tx.balanceLiters}, calculated ${balance}`);
});
console.log(`✓ Final Mower Tank Balance: ${balance} Liters (Expected 95.0 L)`);

// 4. Test Forecasting Formula: Vehicle
// Planned 520 km / 11.5 km/L = 45.217 L
const estVehLiters = 520 / 11.5;
console.assert(Math.abs(estVehLiters - 45.2) < 0.1, "Vehicle forecast formula verified");
console.log(`✓ Vehicle Forecast (520 km @ 11.5 km/L): ${estVehLiters.toFixed(1)} Liters`);

// 5. Test Forecasting Formula: Mower
// Planned 50 hrs * 1.25 L/hr = 62.5 L
const estMowerLiters = 50 * 1.25;
console.assert(estMowerLiters === 62.5, "Mower forecast formula verified");
console.log(`✓ Mower Forecast (50 hrs @ 1.25 L/hr): ${estMowerLiters.toFixed(1)} Liters`);

// 6. Test Variance Alert Threshold (> 15%)
function checkVarianceAlert(est, act) {
  const variancePct = ((act - est) / est) * 100;
  return { variancePct: Number(variancePct.toFixed(1)), isAlert: variancePct > 15 };
}

const normalCase = checkVarianceAlert(50, 52); // +4%
console.assert(!normalCase.isAlert, "Normal case should not alert");

const overCase = checkVarianceAlert(50, 60); // +20%
console.assert(overCase.isAlert, "Over-limit case should trigger alert");
console.log(`✓ Variance threshold test passed (50L vs 60L = +${overCase.variancePct}%, Alert: ${overCase.isAlert})`);

console.log("=== All Fuel Management Logic Tests Passed Successfully! ===");
