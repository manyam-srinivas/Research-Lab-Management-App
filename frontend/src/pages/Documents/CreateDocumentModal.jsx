import { useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

import { uploadDocument } from "../../services/documentService";
import { showError, showSuccess } from "../../utils/toast";
const CreateDocumentModal = ({
  isOpen,
  onClose,
  token,
  projectId,
  onSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showError("Please select a file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("project_id", projectId);
      formData.append("file", file);

      await uploadDocument(token, formData);

      showSuccess("Document uploaded successfully");

      setFile(null);

      onSuccess();
    } catch (err) {
      console.error(err);
      showError("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Upload Document"
    size="max-w-md"
  >
    <form onSubmit={handleSubmit} className="space-y-5">

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select File
        </label>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full rounded-xl border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex justify-end gap-3">

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>

      </div>

    </form>
  </Modal>
);
};

export default CreateDocumentModal;