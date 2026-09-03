// ============================================================
// useSupabaseState.js — useState ที่เซฟลง Supabase อัตโนมัติ
// ใช้งาน: const [data, setData, meta] = useSupabaseState(tableName, initialValue, options)
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSupabaseState(tableName, initialValue, options = {}) {
  const {
    id = null,           // ถ้ามี id จะทำ upsert ตาม id, ถ้าไม่มีจะ insert ใหม่
    select = "*",        // SQL select clause
    orderBy = null,      // SQL order by, e.g. { column: 'created_at', ascending: false }
    filter = null,       // SQL filter, e.g. { column: 'user_id', operator: 'eq', value: 'user123' }
    onError = null,      // (error) => void
    initialData = null,  // ข้อมูลเริ่มต้นจาก localStorage (สำหรับ migration)
  } = options;

  const [state, setState] = useState(() => {
    // ถ้ามี initialData จาก localStorage ใช้ก่อน (สำหรับ migration)
    if (initialData !== null) {
      return initialData;
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ---- โหลดข้อมูลจาก Supabase ----
  useEffect(() => {
    let query = supabase.from(tableName).select(select);

    // Apply filter if provided
    if (filter) {
      query = query.filter(filter.column, filter.operator, filter.value);
    }

    // Apply order by if provided
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    // If id is provided, get specific record
    if (id) {
      query = supabase.from(tableName).select(select).eq('id', id).single();
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await query;

        if (error) throw error;

        if (id) {
          // Single record mode
          setState(data || (typeof initialValue === "function" ? initialValue() : initialValue));
        } else {
          // Array mode
          setState(data || (typeof initialValue === "function" ? initialValue() : initialValue));
        }

        setError(null);
      } catch (err) {
        console.error(`[useSupabaseState] Error loading from ${tableName}:`, err);
        setError(err.message);
        if (typeof onError === "function") onError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, select, id, filter, orderBy, initialValue, onError]);

  // ---- เขียนข้อมูลลง Supabase ----
  const saveToSupabase = useCallback(async (value) => {
    try {
      let result;
      
      if (id) {
        // Upsert single record
        result = await supabase
          .from(tableName)
          .upsert({ ...value, id })
          .select()
          .single();
      } else {
        // For array data, we need to handle differently
        // This is a simplified approach - you might need more complex logic
        result = await supabase
          .from(tableName)
          .upsert(value)
          .select();
      }

      if (result.error) throw result.error;

      setSavedAt(new Date().toISOString());
      setError(null);
      return { ok: true, data: result.data };
    } catch (err) {
      console.error(`[useSupabaseState] Error saving to ${tableName}:`, err);
      setError(err.message);
      if (typeof onError === "function") onError(err);
      return { ok: false, error: err.message };
    }
  }, [tableName, id, onError]);

  // ---- Debounced save ----
  const saveTimeoutRef = useRef(null);
  
  const debouncedSave = useCallback((value) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(value);
    }, 500); // 500ms debounce
  }, [saveToSupabase]);

  // ---- เขียนทุกครั้งที่ state เปลี่ยน ----
  useEffect(() => {
    if (!loading) {
      debouncedSave(state);
    }
  }, [state, loading, debouncedSave]);

  // ---- Force save immediately ----
  const flushNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return await saveToSupabase(stateRef.current);
  }, [saveToSupabase]);

  return [state, setState, { 
    loading, 
    error, 
    savedAt, 
    flushNow,
    available: true 
  }];
}

export default useSupabaseState;