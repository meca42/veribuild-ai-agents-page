import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  requireTypedConfirmation?: boolean;
  confirmationText?: string;
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  requireTypedConfirmation = false,
  confirmationText = '',
  loading = false,
}: ConfirmDialogProps) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');

  const handleConfirm = () => {
    if (requireTypedConfirmation && typedConfirmation !== confirmationText) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setTypedConfirmation('');
    onClose();
  };

  const isConfirmDisabled = requireTypedConfirmation && typedConfirmation !== confirmationText;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{message}</p>

        {requireTypedConfirmation && (
          <div className="space-y-2">
            <label htmlFor="confirm-input" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Type <span className="font-mono font-semibold">{confirmationText}</span> to confirm
            </label>
            <Input
              id="confirm-input"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={confirmationText}
              autoComplete="off"
              aria-required="true"
              aria-label="Type confirmation text"
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            onClick={handleConfirm}
            disabled={isConfirmDisabled || loading}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
