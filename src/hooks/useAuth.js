import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const PORTAL_SSO_MESSAGE = "FACILITY_SAFETY_SSO_REQUEST";
const PORTAL_SSO_TOKEN_MESSAGE = "FACILITY_SAFETY_SSO_TOKEN";

function portalOrigin() {
  try { return document.referrer ? new URL(document.referrer).origin : null; }
  catch { return null; }
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    const { data: staffProfile } = await supabase.from("staff_profiles").select("full_name,position,department,role,active").eq("user_id", userId).maybeSingle();
    setProfile(staffProfile);
    if (staffProfile?.active === false) {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      return null;
    }
    return staffProfile;
  }, []);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session?.user) await loadProfile(data.session.user.id);
      setSession(data.session);
      if (mounted) setLoading(false);
    };
    void boot();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        if (!nextSession) setProfile(null);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [loadProfile]);

  useEffect(() => {
    const parentOrigin = portalOrigin();
    if (!parentOrigin || window.parent === window) return;
    const onMessage = async (event) => {
      if (event.origin !== parentOrigin || event.source !== window.parent) return;
      if (event.data?.type !== PORTAL_SSO_TOKEN_MESSAGE) return;
      const accessToken = event.data?.access_token;
      const refreshToken = event.data?.refresh_token;
      if (typeof accessToken !== "string" || typeof refreshToken !== "string") return;
      const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error || !data.session?.user) return;
      await loadProfile(data.session.user.id);
      setSession(data.session);
      window.parent.postMessage({ type: "FACILITY_SAFETY_SSO_COMPLETE" }, parentOrigin);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PORTAL_SSO_MESSAGE }, parentOrigin);
    return () => window.removeEventListener("message", onMessage);
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) return { ok: false, error: "กรุณากรอก Email และรหัสผ่าน" };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Email หรือรหัสผ่านไม่ถูกต้อง" };
    setSession(data.session);
    await loadProfile(data.user.id);
    return { ok: true, user: data.user };
  }, [loadProfile]);

  const logout = useCallback(() => { void supabase.auth.signOut(); setSession(null); }, []);
  const metadata = session?.user?.user_metadata || {};
  const currentUser = session?.user ? {
    id: session.user.id, email: session.user.email,
    name: profile?.full_name || metadata.full_name || session.user.email,
    position: profile?.position || metadata.position || "บุคลากร",
    department: profile?.department || metadata.department || "งานพันธกิจเพื่อสังคม",
    role: profile?.role || "staff",
  } : null;
  return { currentUser, login, logout, loading };
}

export default useAuth;
