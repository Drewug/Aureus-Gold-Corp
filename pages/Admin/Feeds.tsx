import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader } from '../../components/ui';
import { XMLFeedsPanel } from '../../components/XMLFeedsPanel';

export const Feeds = () => {
  return (
    <AdminLayout>
      <PageHeader title="Marketing Feeds" subtitle="Manage XML feeds for third-party platforms." />
      <XMLFeedsPanel />
    </AdminLayout>
  );
};
