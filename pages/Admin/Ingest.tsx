import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader } from '../../components/ui';
import { AdminIngestPanel } from '../../components/AdminIngestPanel';

export const Ingest = () => {
  return (
    <AdminLayout>
      <PageHeader title="Product Ingestion" subtitle="Bulk import products using JSON." />
      <AdminIngestPanel />
    </AdminLayout>
  );
};
