import Button from "./Button";
import Modal from "./Modal";

// Themed replacement for window.confirm().
//
// Usage:
//   const [confirm, setConfirm] = useState(null); // { id, title, message }
//   ...
//   <ConfirmDialog
//     open={!!confirm}
//     title={confirm?.title}
//     message={confirm?.message}
//     loading={deleting}
//     onConfirm={() => doDelete(confirm.id)}
//     onCancel={() => setConfirm(null)}
//   />

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen={open} onClose={onCancel} title={title} size="max-w-md">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {message}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>

        <Button
          variant={tone}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Working…" : confirmText}
        </Button>
      </div>
    </Modal>
  );
}
