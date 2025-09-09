import React, { JSX, useRef, useState } from "react";

// --- TYPE DEFINITIONS ---
type Tab = "OS" | "Browser" | "Device";

interface AnalyticsData {
  name: string;
  visitors: number;
  conversion: number;
  color: string;
  icon: JSX.Element;
}

interface Tooltip {
  visible: boolean;
  data: AnalyticsData | null;
  x: number;
  y: number;
}

// --- SVG ICONS (omitted for brevity, no changes) ---
// OS Icons
const AppleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    <path d="M19.3,13.06a5.3,5.3,0,0,1-1.87,4.23,5.27,5.27,0,0,1-3.4,1.48,2.37,2.37,0,0,1-1.3-.39,2.43,2.43,0,0,1-1-.9A2.29,2.29,0,0,1,11.45,16a4.88,4.88,0,0,1,.87-2.94A5.06,5.06,0,0,1,15,10.6a2.17,2.17,0,0,1,1.28-.4,2.06,2.06,0,0,1,1.27.4,0.7,0.7,0,0,0,.46.19,0.72,0.72,0,0,0,.48-0.19,0.66,0.66,0,0,0,0-1,3.46,3.46,0,0,0-2.22-1,3.53,3.53,0,0,0-2.58.89,5.77,5.77,0,0,0-2,4.42,5.88,5.88,0,0,0,2.3,4.82,3.6,3.6,0,0,0,2.7,1,3.52,3.52,0,0,0,2.67-1.1,5.3,5.3,0,0,0,1.53-3.41,0.68,0.68,0,0,0-.68-0.78A0.66,0.66,0,0,0,19.3,13.06Zm-5.46-7.4a2.84,2.84,0,0,1-2.18-1.2A2.86,2.86,0,0,1,11.85,2.4a2.93,2.93,0,0,1,2.41,1,2.87,2.87,0,0,1-1,5.26Z" />
  </svg>
);
const IOSIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 256 256"
    fill="currentColor"
    className="text-gray-400"
  >
    <path d="M208,28H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28Zm0,180H48V48H208ZM128,180a12,12,0,1,1,12-12A12,12,0,0,1,128,180Z" />
  </svg>
);
const WindowsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M3,3 L10,4.2 L10,11 L3,11 L3,3 Z M3,13 L10,13 L10,19.8 L3,21 L3,13 Z M12,4.5 L21,6 L21,11 L12,11 L12,4.5 Z M12,13 L21,13 L21,18 L12,19.5 L12,13 Z" />{" "}
  </svg>
);
const AndroidIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M16.5,8 C17.881,8 19,6.881 19,5.5 C19,4.119 17.881,3 16.5,3 C15.119,3 14,4.119 14,5.5 C14,6.881 15.119,8 16.5,8 Z M7.5,8 C8.881,8 10,6.881 10,5.5 C10,4.119 8.881,3 7.5,3 C6.119,3 5,4.119 5,5.5 C5,6.881 6.119,8 7.5,8 Z M17,10 L7,10 C5.343,10 4,11.343 4,13 L4,18 C4,19.657 5.343,21 7,21 L17,21 C18.657,21 20,19.657 20,18 L20,13 C20,11.343 18.657,10 17,10 Z" />{" "}
  </svg>
);
const LinuxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M12,2C6.48,2 2,6.48,2,12s4.48,10 10,10s10,-4.48 10,-10S17.52,2 12,2z M10.6,18.4c-0.3,0.2 -0.7,0.2 -1.1,0c-0.2,-0.1 -0.4,-0.3 -0.5,-0.5c-0.1,-0.2 -0.2,-0.5 -0.2,-0.7c0,-0.3 0.1,-0.5 0.2,-0.7c0.1,-0.2 0.3,-0.4 0.5,-0.5c0.4,-0.2 0.8,-0.2 1.1,0c0.2,0.1 0.4,0.3 0.5,0.5c0.1,0.2 0.2,0.5 0.2,0.7c0,0.3 -0.1,0.5 -0.2,0.7c-0.1,0.2 -0.3,0.4 -0.5,0.5z M14.5,13.4c-0.5,0.4 -1.1,0.6 -1.7,0.7l-0.8,-2.4c0.8,-0.2 1.5,-0.6 2,-1.2c0.6,-0.7 0.9,-1.5 0.9,-2.3c0,-0.9 -0.3,-1.7 -0.9,-2.3c-0.6,-0.6 -1.4,-0.9 -2.3,-0.9c-0.9,0 -1.7,0.3 -2.3,0.9c-0.6,0.6 -0.9,1.4 -0.9,2.3c0,0.8 0.3,1.6 0.9,2.3c0.5,0.6 1.2,1 2,1.2l-1.3,4.1c-1.4,-0.4 -2.6,-1.2 -3.4,-2.4c-0.8,-1.2 -1.3,-2.6 -1.3,-4.1c0,-1.8 0.7,-3.5 1.9,-4.7c1.2,-1.2 2.9,-1.9 4.7,-1.9s3.5,0.7 4.7,1.9c1.2,1.2 1.9,2.9 1.9,4.7c0,1.5 -0.5,2.9 -1.3,4.1c-0.8,1.2 -2,2 -3.4,2.4z" />{" "}
  </svg>
);
const UbuntuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-orange-500"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M6.81,15.19c0.88-1.52,2.33-2.58,4.03-3.03 c-0.27-0.45-0.43-0.96-0.43-1.5c0-1.47,1.19-2.67,2.67-2.67c0.54,0,1.05,0.16,1.5,0.43c-0.45-1.7-1.51-3.15-3.03-4.03 c-1.52,0.88-2.58,2.33-3.03,4.03C7.6,9.15,6.81,10.45,6.81,11.97C6.81,13.14,7.2,14.24,7.99,15.19H6.81z M15.19,17.19 c-0.88,1.52-2.33,2.58-4.03,3.03c0.27,0.45,0.43,0.96,0.43,1.5c0,1.47-1.19,2.67-2.67,2.67c-0.54,0-1.05-0.16-1.5-0.43 c0.45,1.7,1.51,3.15,3.03,4.03c1.52-0.88,2.58-2.33,3.03-4.03C16.4,20.85,17.19,19.55,17.19,18.03 C17.19,16.86,16.8,15.76,16.01,14.81H15.19V17.19z M17.19,6.81c1.52,0.88,2.58,2.33,3.03,4.03c-0.27-0.45-0.43-0.96-0.43-1.5 c0-1.47-1.19-2.67-2.67-2.67c-0.54,0-1.05,0.16-1.5,0.43c0.45-1.7,1.51-3.15,3.03-4.03C17.6,4.45,17.19,5.15,17.19,6.81z" />{" "}
  </svg>
);
const ChromiumOSIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-blue-400"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z" />{" "}
    <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7z M12,15c-1.65,0-3-1.35-3-3s1.35-3,3-3s3,1.35,3,3 S13.65,15,12,15z" />{" "}
  </svg>
);
const DesktopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M21,16H3V4h18V16z M21,2H3C1.9,2,1,2.9,1,4v12c0,1.1,0.9,2,2,2h7v2H8v2h8v-2h-2v-2h7c1.1,0,2-0.9,2-2V4C23,2.9,22.1,2,21,2z" />{" "}
  </svg>
);
const MobileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M15.5,1h-7C7.02,1,6,2.02,6,3.5v17C6,21.98,7.02,23,8.5,23h7c1.48,0,2.5-1.02,2.5-2.5v-17C18,2.02,16.98,1,15.5,1z M16,18H8v-1h8V18z M16,16H8v-1h8V16z M16,14H8V5h8V14z" />{" "}
  </svg>
);
const TabletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M19,0H5C3.3,0,2,1.3,2,3v18c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V3C22,1.3,20.7,0,19,0z M12,22c-0.8,0-1.5-0.7-1.5-1.5 s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S12.8,22,12,22z M19,18H5V4h14V18z" />{" "}
  </svg>
);
const ChromeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z" />{" "}
    <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7z M12,15c-1.65,0-3-1.35-3-3s1.35-3,3-3s3,1.35,3,3 S13.65,15,12,15z" />{" "}
  </svg>
);
const SafariIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M12.9,15.6l-2.1-7.2l7.2,2.1L12.9,15.6z" />{" "}
  </svg>
);
const FirefoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-orange-500"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8c0-2.39,1.04-4.54,2.71-6.04 c-0.01,0-0.01,0-0.02,0C8.3,4.84,9.5,4,12,4c2.5,0,3.7,0.84,5.31,1.96c0.01,0,0.01,0,0.02,0C18.96,7.46,20,9.61,20,12 C20,16.41,16.41,20,12,20z" />{" "}
    <path d="M12.2,4.2c-0.1,0-0.2,0-0.4,0c-2.4,0-4.5,0.9-6,2.4C6.5,7.9,7.6,9.9,9.4,11.2c1.7,1.2,3.9,1.7,6.1,1.2 C15.1,9.8,14.6,7.2,12.2,4.2z" />{" "}
  </svg>
);
const EdgeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-blue-500"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8c0-2.05,0.78-3.92,2.05-5.34 L12,12l5.95-5.34C19.22,8.08,20,9.95,20,12C20,16.41,16.41,20,12,20z" />{" "}
  </svg>
);
const GenericIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-400"
  >
    {" "}
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10 10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z" />{" "}
  </svg>
);
const SortIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7l3-3 3 3M7 4v16M21 17l-3 3-3-3M17 20V4" />
  </svg>
);

