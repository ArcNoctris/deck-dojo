import { redirect } from 'next/navigation';

// The Home Hub now lives at the root route — this alias exists only because
// older links (GameNav history, bookmarks) may still point here.
export default function DashboardRedirect() {
  redirect('/');
}
