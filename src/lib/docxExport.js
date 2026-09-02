// ============================================================
// docxExport.js — Utility for Exporting Ng.P.001 & Ng.P.003 to Microsoft Word (.docx)
// Uses standards-compliant WordprocessingML XML package inside a clean Blob
// ============================================================
import { fmt, thDate } from "./helpers";

/**
 * Helper to generate Word-compatible HTML package (.doc / .docx compatible)
 */
function downloadWordDocument(filename, contentHtml) {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 42.5pt 42.5pt 42.5pt 42.5pt;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'TH Sarabun New', 'TH SarabunPSK', 'Cordia New', 'Angsana New', sans-serif;
          font-size: 16pt;
          line-height: 1.25;
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6pt;
          margin-bottom: 6pt;
        }
        table, th, td {
          border: 1px solid #000;
        }
        th, td {
          padding: 4pt 6pt;
          vertical-align: top;
          font-size: 15pt;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .no-border { border: none !important; }
        .box-sign {
          border: 1px solid #000;
          padding: 6pt;
          font-size: 13pt;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${contentHtml}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", header], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".doc") ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 1. Export Ng.P.001 (แบบการขออนุมัติจัดหา) to Word (.doc)
 */
export function exportNgP001Word(wo, formData = {}) {
  const {
    date = thDate(new Date()),
    requester = "นายสมชาย ตรวจดี",
    position = "เจ้าหน้าที่ตรวจอาคาร",
    department = "งานพันธกิจเพื่อสังคม",
    expectedDate = "2569",
    contactPerson = "นายสมชาย ตรวจดี โทร. 081-234-5678",
    reason = wo?.reason || "-",
    disbursementFund = "งบดำเนินงาน – ค่าซ่อมแซมบำรุงรักษาระบบสาธารณูปโภค",
  } = formData;

  const items = wo?.items || [];
  const total = items.reduce(
    (s, it) => s + (Number(it.qty) || 1) * (Number(it.unitPrice ?? it.price) || 0),
    0
  );

  const tableRows = items
    .map(
      (it, i) => `
      <tr>
        <td class="text-center" style="width: 8%;">${i + 1}</td>
        <td class="text-left" style="width: 48%;">${it.name}</td>
        <td class="text-center" style="width: 14%;">${it.qty} ${it.unit || "หน่วย"}</td>
        <td class="text-right" style="width: 15%;">${fmt(Number(it.unitPrice ?? it.price) || 0)}</td>
        <td class="text-right" style="width: 15%;">${fmt((Number(it.qty) || 1) * (Number(it.unitPrice ?? it.price) || 0))}</td>
      </tr>`
    )
    .join("");

  // Fill up empty rows if less than 6 rows
  let emptyRows = "";
  for (let i = items.length; i < 5; i++) {
    emptyRows += `
      <tr>
        <td class="text-center">&nbsp;</td>
        <td>&nbsp;</td>
        <td class="text-center">&nbsp;</td>
        <td class="text-right">&nbsp;</td>
        <td class="text-right">&nbsp;</td>
      </tr>`;
  }

  const html = `
    <div style="text-align: right; font-size: 14pt; margin-bottom: 4pt;">แบบ งพ 001</div>
    <div class="text-center font-bold" style="font-size: 18pt;">แบบการขออนุมัติจัดหา (Request Form)</div>
    <div class="text-right" style="margin-top: 6pt;">วันที่ (Date) ${date}</div>

    <div style="margin-top: 4pt;">
      <b>เรื่อง :</b> ขออนุมัติในหลักการจัดหาพัสดุ (Procurement request for approval in principle)<br/>
      <b>เรียน (Dear) :</b> คณบดี (Dean)
    </div>

    <div style="margin-top: 4pt; text-indent: 24pt;">
      ข้าพเจ้า (I am Mr./Mrs./Miss) <u>${requester}</u> ตำแหน่ง (Position) <u>${position}</u>
      งาน/หน่วย (Department) <u>${department}</u> มีความประสงค์ขออนุมัติจัดหาพัสดุ ดังนี้ (would like to request supplies as listed below.)
    </div>

    <table>
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th class="text-center font-bold">ลำดับ<br/>(No.)</th>
          <th class="text-center font-bold">รายการพัสดุที่ต้องการจัดหา<br/>(Description)</th>
          <th class="text-center font-bold">จำนวนหน่วย<br/>(Unit)</th>
          <th class="text-center font-bold">ราคาต่อหน่วย<br/>(Price per unit)</th>
          <th class="text-center font-bold">จำนวนเงิน<br/>(Amount)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        ${emptyRows}
        <tr>
          <td colspan="4" class="text-left"><b>จำนวนเงินรวม (Total) : (อักษร:Text)</b> (${total.toLocaleString("th-TH")} บาทถ้วน)</td>
          <td class="text-right font-bold">${fmt(total)}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 4pt;">
      <b>เหตุผลและความจำเป็น : (Reason and necessity)</b> ${reason}<br/>
      <b>กำหนดเวลาที่ต้องการใช้พัสดุ ภายในไม่เกินวันที่ : (Expected date of use)</b> ${expectedDate}<br/>
      <b>ชื่อผู้ขายหรือผู้รับจ้างพร้อมเบอร์โทรศัพท์ : (Contact Person/Phone)</b> ${contactPerson}
    </div>

    <div style="margin-top: 8pt; text-align: right;">
      ลงชื่อ (Signature) ................................................................ ผู้ขอจัดหา (Requestor)<br/>
      ( ${requester} )
    </div>

    <div style="margin-top: 10pt; font-size: 14pt;">
      <b>เรียน (Dear) :</b> คณบดี (Dean)<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;เพื่อโปรดพิจารณาอนุมัติจัดหา (Please consider and approve the request)<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;โดยเบิกจากเงิน (By disbursement of funds from) <u>${disbursementFund}</u>
    </div>

    <!-- 4 Sign Boxes in 2x2 Grid -->
    <table style="margin-top: 10pt; width: 100%; border: 1px solid #000;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 6pt; border: 1px solid #000;">
          [ &nbsp; ] สมควรอนุมัติให้ดำเนินการ (Approved)<br/>
          [ &nbsp; ] อื่นๆ (Others) .................................................<br/><br/>
          ลงชื่อ (Signature) ........................................................<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;หัวหน้างาน (Section Chief)<br/>
          วันที่ (Date) ......../......../..........
        </td>
        <td style="width: 50%; vertical-align: top; padding: 6pt; border: 1px solid #000;">
          [ &nbsp; ] สมควรอนุมัติให้ดำเนินการ (Approved)<br/>
          [ &nbsp; ] อื่นๆ (Others) .................................................<br/><br/>
          ลงชื่อ (Signature) ........................................................<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;รองคณบดี (Deputy Dean)<br/>
          วันที่ (Date) ......../......../..........
        </td>
      </tr>
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 6pt; border: 1px solid #000;">
          [ &nbsp; ] สมควรอนุมัติให้ดำเนินการ (Approved)<br/>
          [ &nbsp; ] อื่นๆ (Others) .................................................<br/><br/>
          ลงชื่อ (Signature) ........................................................<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;หัวหน้างานคลังฯ (Finance Chief)<br/>
          วันที่ (Date) ......../......../..........
        </td>
        <td style="width: 50%; vertical-align: top; padding: 6pt; border: 1px solid #000;">
          [ &nbsp; ] อนุมัติให้ดำเนินการ (Approved)<br/>
          [ &nbsp; ] อื่นๆ (Others) .................................................<br/><br/>
          ลงชื่อ (Signature) ........................................................<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;คณบดี / รองคณบดีฝ่ายนโยบาย แผนและคลัง<br/>
          วันที่ (Date) ......../......../..........
        </td>
      </tr>
    </table>
  `;

  downloadWordDocument(`แบบ_งพ_001_${wo?.number || wo?.id || "doc"}`, html);
}

/**
 * 2. Export Ng.P.003 (ใบสืบราคา) to Word (.doc)
 */
export function exportNgP003Word(wo, quotes = [], requester = "นายสมชาย ตรวจดี") {
  const date = thDate(new Date());
  const title = wo?.title || "งานซ่อมแซมและบำรุงรักษา";

  const rows = quotes
    .map(
      (q, i) => `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td class="text-center">${date}</td>
        <td class="text-left"><b>${q.name}</b></td>
        <td class="text-center">${q.tel || "-"}</td>
        <td class="text-right font-bold">${fmt(q.sum)}</td>
        <td class="text-center">${q.contactPerson || "ฝ่ายขาย"}</td>
        <td class="text-center">${requester}</td>
        <td class="text-center">${i === 0 ? "ราคาต่ำสุด" : "-"}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="text-align: right; font-size: 14pt; margin-bottom: 4pt;">แบบ งพ 003</div>
    <div class="text-center font-bold" style="font-size: 20pt;">ใบสืบราคา</div>
    
    <div style="margin-top: 8pt; margin-bottom: 8pt;">
      <b>การสืบราคารายการ :</b> ${title} (อ้างอิงใบแจ้งซ่อม ${wo?.number || wo?.id || "-"})
    </div>

    <table>
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th class="text-center font-bold">ลำดับที่</th>
          <th class="text-center font-bold">วัน/เดือน/ปี</th>
          <th class="text-center font-bold">ชื่อบริษัท / ห้าง / ร้าน</th>
          <th class="text-center font-bold">หมายเลขโทรศัพท์</th>
          <th class="text-center font-bold">จำนวนเงิน</th>
          <th class="text-center font-bold">ผู้แจ้งราคา</th>
          <th class="text-center font-bold">ผู้สืบราคา</th>
          <th class="text-center font-bold">หมายเหตุ</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table style="width: 100%; margin-top: 14pt; border: none;">
      <tr style="border: none;">
        <td style="border: none; width: 60%;">
          <b>หมายเหตุ :</b> สืบราคาเพื่อเสนอขออนุมัติในหลักการ
        </td>
        <td style="border: none; width: 40%; text-align: right;">
          <b>งานคลังและพัสดุ</b>
        </td>
      </tr>
    </table>
  `;

  downloadWordDocument(`แบบ_งพ_003_ใบสืบราคา_${wo?.number || wo?.id || "doc"}`, html);
}
