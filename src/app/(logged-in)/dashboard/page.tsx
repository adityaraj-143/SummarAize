"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import SummaryCard from "@/components/summaryCard";
import { Card, CardContent } from "@/components/ui/card";

const fetchSummaries = async (): Promise<(SummaryType & { chat_id: number })[]> => {
  const result = await axios.get("/api/summaries");
  return result.data.data;
};

/* ── Skeleton Card ── */
const SkeletonCard = ({ delay }: { delay: string }) => (
  <Card className="animate-fade-in border-border" style={{ animationDelay: delay }}>
    <CardContent className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="skeleton size-10 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="skeleton mb-3 h-5 w-3/4 rounded" />
      <div className="skeleton mb-2 h-4 w-full rounded" />
      <div className="skeleton mb-4 h-4 w-2/3 rounded" />
      <div className="flex justify-end gap-2">
        <div className="skeleton h-8 w-24 rounded" />
        <div className="skeleton h-8 w-20 rounded" />
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const {
    data: summaries = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["summaries"],
    queryFn: fetchSummaries,
  });

  const categories = ["All", "Finance", "Technology", "Research", "HR", "Marketing", "Legal"];

  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch =
      summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.summary_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || summary.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton header */}
          <div className="mb-8 animate-fade-in">
            <div className="skeleton mb-3 h-8 w-64 rounded" />
            <div className="skeleton h-5 w-96 rounded" />
          </div>

          {/* Skeleton search + filters */}
          <div
            className="mb-6 flex animate-fade-in flex-col gap-4 sm:flex-row"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="skeleton h-10 flex-1 rounded-md" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-8 w-20 rounded-md" />
              ))}
            </div>
          </div>

          {/* Skeleton cards grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard delay="0.15s" />
            <SkeletonCard delay="0.25s" />
            <SkeletonCard delay="0.35s" />
            <SkeletonCard delay="0.45s" />
            <SkeletonCard delay="0.55s" />
            <SkeletonCard delay="0.65s" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-fade-in text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <FileText className="size-8 text-destructive" />
          </div>
          <p className="mb-2 text-lg font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title and Stats */}
        <div className="mb-8 animate-slide-down">
          <h2 className="mb-2 text-3xl font-bold">Your AI Summaries</h2>
          <p className="text-muted-foreground">
            Manage and view all your generated summaries in one place
          </p>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary animate-pulse-glow"></div>
              <span className="text-sm text-muted-foreground">
                {summaries.length} summaries created
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div
          className="mb-6 flex animate-slide-up flex-col gap-4 sm:flex-row"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-card pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`transition-transform hover:scale-105 active:scale-95 ${
                  selectedCategory === category ? "btn-primary" : ""
                }`}
              >
                <Filter className="mr-2 size-3" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Grid */}
        <SummaryCard filteredSummaries={filteredSummaries} />

        {/* Empty State */}
        {filteredSummaries.length === 0 && (
          <div className="animate-scale-in py-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 animate-float">
              <FileText className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No summaries found</h3>
            <p className="mb-4 text-muted-foreground">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Upload your first PDF to get started with AI summarization"}
            </p>
            <Button
              className="btn-primary transition-transform hover:scale-105 active:scale-95"
              onClick={() => router.push("/#upload")}
            >
              <Plus className="mr-2 size-4" />
              Create New Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
