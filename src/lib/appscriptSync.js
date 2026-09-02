// ============================================================
// appscriptSync.js — Client-Side Connector for Google Sheets / Apps Script Backend
// ใช้งานเป็น REST API เชื่อมระหว่าง Web App กับ Google Sheets
// ============================================================
import { readJSON, writeJSON, KEYS } from "./storage";

/** Key สำหรับเก็บ AppScript Web App URL */
const APPSCRIPT_URL_KEY = "fsa:v2:appscript_url";

export function getAppScriptUrl() {
  return readJSON(APPSCRIPT_URL_KEY, "");
}

export function setAppScriptUrl(url) {
  return writeJSON(APPSCRIPT_URL_KEY, String(url || "").trim());
}

/**
 * 1. ดึงข้อมูลทั้งหมดจาก Google Sheets ผ่าน Apps Script (GET)
 * Returns { ok, data: { personnel, catalog, buildings, vendors }, error }
 */
export async function pullFromAppScript() {
  const url = getAppScriptUrl();
  if (!url) return { ok: false, error: "ยังไม่ได้ระบุ Google Apps Script Web App URL" };

  try {
    const res = await fetch(`${url}?action=getAllData`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    return { ok: true, data: result };
  } catch (err) {
    console.error("[AppScript] Pull failed:", err);
    return { ok: false, error: err.message || "เชื่อมต่อ Google Apps Script ไม่สำเร็จ" };
  }
}

/**
 * 2. ซิงก์ข้อมูลจาก Web App ไปบันทึกลง Google Sheets (POST)
 * @param {string} action 'saveCatalog' | 'savePersonnel' | 'syncAll'
 * @param {object} payload ข้อมูลที่ต้องการอัปเดตลง Sheet
 */
export async function pushToAppScript(action, payload) {
  const url = getAppScriptUrl();
  if (!url) return { ok: false, error: "ยังไม่ได้ระบุ Google Apps Script Web App URL" };

  try {
    const res = await fetch(url, {
      method: "POST",
      mode: "no-cors", // Apps Script redirects support
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    return { ok: true };
  } catch (err) {
    console.error("[AppScript] Push failed:", err);
    return { ok: false, error: err.message || "ส่งข้อมูลไปยัง Google Apps Script ไม่สำเร็จ" };
  }
}

/**
 * 3. ตัวอย่าง Code.gs (Google Apps Script) สำหรับคัดลอกไปวางใน Google Sheet Script Editor
 */
export const APPSCRIPT_BACKEND_CODE_SAMPLE = `
function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "getAllData") {
    var personnelSheet = ss.getSheetByName("Personnel");
    var catalogSheet = ss.getSheetByName("Catalog");
    
    // ดึงข้อมูลบุคลากร
    var personnel = [];
    if (personnelSheet) {
      var pData = personnelSheet.getDataRange().getValues();
      for (var i = 1; i < pData.length; i++) {
        if (pData[i][0]) {
          personnel.push({
            id: pData[i][0],
            name: pData[i][1],
            position: pData[i][2],
            department: pData[i][3],
            role: pData[i][4],
            phone: pData[i][5],
            email: pData[i][6]
          });
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      personnel: personnel
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var payload = data.payload;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "savePersonnel") {
    var sheet = ss.getSheetByName("Personnel") || ss.insertSheet("Personnel");
    sheet.clear();
    sheet.appendRow(["ID", "Name", "Position", "Department", "Role", "Phone", "Email"]);
    payload.forEach(function(p) {
      sheet.appendRow([p.id, p.name, p.position, p.department, p.role, p.phone, p.email]);
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}
`;
