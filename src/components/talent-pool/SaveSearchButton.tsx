"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BookmarkPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSearchAction } from "@/server/actions/recruiter";

export function SaveSearchButton() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // If there are no search params, there's nothing to save really
  if (Array.from(searchParams.entries()).length === 0) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSaving(true);
    try {
      const queryStr = searchParams.get("query") || "";
      await saveSearchAction(name, queryStr, searchParams.toString());
      toast.success("Search saved successfully! You will receive alerts for new matches.");
      setIsOpen(false);
      setName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to save search.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100">
          <BookmarkPlus className="size-4" />
          <span className="font-medium">Save Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Save this Search</DialogTitle>
            <DialogDescription>
              We'll notify you when new candidates match these exact criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchName">Alert Name</Label>
              <Input 
                id="searchName" 
                placeholder="e.g. Senior Frontend Devs in Colombo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving} className="bg-teal-700 text-white hover:bg-teal-800">
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save & Create Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
