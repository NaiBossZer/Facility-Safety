// src/data/scripts/sobprabLacScript.ts
import { GameScript } from "../../types/onboarding";

export const sobprabLacScript: GameScript = {
  gameId: "sobprab-lac",
  gameTitle: "ห้องแล็บครั่งสบปราบ",
  characterId: "krupa-lac",
  intro: [
    { speakerId: "krupa-lac", emotion: "happy", text: "สวัสดีค่ะ วันนี้เราจะมาทดลองเลี้ยงครั่งบนต้นไม้อาศัยกัน" },
    { speakerId: "krupa-lac", emotion: "thinking", text: "อยากให้เลือกต้นไม้อาศัยก่อนนะคะ แต่ละต้นให้ผลผลิตครั่งไม่เท่ากัน" },
  ],
  choices: [
    { id: "c1", label: "ต้นจามจุรี (ให้ผลผลิตสูง)", iconName: "TreeDeciduous", resultTag: "good", paramPatch: { hostTree: "raintree" } },
    { id: "c2", label: "ต้นทองกวาว (ปานกลาง)", iconName: "Flower2", resultTag: "neutral", paramPatch: { hostTree: "thongkwao" } },
    { id: "c3", label: "ต้นที่ไม่เหมาะกับครั่งเลย", iconName: "AlertTriangle", resultTag: "risky", paramPatch: { hostTree: "unsuitable" } },
  ],
  feedback: [
    { resultTag: "good", emotion: "excited", text: "เลือกได้ดีค่ะ! จามจุรีให้น้ำเลี้ยงดีมากสำหรับครั่ง", scoreModifier: 10 },
    { resultTag: "neutral", emotion: "idle", text: "ทองกวาวก็ใช้ได้ค่ะ แต่ต้องดูแลใกล้ชิดหน่อย", scoreModifier: 0 },
    { resultTag: "risky", emotion: "concerned", text: "ต้นนี้ไม่เหมาะกับครั่งเลยค่ะ ผลผลิตจะต่ำมาก", scoreModifier: -5 },
  ],
};