// --- MOCK DATA ---
const osData: AnalyticsData[] = [
  {
    name: "Mac OS",
    visitors: 5100,
    conversion: 12.5,
    color: "bg-sky-500",
    icon: <AppleIcon />,
  },
  {
    name: "iOS",
    visitors: 4300,
    conversion: 11.2,
    color: "bg-sky-500",
    icon: <IOSIcon />,
  },
  {
    name: "Windows",
    visitors: 4100,
    conversion: 9.8,
    color: "bg-sky-500",
    icon: <WindowsIcon />,
  },
  {
    name: "Android",
    visitors: 2400,
    conversion: 8.1,
    color: "bg-sky-500",
    icon: <AndroidIcon />,
  },
  {
    name: "Linux",
    visitors: 455,
    conversion: 5.3,
    color: "bg-sky-500",
    icon: <LinuxIcon />,
  },
  {
    name: "Ubuntu",
    visitors: 54,
    conversion: 4.2,
    color: "bg-sky-500",
    icon: <UbuntuIcon />,
  },
  {
    name: "Chromium OS",
    visitors: 26,
    conversion: 3.5,
    color: "bg-sky-500",
    icon: <ChromiumOSIcon />,
  },
];

const browserData: AnalyticsData[] = [
  {
    name: "Chrome",
    visitors: 10100,
    conversion: 15.1,
    color: "bg-[#e16540]",
    icon: <ChromeIcon />,
  },
  {
    name: "Safari",
    visitors: 3400,
    conversion: 13.8,
    color: "bg-[#e16540]",
    icon: <SafariIcon />,
  },
  {
    name: "Firefox",
    visitors: 825,
    conversion: 10.5,
    color: "bg-[#e16540]",
    icon: <FirefoxIcon />,
  },
  {
    name: "Edge",
    visitors: 624,
    conversion: 9.9,
    color: "bg-[#e16540]",
    icon: <EdgeIcon />,
  },
  {
    name: "Instagram",
    visitors: 340,
    conversion: 7.6,
    color: "bg-[#e16540]",
    icon: <GenericIcon />,
  },
  {
    name: "Twitter",
    visitors: 266,
    conversion: 7.1,
    color: "bg-[#e16540]",
    icon: <GenericIcon />,
  },
  {
    name: "Facebook",
    visitors: 181,
    conversion: 6.8,
    color: "bg-[#e16540]",
    icon: <GenericIcon />,
  },
  {
    name: "Samsung Internet",
    visitors: 109,
    conversion: 6.2,
    color: "bg-[#e16540]",
    icon: <GenericIcon />,
  },
  {
    name: "LinkedIn",
    visitors: 104,
    conversion: 5.9,
    color: "bg-[#e16540]",
    icon: <GenericIcon />,
  },
];

