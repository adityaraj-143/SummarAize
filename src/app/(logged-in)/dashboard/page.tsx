'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { FileText, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SummaryType } from '@/types/types';
import { useQuery } from '@tanstack/react-query';
import SummaryCard from '@/components/summaryCard';

const fetchSummaries = async (): Promise<(SummaryType & { chat_id: number})[]> => {
  const result = await axios.get('/api/summaries');
  return result.data.data;
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    data: summaries = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['summaries'],
    queryFn: fetchSummaries,
  });

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const categories = [
    'All',
    'Finance',
    'Technology',
    'Research',
    'HR',
    'Marketing',
    'Legal',
  ];

  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch =
      summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.summary_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || summary.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Loading summaries...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-red-500'>Error: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Page Title and Stats */}
        <div className='mb-8'>
          <h2 className='text-3xl font-bold mb-2'>Your AI Summaries</h2>
          <p className='text-muted-foreground'>
            Manage and view all your generated summaries in one place
          </p>
          <div className='flex items-center gap-6 mt-4'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-primary rounded-full'></div>
              <span className='text-sm text-muted-foreground'>
                {summaries.length} summaries created
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-accent rounded-full'></div>
              <span className='text-sm text-muted-foreground'>
                {/* {summaries.reduce((acc, item) => acc + item.pages, 0)} pages processed */}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className='mb-6 flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search summaries...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 bg-card border-border'
            />
          </div>
          <div className='flex gap-2 flex-wrap'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'btn-primary' : ''}
              >
                <Filter className='w-3 h-3 mr-2' />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Grid */}
        <SummaryCard filteredSummaries={filteredSummaries} />

        {/* Empty State */}
        {filteredSummaries.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
              <FileText className='w-8 h-8 text-primary' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No summaries found</h3>
            <p className='text-muted-foreground mb-4'>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first PDF to get started with AI summarization'}
            </p>
            <Button className='btn-primary'>
              <Plus className='w-4 h-4 mr-2' />
              Create New Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
