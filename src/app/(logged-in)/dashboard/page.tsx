"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import SummaryCard from "@/components/summaryCard";

const fetchSummaries = async (): Promise<(SummaryType & { chat_id: number })[]> => {
  const result = await axios.get("/api/summaries");
  return result.data.data;
};

const Dashboard = () => {
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

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading summaries...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title and Stats */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Your AI Summaries</h2>
          <p className="text-muted-foreground">
            Manage and view all your generated summaries in one place
          </p>
          <div className="flex gap-6 items-center mt-4">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                {summaries.length} summaries created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 bg-accent rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                {/* {summaries.reduce((acc, item) => acc + item.pages, 0)} pages processed */}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 text-muted-foreground transform -translate-y-1/2" />
            <Input
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "btn-primary" : ""}
              >
                <Filter className="size-3 mr-2" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Grid */}
        <SummaryCard filteredSummaries={filteredSummaries} />

        {/* Empty State */}
        {filteredSummaries.length === 0 && (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center size-16 mx-auto mb-4 bg-primary/10 rounded-full">
              <FileText className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No summaries found</h3>
            <p className="mb-4 text-muted-foreground">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Upload your first PDF to get started with AI summarization"}
            </p>
            <Button className="btn-primary">
              <Plus className="size-4 mr-2" />
              Create New Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
