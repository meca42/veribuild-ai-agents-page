import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormRow } from '@/components/ui/FormRow';

export const ModalsDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleConfirm = async () => {
    setConfirmLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConfirmLoading(false);
    setShowConfirm(false);
  };

  const handleDangerConfirm = async () => {
    setConfirmLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConfirmLoading(false);
    setShowDangerConfirm(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Modal</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Features: focus trap, ESC to close, click outside to close, keyboard navigation
        </p>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Profile" size="md">
          <div className="space-y-4">
            <FormRow label="Name" htmlFor="modal-name">
              <Input id="modal-name" placeholder="Enter your name" />
            </FormRow>
            <FormRow label="Email" htmlFor="modal-email">
              <Input id="modal-email" type="email" placeholder="you@example.com" />
            </FormRow>
            <FormRow label="Bio" htmlFor="modal-bio">
              <Input id="modal-bio" placeholder="Tell us about yourself" />
            </FormRow>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => setShowModal(false)}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Drawer</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Slide-out panel from the side (default: right)
        </p>
        <Button onClick={() => setShowDrawer(true)}>Open Drawer</Button>

        <Drawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} title="Filters" side="right">
          <div className="space-y-4">
            <FormRow label="Search" htmlFor="drawer-search">
              <Input id="drawer-search" placeholder="Search..." />
            </FormRow>
            <FormRow label="Category" htmlFor="drawer-category">
              <Input id="drawer-category" placeholder="Select category" />
            </FormRow>
            <FormRow label="Status" htmlFor="drawer-status">
              <Input id="drawer-status" placeholder="Select status" />
            </FormRow>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowDrawer(false)} className="flex-1">
                Clear
              </Button>
              <Button onClick={() => setShowDrawer(false)} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </Drawer>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Confirm Dialog</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Simple confirmation with loading state
        </p>
        <Button onClick={() => setShowConfirm(true)}>Show Confirm Dialog</Button>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action? This will update your settings."
          confirmText="Proceed"
          cancelText="Cancel"
          loading={confirmLoading}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Destructive Confirm Dialog</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Requires typing confirmation text for dangerous actions
        </p>
        <Button variant="destructive" onClick={() => setShowDangerConfirm(true)}>
          Delete Project
        </Button>

        <ConfirmDialog
          isOpen={showDangerConfirm}
          onClose={() => setShowDangerConfirm(false)}
          onConfirm={handleDangerConfirm}
          title="Delete Project"
          message="This action cannot be undone. This will permanently delete the project and all associated data."
          confirmText="Delete Project"
          cancelText="Cancel"
          variant="danger"
          requireTypedConfirmation
          confirmationText="DELETE"
          loading={confirmLoading}
        />
      </div>
    </div>
  );
};
