import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SummaryType } from '@/types/types';
import { useRouter } from 'next/navigation';

type Props = {
  filteredSummaries: SummaryType[];
};

const SummaryCard = ({ filteredSummaries }: Props) => {

    const router = useRouter();

    const handleRoute = (id: string) => {
        router.push(`chat/${id}`)
    }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {filteredSummaries.map((summary, index) => (
        <Card
          key={summary.id}
          className='card-gradient border-border cursor-pointer group animate-fade-in'
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                  <FileText className='w-5 h-5 text-primary' />
                </div>
                <Badge
                  variant='outline'
                  className='text-xs border-primary/20 text-primary'
                >
                  {summary.category}
                </Badge>
              </div>
              <div className='text-xs text-muted-foreground flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                {formatDate(summary.created_at)}
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <h3 className='font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2'>
              {summary.title}
            </h3>
            <p className='text-sm text-muted-foreground line-clamp-3 mb-4'>
              {summary.summary_text}
            </p>
            <div className='flex items-center justify-end text-xs text-muted-foreground'>
              {/* <span>{summary.pages} pages</span> */}
              <Button
                variant='ghost'
                size='sm'
                className='h-8 text-primary'
              >
                View Summary
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 text-primary'
                onClick={() => handleRoute(summary.id)}
              >
                Open Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCard;
