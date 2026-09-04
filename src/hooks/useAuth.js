import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const { data: staffProfile } = await supabase.from("staff_profiles").select("full_name,position,department,role,active").eq("user_id", data.session.user.id).maybeSingle();
        if (mounted) setProfile(staffProfile);
      }
      if (mounted) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) { setSession(nextSession); if (!nextSession) setProfile(null); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email || !password) return { ok: false, error: "กรุณากรอก Email และรหัสผ่าน" };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Email หรือรหัสผ่านไม่ถูกต้อง" };
    setSession(data.session);
    const { data: staffProfile } = await supabase.from("staff_profiles").select("full_name,position,department,role,active").eq("user_id", data.user.id).maybeSingle();
    if (staffProfile && staffProfile.active === false) {
      await supabase.auth.signOut();
      return { ok: false, error: "บัญชีนี้ถูกระงับการใช้งาน" };
    }
    setProfile(staffProfile);
    return { ok: true, user: data.user };
  }, []);

  const logout = useCallback(() => { void supabase.auth.signOut(); setSession(null); }, []);
  const metadata = session?.user?.user_metadata || {};
  const currentUser = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: profile?.full_name || metadata.full_name || session.user.email,
    position: profile?.position || metadata.position || "บุคลากร",
    department: profile?.department || metadata.department || "งานพันธกิจเพื่อสังคม",
    role: profile?.role || "staff",
  } : null;
  return { currentUser, login, logout, loading };
}

export default useAuth;
