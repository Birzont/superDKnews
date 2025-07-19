"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Search, X } from 'lucide-react';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 실행 (RealTimeNewsGrid에서 처리)
    // URL 파라미터로 검색어 전달
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
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
      {/* 검색창 */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="뉴스 검색..."
            className="w-48 px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Search size={14} />
          </button>
        </div>
      </form>

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