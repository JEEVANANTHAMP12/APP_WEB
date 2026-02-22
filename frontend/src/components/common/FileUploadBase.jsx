// @ts-nocheck
import { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle, RefreshCw, FileImage, FileText, File } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */

export function getReadableFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type = '') {
  if (type.includes('image')) return FileImage;
  if (type.includes('pdf')) return FileText;
  return File;
}

function getFileAccentColor(type = '') {
  if (type.includes('image')) return '#6366f1';
  if (type.includes('pdf')) return '#ef4444';
  return '#64748b';
}

/* ─────────────────────────────────────────────────────────────────
   FileUpload.Root
───────────────────────────────────────────────────────────────── */
const Root = ({ children }) => (
  <div className="flex flex-col gap-3">{children}</div>
);

/* ─────────────────────────────────────────────────────────────────
   FileUpload.DropZone
───────────────────────────────────────────────────────────────── */
const DropZone = ({ onDropFiles, isDisabled = false, accept = '*', label = 'Click or drag & drop', hint = 'Any file up to 20 MB' }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    if (isDisabled) return;
    setDragOver(false);
    if (e.dataTransfer.files?.length) onDropFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    if (e.target.files?.length) {
      onDropFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{
        width: '100%',
        borderRadius: '0.75rem',
        border: `2px dashed ${dragOver ? '#6366f1' : 'var(--border-color)'}`,
        background: dragOver ? 'rgba(99,102,241,0.07)' : 'var(--bg-elevated)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={isDisabled}
      />
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '0.75rem',
          background: 'rgba(99,102,241,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UploadCloud size={20} style={{ color: '#6366f1' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', margin: 0 }}>
          {dragOver ? 'Drop to upload' : label}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{hint}</p>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FileUpload.List
───────────────────────────────────────────────────────────────── */
const List = ({ children }) => {
  const items = Array.isArray(children) ? children.filter(Boolean) : (children ? [children] : []);
  if (items.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   FileUpload.ListItemProgressFill
   Props: id, name, type, size, progress (0-100), failed, preview,
          onDelete, onRetry
───────────────────────────────────────────────────────────────── */
const ListItemProgressFill = ({ name, type = '', size = 0, progress = 0, failed = false, preview, onDelete, onRetry }) => {
  const Icon = getFileIcon(type);
  const accent = getFileAccentColor(type);
  const isDone = progress >= 100 && !failed;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '0.75rem',
        border: `1px solid ${failed ? 'rgba(239,68,68,0.25)' : 'var(--border-color)'}`,
        background: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Progress fill background */}
      {!failed && progress < 100 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(99,102,241,0.07)',
            width: `${progress}%`,
            transition: 'width 0.15s ease',
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.875rem',
        }}
      >
        {/* Thumbnail / icon */}
        {preview ? (
          <img
            src={preview}
            alt={name}
            style={{
              width: 36,
              height: 36,
              borderRadius: '0.5rem',
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid var(--border-color)',
            }}
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '0.5rem',
              background: failed ? 'rgba(239,68,68,0.1)' : `${accent}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {failed
              ? <AlertCircle size={16} style={{ color: '#ef4444' }} />
              : <Icon size={16} style={{ color: accent }} />
            }
          </div>
        )}

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: failed ? '#ef4444' : 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0' }}>
            {getReadableFileSize(size)}
            {failed && <span style={{ color: '#ef4444', marginLeft: 6 }}>· Upload failed</span>}
            {isDone && <span style={{ color: '#10b981', marginLeft: 6 }}>· Complete</span>}
            {!isDone && !failed && progress > 0 && (
              <span style={{ color: '#6366f1', marginLeft: 6 }}>· {progress}%</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {failed && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              title="Retry"
              style={{
                width: 28,
                height: 28,
                borderRadius: '0.5rem',
                background: 'rgba(99,102,241,0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
              }}
            >
              <RefreshCw size={13} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Remove"
              style={{
                width: 28,
                height: 28,
                borderRadius: '0.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Named export — compound component
───────────────────────────────────────────────────────────────── */
export const FileUpload = { Root, DropZone, List, ListItemProgressFill };
