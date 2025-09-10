"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { BarChart3, ChevronDown, Copy, Check, ArrowRight } from "lucide-react";
import { DailyClicksChart } from "@/components/DailyChart";
import { RoundedPieChart } from "@/components/DeviceChart";

import {
  getAllLinks,
  type LinkData,
  type CreateLinkInput,
  createLink
} from "@/actions/link";
import TrafficChart from "@/components/Landing/Traffic";
import InteractiveMap from "@/components/Map";
import NewLinkForm from "@/components/Dashboard/NewLinkForm";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NewLink {
  url: string;
  title: string;
  description: string;
}
const TrackableLinksApp = () => {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState<NewLink>({
    url: "",
    title: "",
    description: "",
  });
  const createLinkHandler = async () => {
    if (!newLink.url) return;

    try {
      const input: CreateLinkInput = {
        url: newLink.url,
        title: newLink.title,
        description: newLink.description,
      };

      const result = await createLink(input);

      if (result.success && result.data) {
        setLinks([result.data, ...links]);
        setSelectedLink(result.data);
        setNewLink({ url: "", title: "", description: "" });
        setCreateDialogOpen(false);
      } else {
        console.error("Error creating link:", result.error);
      }
    } catch (error) {
      console.error("Error creating link:", error);
    }
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const result = await getAllLinks();
      console.log(result);
      if (result.success && result.data) {
        setLinks(result.data);
        if (!selectedLink && result.data.length > 0) {
          setSelectedLink(result.data[0]);
        }
      } else {
        console.error("Error loading links:", result.error);
      }
    } catch (error) {
      console.error("Error loading links:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load links on component mount
  useEffect(() => {
    loadLinks();
  }, []);

  // Update the short URL display to use your domain
  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`;
  };

  const AnalyticsView = () => {
    const [isOpen, setIsOpen] = useState(false);

    const link = selectedLink || links[0];

    if (!link) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-600 mb-6" />

          <Card className="w-full max-w-2xl bg-[#383838] px-2 sm:px-5 border border-[#282828]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-white/80 text-xl sm:text-2xl">
                Create Trackable Link
              </CardTitle>
              <CardDescription className="text-white/50 text-sm sm:text-base">
                Transform any URL into a powerful tracking link with detailed
                analytics.
              </CardDescription>
            </CardHeader>
            <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-300">
                  Destination URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://your-website.com/page"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#282828] border border-[#383838] text-sm sm:text-base text-white/80 rounded-lg focus:ring-0 placeholder-white/50"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-300">
                  Link Title
                </label>
                <Input
                  type="text"
                  placeholder="My Product Landing Page"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#282828] border border-[#383838] text-sm sm:text-base text-white/80 rounded-lg focus:ring-0 placeholder-white/50"
                  value={newLink.title}
                  onChange={(e) =>
                    setNewLink({ ...newLink, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-300">
                  Description
                </label>
                <Textarea
                  placeholder="Brief description for your reference"
                  rows={3}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#282828] border border-[#383838] text-sm sm:text-base text-white/80 rounded-lg focus:ring-0 placeholder-white/50"
                  value={newLink.description}
                  onChange={(e) =>
                    setNewLink({
                      ...newLink,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <CardFooter className="flex justify-end px-2 sm:px-6 pb-4 sm:pb-6">
              <Button
                onClick={createLinkHandler}
                className="bg-[#e16540] hover:bg-[#e16540]/80 text-white text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Create Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-7xl py-20 mx-auto space-y-6 bg-[#1f1f1f]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-[#383838] hover:text-white/80 cursor-pointer text-white/70 border-none flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[#404040] transition-colors"
                >
                  {selectedLink
                    ? selectedLink.title
                    : links.length
                    ? "Select link"
                    : "No links"}
                  <ChevronDown
                    className={`h-4 w-4 text-white/70 ${
                      isOpen ? "rotate-180 animate-in" : "animate-out"
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-[#383838] border-[#484848]">
                <DropdownMenuLabel className="text-white/70">
                  Your Links
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#484848]" />
                {links.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-white/70">
                    No links yet
                  </div>
                ) : (
                  links.map((lnk) => (
                    <DropdownMenuItem
                      key={lnk.id}
                      className="cursor-pointer hover:bg-[#404040] focus:bg-[#404040] flex justify-between"
                      onSelect={(e) => {
                        const target = e.target as HTMLElement | null;
                        if (target && target.closest("[data-copy-btn]")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        className="flex flex-col items-start"
                        onClick={() => {
                          setSelectedLink(lnk);
                          setIsOpen(false);
                        }}
                      >
                        <span className="text-white text-sm">{lnk.title}</span>
                        <span className="text-xs text-white/50 truncate block">
                          {getShortUrl(lnk.shortCode)}
                        </span>
                      </button>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        className="cursor-pointer border-[#484848] border hover:border hover:border-[#383838] hover:bg-[#484848]"
                        data-copy-btn
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const shortUrl = getShortUrl(lnk.shortCode);
                          navigator.clipboard
                            ?.writeText(shortUrl)
                            .then(() => {
                              setCopiedLinkId(lnk.id);
                              setTimeout(
                                () =>
                                  setCopiedLinkId((id) =>
                                    id === lnk.id ? null : id
                                  ),
                                2000
                              );
                            })
                            .catch(() => {});
                        }}
                      >
                        {copiedLinkId === lnk.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ArrowRight className="w-5 h-5 text-white/70" />
            <Button
              variant="outline"
              className="bg-[#383838] hover:text-white/80 cursor-pointer text-white/70 border-none flex items-center gap-2 px-4 py-2 rounded-md hover:bg-[#404040] transition-colors"
            >
              {new URL(link.originalUrl).hostname}
            </Button>
          </div>

          <NewLinkForm
            links={links}
            setLinks={setLinks}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
          />
        </div>

        <DailyClicksChart
          data={link.analytics.dailyClicks}
          totalClicks={link.analytics.clicks}
          className="shadow-lg"
        />
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RoundedPieChart
            data={selectedLink?.analytics.devices || []}
            title="Device Breakdown"
          />
          <div className="space-y-3 bg-[#282828]  border border-[#383838] rounded-xl">
            <TrafficChart />
          </div>
        </div>

        {/* Geographic and Referrer Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1 bg-[#282828] rounded-xl  border border-[#383838]">
            <InteractiveMap height={700} width={920} margin={-15} />
          </div>
          <div className="space-y-3 bg-[#282828]  border border-[#383838] rounded-xl">
            <TrafficChart />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f]">
      {/* Header */}
      <div className=" border-b border-[#383838] sticky top-0 z-30 bg-[#1f1f1f]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white">ShareTrack</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnalyticsView />
      </div>
    </div>
  );
};

export default TrackableLinksApp;
