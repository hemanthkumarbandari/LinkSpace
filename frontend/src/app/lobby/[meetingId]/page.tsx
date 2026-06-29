import { LobbyPage } from '@/components/lobby/LobbyPage';

export default async function LobbyRoute({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  return <LobbyPage meetingId={meetingId} />;
}
