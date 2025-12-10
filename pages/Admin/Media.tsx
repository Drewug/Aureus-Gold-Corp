import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { PageHeader } from '../../components/ui';
import { MediaLibrary } from '../../components/MediaLibrary';

export const Media = () => {
    return (
        <AdminLayout>
            <PageHeader title="Media Library" subtitle="Manage images and digital assets." />
            <div className="h-[calc(100vh-200px)]">
                <MediaLibrary />
            </div>
        </AdminLayout>
    );
};
