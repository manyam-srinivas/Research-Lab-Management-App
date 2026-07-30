import { useState } from "react";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">
          Upload Document
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Select File
            </label>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateDocumentModal;