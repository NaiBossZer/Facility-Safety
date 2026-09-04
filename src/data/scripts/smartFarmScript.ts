// src/data/scripts/smartFarmScript.ts
import { GameScript } from "../../types/onboarding";

export const smartFarmScript: GameScript = {
  gameId: "smart-farm",
  gameTitle: "ศูนย์เกษตรอัจฉริยะ มหาวิทยาลัยมหิดล วิทยาเขตนครลำปาง",
  characterId: "prof-mahidol",
  intro: [
    { speakerId: "prof-mahidol", emotion: "happy", text: "ยินดีต้อนรับสู่ศูนย์เกษตรอัจฉริยะครับ วันนี้ผมจะให้คุณลองควบคุมโรงเรือนจริง" },
    { speakerId: "prof-mahidol", emotion: "thinking", text: "ก่อนเริ่ม อยากให้คุณเลือกพืชที่จะปลูก และแนวทางควบคุมระบบก่อนครับ" },
  ],
  choices: [
    { id: "c1", label: "ปลูกผักสลัด + โหมด Auto-IoT", iconName: "Sprout", resultTag: "good", paramPatch: { crop: "lettuce", controlMode: "auto" } },
    { id: "c2", label: "ปลูกเมลอน + โหมด Manual", iconName: "Sun", resultTag: "neutral", paramPatch: { crop: "melon", controlMode: "manual" } },
    { id: "c3", label: "ปลูกเมลอน + ไม่ตั้ง Threshold ใดๆ", iconName: "AlertTriangle", resultTag: "risky", paramPatch: { crop: "melon", controlMode: "manual", tempThreshold: 40 } },
  ],
  feedback: [
    { resultTag: "good", emotion: "excited", text: "เลือกได้ดีมากครับ! ผักสลัดกับ Auto-IoT จะช่วยลดความเสี่ยงเรื่องอุณหภูมิสูง", scoreModifier: 10 },
    { resultTag: "neutral", emotion: "idle", text: "เมลอนต้องดูแลใกล้ชิดหน่อยนะครับ เพราะควบคุมมือเอง", scoreModifier: 0 },
    { resultTag: "risky", emotion: "concerned", text: "ตั้ง Threshold สูงไปนะครับ ระวังพืชเครียดจากความร้อน!", scoreModifier: -5 },
  ],
};