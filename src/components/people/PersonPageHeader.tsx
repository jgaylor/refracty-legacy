'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, type PageAction } from '@/components/PageHeader';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useMobileHeader } from '@/components/MobileHeaderProvider';

interface PersonPageHeaderProps {
  personId: string;
  personName: string;
}

export function PersonPageHeader({ personId, personName }: PersonPageHeaderProps) {
  const router = useRouter();
  const { setConfig } = useMobileHeader();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {

    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccessToast('Person deleted');
        setShowDeleteConfirm(false);
        router.push('/people');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      showErrorToast(errorMessage);
    }
  };

  const actions: PageAction[] = [
    {
      label: 'Delete person',
      onClick: handleDeleteClick,
      destructive: true,
    },
  ];

  // Configure mobile header
  useEffect(() => {
    const mobileActions: PageAction[] = [
      {
        label: 'Delete person',
        onClick: handleDeleteClick,
        destructive: true,
      },
    ];

    setConfig({
      pageTitle: personName,
      showBackButton: true,
      backHref: '/people',
      moreActions: mobileActions,
    });

    return () => {
      setConfig(null);
    };
  }, [personName, setConfig, handleDeleteClick]);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'People', href: '/people' },
          { label: personName },
        ]}
        actions={actions}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Person"
        message={`Are you sure you want to delete ${personName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

