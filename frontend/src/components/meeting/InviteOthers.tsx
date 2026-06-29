'use client';

import { UserPlus, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface InviteOthersProps {
  meetingId: string;
}

export function InviteOthers({ meetingId }: InviteOthersProps) {
  const meetingLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/meeting/${meetingId}`
      : `/meeting/${meetingId}`;

  const copyLink = () => {
    void navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied');
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyLink} title="Copy meeting link">
        <Link2 className="mr-1 h-4 w-4" />
        Copy link
      </Button>
      <span className="hidden text-xs text-slate-500 sm:inline">
        <UserPlus className="mr-1 inline h-3 w-3" />
        Share this meeting link
      </span>
    </div>
  );
}
