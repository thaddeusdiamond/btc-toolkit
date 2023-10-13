'use client';

import Image from 'next/image';
import React, {useEffect, useState, useMemo} from 'react';
import {useDropzone} from 'react-dropzone';

export const COLLECTION_FILES = 'collectionFiles';

const getBaseStyle = (darkMode) => {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: (darkMode ? '#111111' : '#eeeeee'),
    borderStyle: 'dashed',
    backgroundColor: (darkMode ? '#050505' : '#fafafa'),
    color: (darkMode ? '#424242' : '#bdbdbd'),
    outline: 'none',
    maxWidth: '100%',
    transition: 'border .24s ease-in-out'
  }
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

const thumb = {
  display: 'inline-flex',
  position: 'relative',
  borderRadius: 2,
  justifyContent: 'center',
  border: '1px solid #3f69c9',
  width: '100%',
  height: 'auto',
  aspectRatio: '1/1',
  padding: 4,
  boxSizing: 'border-box'
};

export function Compressor({ visible, changeFunc, darkMode }) {
  const [files, setFiles] = useState(new Map());
  const [filesIdx, setFilesIdx] = useState(0);

  const removeFile = (idx) => {
    files.delete(idx);
    setFiles(new Map(files));
    changeFunc(COLLECTION_FILES, files);
  };

  const {getRootProps, getInputProps, isFocused, isDragAccept, isDragReject} = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: acceptedFiles => {
      const copiedFiles = new Map(files);
      for (let curIdx = 0; curIdx < acceptedFiles.length; curIdx++) {
        const file = acceptedFiles[curIdx];
        const acceptedFileWithPreview = Object.assign(file, { preview: URL.createObjectURL(file) });
        copiedFiles.set((filesIdx + curIdx).toString(), acceptedFileWithPreview);
      }
      setFiles(copiedFiles);
      setFilesIdx(filesIdx + acceptedFiles.length);
      changeFunc(COLLECTION_FILES, copiedFiles);
    }
  });

  const style = useMemo(() => ({
    ...getBaseStyle(darkMode),
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject,
    darkMode
  ]);

  const thumbs = Array.from(files.entries()).map(file => (
    <div style={thumb} key={file[1].name}>
      <div className="w-full flex items-center justify-center">
        <Image
          className="max-w-full max-h-full w-auto h-auto"
          src={file[1].preview}
          // Revoke data uri after image is loaded
          onLoad={() => { URL.revokeObjectURL(file[1].preview) }}
          width={100}
          height={100}
        />
        <div className="absolute right-1 top-0 text-red-500 font-semibold cursor-pointer" onClick={() => removeFile(file[0])}>
          X
        </div>
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <div className={`md:min-w-[400px] lg:min-w-[560px] xl:min-w-[710px] ${visible ? '' : 'hidden'}`}>
      <section aria-labelledby="section-1-title">
        <h2 className="sr-only" id="section-1-title">Image Compressor</h2>
        <div className="rounded-lg bg-white shadow dark:bg-gray-700">
          <div className="p-6">
            <div {...getRootProps({style})}>
              <input {...getInputProps()} />
              <p className="whitespace-wrap text-center">
                Drag &apos;n drop some files here, or click to select files
              </p>
            </div>
            <aside className="overflow-scroll max-h-[70vh] grid grid-cols-6 mt-4 gap-2">
              {thumbs}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
