import { FileUp, X } from "lucide-react";

export const MAX_LEAD_FILES = 5;
export const MAX_LEAD_FILE_SIZE = 10 * 1024 * 1024;
export const LEAD_FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.dwg,.dxf";

interface LeadAttachmentsProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export function LeadAttachments({ files, onChange }: LeadAttachmentsProps) {
  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, MAX_LEAD_FILES);
    onChange(next);
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-foreground">Drawings or site photos</span>
      <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-bold text-foreground hover:border-accent hover:text-accent">
        <FileUp className="h-5 w-5" />
        Add project files
        <input
          type="file"
          className="sr-only"
          accept={LEAD_FILE_ACCEPT}
          multiple
          onChange={(event) => {
            addFiles(event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Up to 5 PDF, image, DWG or DXF files. Maximum 10 MB per file.</p>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Selected project files">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}`} className="flex min-h-11 items-center justify-between gap-3 border border-border bg-secondary/40 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">{file.name}</span>
              <button type="button" className="icon-button h-9 w-9" aria-label={`Remove ${file.name}`} onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
