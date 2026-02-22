// @ts-nocheck
import { useRef, useState } from 'react';
import { FileUpload, getReadableFileSize } from './FileUploadBase';

const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

/**
 * ImageUpload — wraps FileUpload compound component for image-only uploads.
 * Converts the selected file to base64 and calls onChange(dataUrl).
 *
 * Props:
 *   value    – current image string (URL or base64), shown as preview
 *   onChange – (dataUrl: string) => void
 *   label    – optional label string (default "Photo")
 *   required – passed to the hidden file input
 */
const ImageUpload = ({ value, onChange, label = 'Photo', required = false }) => {
  const [file, setFile] = useState(null); // { name, size, type, progress, failed, preview }
  const [error, setError] = useState('');

  const simulateProgress = (onProgress, onDone) => {
    let p = 0;
    const tick = () => {
      p = Math.min(p + Math.floor(Math.random() * 18) + 8, 95);
      onProgress(p);
      if (p < 95) requestAnimationFrame(tick);
      else setTimeout(onDone, 80);
    };
    requestAnimationFrame(tick);
  };

  const processFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`File too large. Maximum ${MAX_MB} MB allowed.`);
      return;
    }
    setError('');

    const entry = { name: f.name, size: f.size, type: f.type, progress: 0, failed: false, preview: null };
    setFile(entry);

    simulateProgress(
      (p) => setFile((prev) => prev ? { ...prev, progress: p } : prev),
      () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          setFile((prev) => prev ? { ...prev, progress: 100, preview: dataUrl } : prev);
          onChange(dataUrl);
        };
        reader.onerror = () => {
          setFile((prev) => prev ? { ...prev, failed: true } : prev);
          setError('Failed to read file.');
        };
        reader.readAsDataURL(f);
      },
    );
  };

  const handleDropFiles = (fileList) => {
    processFile(fileList[0]);
  };

  const handleDelete = () => {
    setFile(null);
    setError('');
    onChange('');
  };

  const handleRetry = () => {
    if (!file) return;
    setFile((prev) => ({ ...prev, progress: 0, failed: false }));
    setTimeout(() => setFile((prev) => prev ? { ...prev, failed: true } : prev), 2000);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="input-label">{label}</label>
      )}

      <FileUpload.Root>
        {/* Show drop zone only when nothing is in progress / uploaded */}
        {!file && (
          <FileUpload.DropZone
            accept="image/*"
            onDropFiles={handleDropFiles}
            label="Click or drag & drop image"
            hint={`PNG, JPG, GIF, WebP · max ${MAX_MB} MB`}
          />
        )}

        <FileUpload.List>
          {file && (
            <FileUpload.ListItemProgressFill
              key={file.name}
              name={file.name}
              type={file.type}
              size={file.size}
              progress={file.progress}
              failed={file.failed}
              preview={file.preview || (value && value.startsWith('data:') ? value : null)}
              onDelete={handleDelete}
              onRetry={file.failed ? handleRetry : undefined}
            />
          )}
          {/* If there's an existing remote URL (no in-progress file), show it as a completed item */}
          {!file && value && (
            <FileUpload.ListItemProgressFill
              key="existing"
              name="Current image"
              type="image/jpeg"
              size={0}
              progress={100}
              failed={false}
              preview={value}
              onDelete={handleDelete}
            />
          )}
        </FileUpload.List>
      </FileUpload.Root>

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
