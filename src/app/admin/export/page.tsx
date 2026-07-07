import { getFamiliesAction } from '@/app/actions';
import ExportViewer from '@/components/admin/ExportViewer';

export const dynamic = 'force-dynamic';

export default async function AdminExportPage() {
  const res = await getFamiliesAction();
  const families = res.success && res.families ? res.families : [];

  return <ExportViewer families={families} />;
}
