import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/Button';

interface ThumbnailUploaderProps {
  onImageUpload: (file: File) => void;
}

export function ThumbnailUploader({ onImageUpload }: ThumbnailUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const file = acceptedFiles[0];
      onImageUpload(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  return (
    <div>
      {preview ? (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img 
              src={preview} 
              alt="Thumbnail preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors aspect-video flex flex-col items-center justify-center
            ${isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-gray-800 hover:border-orange-500'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-gray-300 text-sm">
            {isDragActive
              ? "Drop your thumbnail here"
              : "Drag & drop your thumbnail here, or click to select"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports JPG, JPEG, PNG
          </p>
        </div>
      )}
    </div>
  );
}