import { getFamiliesAction, getAnalyticsEventsAction } from '@/app/actions';
import FamiliesManager from '@/components/admin/FamiliesManager';

export const revalidate = 30;

export default async function AdminFamiliesPage() {
  const [familiesRes, eventsRes] = await Promise.all([
    getFamiliesAction(),
    getAnalyticsEventsAction(),
  ]);

  const families = familiesRes.success && familiesRes.families ? familiesRes.families : [];
  const events   = eventsRes.success  && eventsRes.events   ? eventsRes.events   : [];

  return <FamiliesManager initialFamilies={families} analyticsEvents={events} />;
}
