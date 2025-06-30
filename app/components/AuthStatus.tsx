"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 현재 로그인 상태 확인
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    // 로그인/로그아웃 등 상태 변화 감지
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 30,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }}>
      {user ? (
        <>
          <span style={{ fontWeight: "bold" }}>{user.email}</span>
          <button onClick={handleLogout} style={{ padding: "6px 14px", borderRadius: 6, background: "#222", color: "#fff" }}>
            로그아웃
          </button>
        </>
      ) : (
        <button onClick={handleLogin} style={{ padding: "6px 14px", borderRadius: 6, background: "#222", color: "#fff" }}>
          로그인
        </button>
      )}
    </div>
  );
} 