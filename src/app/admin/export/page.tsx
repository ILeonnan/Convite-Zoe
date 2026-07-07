import { getFamiliesAction } from '@/app/actions';
import ExportViewer from '@/components/admin/ExportViewer';

export const revalidate = 30;

export default async function AdminExportPage() {
  const res = await getFamiliesAction();
  const families = res.success && res.families ? res.families : [];

  return <ExportViewer families={families} />;
}
