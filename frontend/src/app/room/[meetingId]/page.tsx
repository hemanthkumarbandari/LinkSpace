import { redirect } from 'next/navigation';

export default async function RoomRoute({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  redirect(`/lobby/${meetingId}`);
}

