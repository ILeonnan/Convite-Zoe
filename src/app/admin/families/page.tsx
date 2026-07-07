import { getFamiliesAction } from '@/app/actions';
import FamiliesManager from '@/components/admin/FamiliesManager';

export const dynamic = 'force-dynamic';

export default async function AdminFamiliesPage() {
  const res = await getFamiliesAction();
  const families = res.success && res.families ? res.families : [];

  return <FamiliesManager initialFamilies={families} />;
}
