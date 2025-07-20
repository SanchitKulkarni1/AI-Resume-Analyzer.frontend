import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  maxSize?: number; // in bytes
  accept?: string[];
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = ['.pdf'],
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setErrorMessage(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setErrorMessage('Invalid file type. Please upload a PDF file.');
      } else {
        setErrorMessage('File upload failed. Please try again.');
      }
      setUploadStatus('error');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadStatus('uploading');
      setErrorMessage('');
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadStatus('success');
          onFileSelect?.(file);
        }
        setUploadProgress(progress);
      }, 200);
    }
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': accept
    },
    maxSize,
    multiple: false,
    disabled: disabled || uploadStatus === 'uploading'
  });

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    onFileRemove?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {!selectedFile ? (
        <Card 
          {...getRootProps()} 
          className={`
            relative overflow-hidden border-2 border-dashed transition-all duration-300 cursor-pointer
            bg-gradient-dark hover:shadow-glow
            ${isDragActive 
              ? 'border-primary bg-primary/5 shadow-glow animate-glow' 
              : 'border-border hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className={`
              w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4
              transition-all duration-300
              ${isDragActive ? 'animate-scale-in bg-primary/20' : ''}
            `}>
              <Upload className={`
                w-8 h-8 transition-colors duration-300
                ${isDragActive ? 'text-primary' : 'text-muted-foreground'}
              `} />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your PDF here' : 'Upload Resume'}
            </h3>
            
            <p className="text-muted-foreground text-center mb-4">
              Drag and drop your PDF resume here, or{' '}
              <span className="text-primary hover:underline">browse files</span>
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="bg-secondary/50">
                PDF only
              </Badge>
              <Badge variant="secondary" className="bg-secondary/50">
                Max {maxSize / 1024 / 1024}MB
              </Badge>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-dark border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium truncate max-w-xs">{selectedFile.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {uploadStatus === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {uploadStatus === 'error' && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={uploadStatus === 'uploading'}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-primary">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span>Upload completed successfully</span>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};