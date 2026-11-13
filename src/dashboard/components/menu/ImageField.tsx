import { useId, useRef, useState, type DragEvent } from 'react';
import { ImageSquare, LinkSimple, Trash, UploadSimple, WarningCircle } from '@phosphor-icons/react';
import { getErrorMessage } from '@/shared/api/errors';
import { photo } from '@/shared/lib/image';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/form';
import { Spinner } from '@/shared/ui/Spinner';
import { InlineNotice } from '@/shared/ui/states';
import { useUploadImage } from '../../hooks/menu';

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/** Photo picker: drag and drop, browse, or paste a link. Uploads are resized in the browser first. */
export function ImageField({ value, onChange, error }: ImageFieldProps) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const upload = useUploadImage();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);
    if (!ACCEPTED.includes(file.type)) {
      setLocalError('Use a JPG, PNG or WebP photo.');
      return;
    }
    upload.mutate(file, {
      onSuccess: ({ url }) => onChange(url),
      onError: (uploadError) => setLocalError(getErrorMessage(uploadError)),
    });
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const applyLink = () => {
    try {
      const url = new URL(link.trim());
      if (!/^https?:$/.test(url.protocol)) throw new Error();
      onChange(url.toString());
      setLink('');
      setLocalError(null);
    } catch {
      setLocalError('That does not look like an image link. It should start with https://');
    }
  };

  const message = localError ?? error;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold" id={`${inputId}-label`}>
        Photo
      </span>
      <input
        ref={fileInput}
        id={inputId}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        aria-labelledby={`${inputId}-label`}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-panel bg-paper-deep">
          <img src={photo(value, 900, 600)} alt="Current photo" className="aspect-[3/2] w-full object-cover" />
          <div className="absolute right-3 bottom-3 flex gap-2">
            <Button size="sm" variant="secondary" icon={UploadSimple} onClick={() => fileInput.current?.click()} loading={upload.isPending}>
              Replace
            </Button>
            <Button size="sm" variant="secondary" icon={Trash} onClick={() => onChange('')} disabled={upload.isPending}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-invalid={Boolean(message)}
          className={cn(
            'flex aspect-[3/2] flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed px-6 text-center transition-colors',
            dragging ? 'border-tomato bg-tomato-wash' : 'border-line-strong bg-surface hover:border-ink',
            message && 'border-danger',
          )}
        >
          {upload.isPending ? (
            <>
              <Spinner className="size-6" />
              <span className="text-[15px] font-semibold">Resizing and uploading</span>
            </>
          ) : (
            <>
              <span className="grid size-14 place-items-center rounded-full bg-paper-deep text-ink-soft">
                <ImageSquare size={28} weight="duotone" aria-hidden />
              </span>
              <span className="text-[15px] font-semibold">Drop a photo here, or click to browse</span>
              <span className="text-sm text-muted">JPG, PNG or WebP. Landscape or square works best.</span>
            </>
          )}
        </button>
      )}

      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Image link</span>
          <LinkSimple size={16} weight="bold" aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <Input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }
            }}
            placeholder="Or paste an image link"
            className="h-11 pl-10 text-base sm:text-sm"
          />
        </label>
        <Button variant="secondary" onClick={applyLink} disabled={!link.trim()}>
          Use link
        </Button>
      </div>

      {message && (
        <InlineNotice tone="danger" icon={WarningCircle}>
          {message}
        </InlineNotice>
      )}
    </div>
  );
}
