import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createLink,
  type CreateLinkInput,
  type LinkData,
} from "@/actions/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Settings } from "lucide-react";

interface NewLink {
  url: string;
  title: string;
  description: string;
}

const NewLinkForm = ({
  links,
  setLinks,
  selectedLink,
  setSelectedLink,
}: {
  links: LinkData[];
  setLinks: (links: LinkData[]) => void;
  selectedLink: LinkData | null;
  setSelectedLink: (link: LinkData | null) => void;
}) => {
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

  return (
    <div className="flex items-center gap-3">
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#e16540] hover:bg-[#e16540]/80 text-white cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> New Link
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#383838] border border-[#282828]">
          <DialogHeader>
            <DialogTitle className="text-white/80">
              Create Trackable Link
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Transform any URL into a powerful tracking link with detailed
              analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination URL *
              </label>
              <Input
                type="url"
                placeholder="https://your-website.com/page"
                className="w-full px-4 py-2 bg-[#282828] border border-[#383838] text-white/80 rounded-lg focus:ring-0 placeholder-white/50"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link Title
              </label>
              <Input
                type="text"
                placeholder="My Product Landing Page"
                className="w-full px-4 py-2 bg-[#282828] border border-[#383838] text-white/80 rounded-lg focus:ring-0 placeholder-white/50"
                value={newLink.title}
                onChange={(e) =>
                  setNewLink({ ...newLink, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                placeholder="Brief description for your reference"
                rows={3}
                className="w-full px-4 py-2 bg-[#282828] border border-[#383838] text-white/80 rounded-lg focus:ring-0 placeholder-white/50"
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
          <DialogFooter>
            <Button
              onClick={createLinkHandler}
              className="bg-[#e16540] hover:bg-[#e16540]/80 text-white"
            >
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <button className="p-2 text-gray-400 hover:text-gray-300">
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NewLinkForm;
