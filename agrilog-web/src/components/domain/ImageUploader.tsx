import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
}

export interface ImageUploaderProps {
  onFilesChange?: (images: UploadedImage[]) => void;
}

export function ImageUploader({ onFilesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, 6 - images.length);
    const readers = files.map(
      (file) =>
        new Promise<UploadedImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              name: file.name,
              url: reader.result as string,
            });
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(readers).then((newImgs) => {
      const merged = [...images, ...newImgs];
      setImages(merged);
      onFilesChange?.(merged);
    });
  }

  function removeImage(id: string) {
    const merged = images.filter((i) => i.id !== id);
    setImages(merged);
    onFilesChange?.(merged);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DCE0C4] bg-[#FFFDF6] py-7 text-center transition hover:border-[#C9A227] hover:bg-[#F7F2DF]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECEEDA] text-[#1C2B1E]">
          <Upload className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
        <p
          className="text-[13px] text-[#33361F]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Kéo thả ảnh vào đây hoặc bấm để chọn
        </p>
        <p className="text-[11px] text-[#A8AC86]">Tối đa 6 ảnh · JPG, PNG</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[#E1E5CB]"
            >
              <img
                src={img.url}
                alt={img.name}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-0 transition group-hover:opacity-100"
                aria-label="Xoá ảnh"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
