import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const login = useCallback(async (email, password) => {
    if (!email || !password) return { ok: false, error: "กรุณากรอก Email และรหัสผ่าน" };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Email หรือรหัสผ่านไม่ถูกต้อง" };
    setSession(data.session);
    return { ok: true, user: data.user };
  }, []);

  const logout = useCallback(() => { void supabase.auth.signOut(); setSession(null); }, []);
  const metadata = session?.user?.user_metadata || {};
  const currentUser = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: metadata.full_name || session.user.email,
    position: metadata.position || "บุคลากร",
    department: metadata.department || "งานพันธกิจเพื่อสังคม",
    role: metadata.role || "staff",
  } : null;
  return { currentUser, login, logout, loading };
}

export default useAuth;