const deviceData: AnalyticsData[] = [
  {
    name: "Desktop",
    visitors: 9700,
    conversion: 18.2,
    color: "bg-emerald-500",
    icon: <DesktopIcon />,
  },
  {
    name: "Mobile",
    visitors: 6600,
    conversion: 14.3,
    color: "bg-emerald-500",
    icon: <MobileIcon />,
  },
  {
    name: "Tablet",
    visitors: 77,
    conversion: 9.5,
    color: "bg-emerald-500",
    icon: <TabletIcon />,
  },
];

const dataMap: Record<Tab, AnalyticsData[]> = {
  OS: osData,
  Browser: browserData,
  Device: deviceData,
};

// --- MAIN COMPONENT ---
const TrafficChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Browser");
  const [hoveredBar, setHoveredBar] = useState<AnalyticsData["name"] | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip>({
    visible: false,
    data: null,
    x: 0,
    y: 0,
  });

  const currentData = dataMap[activeTab];
  const maxVisitors = Math.max(...currentData.map((d) => d.visitors));
  const maxRows = Math.max(
    ...Object.values(dataMap).map((arr) => arr.length)
  );
  // Approximate per-row height: 32px bar height (h-8) + 12px vertical gap (space-y-3)
  const chartMinHeight = maxRows * 44;

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX - rect.left + 16,
      y: e.clientY - rect.top + 12,
    }));
  };

  const handleMouseEnterBar = (
    data: AnalyticsData,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    setHoveredBar(data.name);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      data: data,
      x: e.clientX - rect.left + 16,
      y: e.clientY - rect.top + 12,
    });
  };

  const handleMouseLeaveChart = () => {
    setHoveredBar(null);
    setTooltip({ visible: false, data: null, x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="text-gray-300 font-sans rounded-lg max-w-2xl mx-auto antialiased flex flex-col h-full relative">
      {tooltip.visible && tooltip.data && (
        <div
          className="absolute bg-[#3d3c3c] rounded-lg shadow-xl p-4 text-gray-100 pointer-events-none transition-opacity duration-200 z-10"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            opacity: tooltip.visible ? 1 : 0,
            minWidth: "220px",
            transform: "none",
          }}
        >
          <h3 className="font-bold text-lg mb-3">{tooltip.data.name}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-sky-400 mr-2"></div>
                Visitors
              </span>
              <span className="font-semibold">
                {formatNumber(tooltip.data.visitors)}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Conversion rate</span>
              <span>{tooltip.data.conversion.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-4 px-4 pt-3 border-b border-[#383838]">
        <div className="flex items-center space-x-6 text-sm">
          {(["Browser", "OS", "Device"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition-colors pb-1.5 ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
          <span>Visitors</span>
          <SortIcon />
        </button>
      </header>

      {/* Chart */}
      <div
        className="space-y-3"
        style={{ minHeight: `${chartMinHeight}px` }}
        onMouseLeave={handleMouseLeaveChart}
        onMouseMove={handleMouseMove}
      >
        {currentData.map((data) => {
          const barWidthPercentage = (data.visitors / maxVisitors) * 100; // 100% of the container for the max value

          return (
            <div
              key={data.name}
              className={`flex items-center gap-4 transition-opacity duration-300 pr-4`}
              onMouseEnter={(e) => handleMouseEnterBar(data, e)}
            >
              <div
                className={`w-full transition-opacity duration-300 ${
                  hoveredBar && hoveredBar !== data.name
                    ? "opacity-40"
                    : "opacity-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Relative container for bar and text */}
                  <div className="relative flex-grow h-8">
                    {/* Bar container, now with a background to act as the track */}
                    <div className="flex w-full h-full rounded-r-md overflow-hidden bg-gray-700">
                      <div
                        className={`${data.color} h-full rounded-r-md`}
                        style={{ width: `${barWidthPercentage}%` }}
                      ></div>
                    </div>
                    {/* Absolutely positioned text and icon */}
                    <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                      {data.icon}
                      <span className="ml-3 text-sm font-medium text-white">
                        {data.name}
                      </span>
                    </div>
                  </div>
                  {/* Visitor count */}
                  <span className="text-sm font-semibold w-12 text-right flex-shrink-0">
                    {formatNumber(data.visitors)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <footer className="flex justify-center font-semibold py-2 mt-auto cursor-pointer text-white/50 hover:text-white/80">
        <p className="text-sm">DETAILS</p>
      </footer>
    </div>
  );
};

export default TrafficChart;
