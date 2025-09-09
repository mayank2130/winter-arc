"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/sign-up");
  };

  const { isSignedIn } = useUser();

  return (
    <nav className="border-b border-[#313131]">
      <div className="max-w-[1300px] px-4 mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-1 h-6 bg-orange-500 rounded"></div>
              <div className="w-1 h-6 bg-orange-400 rounded"></div>
              <div className="w-1 h-6 bg-red-500 rounded"></div>
            </div>
            <span className="text-xl font-bold text-white">ShareTrack</span>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-gray-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
            <a
              href="#reviews"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Reviews
            </a>
          </div>

          {isSignedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-1 flex flex-row items-center justify-center gap-3 bg-[#e16540] text-white rounded-lg hover:bg-[#c2512e] transition-colors"
            >
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="text-gray-300 cursor-pointer border border-[#383838] rounded-lg px-3 py-1.5 hover:text-white transition-colors"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
