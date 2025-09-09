"use client";

import How from "@/components/Landing/How";
import Features from "@/components/Landing/Features";
import CTA from "@/components/Landing/CTA";
import Navbar from "@/components/Landing/Navbar";
import InteractiveDemo from "@/components/Landing/InteractiveDemo";

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-[#212121] text-white dm-sans-400">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white/80">
            Track what you share
          </h1>
          <p className="text-xl text-white/65 mb-8 max-w-2xl mx-auto">
            Discover which marketing channels bring customers <br/> so you can grow
            your business, fast.
          </p>

          <CTA />

          <div className="flex items-center justify-center space-x-2 mb-12">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 border-2 border-gray-900"
                ></div>
              ))}
            </div>
            <span className="text-gray-400 ml-3">
              Loved by <span className="text-white font-semibold">6,116</span>{" "}
              users
            </span>
          </div>
        </div>
      </section>

      <InteractiveDemo />

      <How />

      <Features />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Start tracking what you share today
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of businesses already growing with ShareTrack
          </p>
          <CTA />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#282828] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="flex space-x-1">
                <div className="w-1 h-6 bg-orange-500 rounded"></div>
                <div className="w-1 h-6 bg-orange-400 rounded"></div>
                <div className="w-1 h-6 bg-red-500 rounded"></div>
              </div>
              <span className="text-xl font-bold text-white">ShareTrack</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
