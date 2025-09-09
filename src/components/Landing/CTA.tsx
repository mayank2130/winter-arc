"use client";

import { ArrowRight, Globe } from "lucide-react";
import { useState } from "react";

const CTA = () => {
  const [focus, setFocus] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-1.5 max-w-3xs mx-auto mb-6">
        <div className="flex">
          <div
            className={`bg-[#212121] border ${
              focus ? "border-[#484848]" : "border-[#383838]"
            } rounded-l-lg flex items-center justify-center px-4`}
          >
            <Globe
              className={`w-4 h-4 ${
                focus
                  ? "text-white/80 animate-[glow_1s_ease-in-out_infinite]"
                  : "text-white/50"
              }`}
            />
          </div>
          <input
            placeholder="share.track"
            className="flex-1 bg-[#282828] border-l-0 border border-[#343434] rounded-r-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#484848] text-base"
            type="text"
            value=""
            name="link"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>
        <div className="bg-[#e05f38d3] rounded-lg cursor-pointer p-0.5">
          <button className="bg-[#e16540] hover:bg-[#c2512e] w-full text-white py-2.5 cursor-pointer rounded-lg font-medium transition-colors flex flex-row gap-2 items-center justify-center">
            Start free trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-white/50">
          3-day free trial • No card required
        </p>
      </div>
    </>
  );
};

export default CTA;
