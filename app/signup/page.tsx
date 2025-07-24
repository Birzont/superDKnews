"use client"

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      alert("회원가입 실패: " + error.message);
    } else {
      alert("회원가입 성공! 이메일을 확인해 주세요.");
      // 필요시 로그인 페이지로 이동 등 추가 가능
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white rounded-xl md:rounded-lg shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold text-center">회원가입</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium">이메일</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="이메일을 입력하세요"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">비밀번호</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">비밀번호 확인</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="비밀번호를 다시 입력하세요"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200" 
            disabled={loading}
          >
            {loading ? "회원가입 중..." : "회원가입"}
          </button>
        </form>
        <div className="text-sm text-center">
          이미 계정이 있으신가요? <a href="/login" className="text-green-600 hover:underline">로그인</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 