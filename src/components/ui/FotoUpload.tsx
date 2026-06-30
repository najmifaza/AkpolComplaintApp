"use client";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Image as ImageIcon } from "lucide-react";

interface FotoUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
}

export function FotoUpload({ files, setFiles, maxFiles = 3 }: FotoUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        alert(`Maksimal ${maxFiles} foto diperbolehkan.`);
        return;
      }
      setFiles([...files, ...acceptedFiles]);
    },
    [files, setFiles, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 5 * 1024 * 1024, // 5MB limit per file
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:bg-slate-50 hover:border-slate-400"
        }`}
      >
        <input {...getInputProps()} />
        <ImageIcon className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <p className="text-slate-700 font-medium text-sm">
          Seret & lepas foto ke sini, atau klik untuk memilih file
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Maksimal {maxFiles} foto (JPEG/PNG/WEBP). Ukuran max 5MB/foto.
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-28 object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
