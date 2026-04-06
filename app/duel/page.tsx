import { DuelRoom } from '@/components/duel/DuelRoom';

export default async function DuelPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  // In Next.js 15+, searchParams is a Promise
  const params = await searchParams;
  const initialRoomId = params?.room;

  return (
    <div className="flex flex-col h-screen bg-void-black text-white overflow-hidden fixed inset-0">
      <DuelRoom initialRoomId={initialRoomId} />
    </div>
  );
}