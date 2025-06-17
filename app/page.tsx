'use client';
import "./globals.css";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.data.role === 'admin') {
          localStorage.setItem('token', result.data.token);
          router.push('/dashboard');
        } else {
          console.log(result.data.role);
          alert('Tài khoản này không có quyền truy cập vào trang admin');
        }
      } else {
        alert('Vui lòng sử dụng tài khoản dành cho admin');
      }
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="grid grid-rows-[00px_1fr_50px] items-center justify-items-center min-h-screen p-8 pb-20 gap-1 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-row gap-[300px] row-start-2 items-center sm:items-start w-full max-w-[1400px]">
        <div className="flex flex-col  items-start sm:items-start w-full h-full  mr-auto">
          <img
            src="/stargazerlogo.png"
            alt="Star Gazer Logo"
            className="rounded-lg w-full max-w-[400px] h-auto object-cover ml-14 mb-0"  
          />
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground ml-32" style={{ 
                                fontFamily: "var(--font-geist-sans)" , 
                                background: 'linear-gradient(to right, rgb(0, 51, 255), rgb(0, 3, 61))',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent' }}>
            Star Gazer
          </h1>
        </div>
        <div className="flex gap-4 items-start flex-col sm:flex-col w-300 max-w-[470px] bg-white p-4 sm:p-6 rounded-lg shadow-md border border-solid border-[#333] h-90 mr-30">
          <h2 className="text-2xl sm:text-3xl font-bold ml-4 text-[rgb(0,51,255)] ml-33">
            Đăng nhập 
          </h2>
          {/* Tài khoản */}
          <div className="mb-4 ml-7 mt-4">
            <label className="block text-[rgb(0,51,255)] text-sm font-bold mb-2">
              Tài khoản
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email hoặc số điện thoại"
              className="w-[340px] text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Mật khẩu */}
            <div className="mb-6 mt-4">
              <label className="block text-[rgb(0,51,255)] text-sm font-bold mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full text-gray-800 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-blue-800 hover:scale-105 shadow-md hover:shadow-xl"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
