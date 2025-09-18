import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/enhanced-card';
import { documentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await documentsAPI.upload(file);
      
      toast({
        title: "Document uploaded successfully",
        description: `Shipment ID: ${response.document.shipment_id}`,
      });
      
      onUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    multiple: false,
  });

  return (
    <Card variant="hover" className="p-8">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isUploading ? 'Uploading document...' : 'Upload Shipping Document'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag and drop a PDF or image file here, or click to select'
              }
            </p>
          </div>
          
          {!isUploading && (
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Select File
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DocumentUpload;