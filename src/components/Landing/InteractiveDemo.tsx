import { Smartphone } from "lucide-react";
import InteractiveMap from "../Map";
import TrafficChart from "./Traffic";

const InteractiveDemo = () => {
  return (
    <section className="pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative border-6 border-[#383838] rounded-3xl">
        <div className="bg-[#212121] rounded-2xl border border-gray-700 overflow-hidden">
          {/* Browser Bar */}
          <div className="bg-[#282828] px-4 py-2 flex items-center border-b border-[#383838] shadow-lg">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 text-sm text-center text-white/70">
              onlyfans.com  :{`)`}
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* World Map */}
            <div className="lg:col-span-2 bg-[#282828] rounded-xl">
              <InteractiveMap height={500} width={960} margin={0}/>
            </div>

            {/* Traffic Sources */}
            <div className="space-y-3 bg-[#282828] rounded-xl">
              <TrafficChart />
            </div>
          </div>

          {/* Bottom Section - Journey Tracking */}
          <div className="px-6 pb-6">
            <div className="bg-[#282828] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-sm">Goal</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-white/70 text-sm">Funnel</span>
                  <span className="text-white/70">|</span>
                  <span className="text-white text-sm font-medium bg-orange-500 px-2 py-1 rounded">
                    Journey for payment
                  </span>
                </div>
                <button className="text-white/70 text-sm hover:text-white">
                  + Add goals
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-4 text-xs text-white/70 uppercase tracking-wider">
                  <div>Visitor</div>
                  <div>Source</div>
                  <div>Spent</div>
                  <div>Time to complete</div>
                  <div>Completed at</div>
                  <div></div>
                </div>

                {[
                  {
                    name: "AJN***",
                    country: "🇳🇱",
                    device: "Desktop",
                    os: "Mac OS",
                    browser: "Chrome",
                    source: "marclou.com",
                    spent: "$299",
                    time: "4 days",
                    completed: "Today at 4:41 PM",
                  },
                  {
                    name: "PPD***",
                    country: "🇲🇹",
                    device: "Mobile",
                    os: "iOS",
                    browser: "Mobile Safari",
                    source: "Direct/None",
                    spent: "$299",
                    time: "a day",
                    completed: "Today at 7:53 AM",
                  },
                  {
                    name: "Seb***",
                    country: "🇺🇸",
                    device: "Desktop",
                    os: "Mac OS",
                    browser: "Safari",
                    source: "Google",
                    spent: "$299",
                    time: "12 minutes",
                    completed: "Yesterday at 7:44 AM",
                  },
                ].map((user, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-6 gap-4 items-center py-2 text-sm border-b border-gray-800 last:border-b-0"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-gray-400 text-xs flex items-center space-x-1">
                          <span>{user.country}</span>
                          <Smartphone className="w-3 h-3" />
                          <span>{user.device}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-300">{user.source}</div>
                    <div className="text-white font-medium">{user.spent}</div>
                    <div className="text-gray-300">{user.time}</div>
                    <div className="text-gray-300">{user.completed}</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
