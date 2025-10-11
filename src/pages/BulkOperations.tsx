import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BulkImport } from '@/components/common/BulkImport';
import { SEOHead } from '@/components/seo/SEOHead';

const BulkOperations = () => {
  return (
    <DashboardLayout>
      <SEOHead 
        title="Bulk Operations - Import & Export"
        description="Bulk import and export your tax data, compliance items, and reports"
      />
      <div className="container mx-auto p-6">
        <BulkImport />
      </div>
    </DashboardLayout>
  );
};

export default BulkOperations;
