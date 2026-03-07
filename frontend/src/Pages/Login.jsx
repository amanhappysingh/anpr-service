import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import http from "@/lib/http";
import { useDispatch } from "react-redux";
import { login } from "@/features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function AdityaBirlaLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()


  const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await http.post("/api/login", data); // backend endpoint
    return res.data;
  },
  onSuccess: (data, variables) => {
    const { token, user } = data;

    // ✅ Save auth data
    localStorage.setItem(
      "authData",
      JSON.stringify({
        token,
        user,
        role: user.role,
      })
    );

    dispatch(login({
       user,
       access_token : token,
      }))

   

    // ✅ Navigate
    navigate("");
  },
  onError: (error) => {
    console.error("Login failed:", error);
  },
});

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">

      {/* Watermark */}
      <div
        className="pointer-events-none select-none fixed inset-0 flex items-center justify-center z-0"
        aria-hidden="true"
      >
        <span
          className="text-gray-400 font-bold tracking-widest uppercase whitespace-nowrap"
          style={{ fontSize: "clamp(28px, 5vw, 70px)", opacity: 0.08, transform: "rotate(-30deg)" }}
        >
          Amperevision Solution
        </span>
      </div>

      {/* Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-10">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-md">
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
              <path d="M10 40L26 10L42 40H32L26 26L20 40H10Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-wide">Aditya Birla Group</h1>
          <p className="text-sm text-gray-400 mt-1">Enterprise Portal</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-6">Sign in to your account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@adityabirla.com"
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600">Password</label>
              
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {mutation.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in...
              </>
            ) : "Sign In"}
          </button>

          {/* Success */}
          {mutation.isSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Login successful! Welcome back.
            </div>
          )}

          {/* Error */}
          {mutation.isError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              {mutation.error?.response?.data?.message || "Invalid credentials. Please try again."}
            </div>
          )}
        </form>

        {/* Session info */}
       

       
      </div>

      {/* Footer credit */}
      <p className="relative z-10 mt-5 text-xs text-gray-400 tracking-wide">
        Powered by <span className="text-gray-500 font-bold  ">Amperevision Solution</span>
      </p>
    </div>
  );
}

