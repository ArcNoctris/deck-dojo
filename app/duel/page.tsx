import { DuelRoom } from '@/components/duel/DuelRoom';

export default function DuelPage({
  searchParams,
}: {
  searchParams: { room?: string };
}) {
  return (
    <div className="flex flex-col h-screen bg-void-black text-white overflow-hidden fixed inset-0">
      <DuelRoom initialRoomId={searchParams.room} />
    </div>
  );
}