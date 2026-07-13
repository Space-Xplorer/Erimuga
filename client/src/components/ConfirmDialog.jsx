import { useState, useCallback, useRef } from 'react';
import { Dialog } from '@headlessui/react';

const ConfirmDialog = ({ isOpen, title, message, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel }) => (
  <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
        <Dialog.Title className="text-lg font-semibold text-gray-800 mb-2">{title}</Dialog.Title>
        {message && <p className="text-sm text-gray-600 mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </Dialog.Panel>
    </div>
  </Dialog>
);

// Promise-based replacement for window.confirm(), rendered via the returned `dialog` element.
// Usage: const { confirm, dialog } = useConfirmDialog(); ... if (!await confirm('Delete this?')) return; ... return <>{dialog}...</>
export function useConfirmDialog() {
  const [state, setState] = useState({ isOpen: false, title: 'Are you sure?', message: '', confirmLabel: 'Confirm' });
  const resolver = useRef(null);

  const confirm = useCallback((message, opts = {}) => {
    setState({
      isOpen: true,
      title: opts.title || 'Are you sure?',
      message,
      confirmLabel: opts.confirmLabel || 'Confirm',
    });
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const handleConfirm = () => {
    setState((s) => ({ ...s, isOpen: false }));
    resolver.current?.(true);
  };

  const handleCancel = () => {
    setState((s) => ({ ...s, isOpen: false }));
    resolver.current?.(false);
  };

  const dialog = (
    <ConfirmDialog
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}

export default ConfirmDialog;
