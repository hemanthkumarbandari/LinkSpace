'use client';

import { useParams } from 'next/navigation';
import { MeetingRoom } from '@/components/meeting/MeetingRoom';

export default function MeetingPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;

  if (!meetingId) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-600">
        Loading meeting…
      </div>
    );
  }

  return <MeetingRoom meetingId={meetingId} />;
}
