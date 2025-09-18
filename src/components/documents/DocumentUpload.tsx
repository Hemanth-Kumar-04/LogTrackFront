import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { documentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<null | { success: boolean; message?: string; document?: any }>(null);

  // Helpers to parse/clean Cardinal raw responses (same logic as DocumentDetails)
  const formatExtractedText = (doc: any) => {
    if (!doc) return 'No extracted text available';
    const raw = doc.rawResponse || doc.raw || null;
    if (!raw) return 'No extracted text available';

    const candidate = raw.response ?? raw;
    if (!candidate) return JSON.stringify(raw, null, 2);

    if (typeof candidate === 'string') {
      const cleaned = candidate
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      try {
        return JSON.stringify(JSON.parse(cleaned), null, 2);
      } catch (e) {
        return cleaned;
      }
    }

    if (typeof candidate === 'object') return JSON.stringify(candidate, null, 2);
    return String(candidate);
  };

  const parseExtractedObject = (doc: any) => {
    if (!doc) return null;
    const raw = doc.rawResponse || doc.raw || null;
    if (!raw) return null;

    const candidate = raw.response ?? raw;
    if (!candidate) return null;

    if (typeof candidate === 'string') {
      const cleaned = candidate.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        return null;
      }
    }

    if (typeof candidate === 'object') return candidate;
    return null;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadResult(null);
      const response = await documentsAPI.upload(file);

      const message = response?.message || `Document uploaded successfully`;
      // show toast but also set inline result
      toast({ title: message, description: `Shipment ID: ${response.document?.shipment_id || 'N/A'}` });
      setUploadResult({ success: true, message, document: response.document });

      onUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      const msg = error.response?.data?.message || 'Failed to upload document';
      toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
      setUploadResult({ success: false, message: msg });
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
    <Card className="p-8">
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
      {uploadResult && (
        <div className={`mt-4 p-4 rounded ${uploadResult.success ? 'bg-muted/5' : 'bg-red-50'} text-foreground`}>
          <p className="font-medium">{uploadResult.success ? 'Upload result' : 'Upload error'}</p>
          <p className="text-sm text-foreground">{uploadResult.message}</p>

          {uploadResult.document && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Upload: {(uploadResult.document.shipment_id || '—')} <span className="text-foreground">— {uploadResult.document.filename}</span></CardTitle>
                </CardHeader>
                <CardContent className="text-foreground">
                  {
                    (() => {
                      const parsed = parseExtractedObject(uploadResult.document);
                      if (parsed && typeof parsed === 'object') {
                        const s: any = parsed;
                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Shipment ID</p>
                                <p className="font-medium text-foreground">{s.shipment_id || s.shipmentId || s.awb || 'N/A'}</p>

                                <p className="mt-3 text-sm text-muted-foreground">Sender</p>
                                <p className="font-medium text-foreground">{s.sender || 'N/A'}</p>

                                <p className="mt-3 text-sm text-muted-foreground">Receiver</p>
                                <p className="font-medium text-foreground">{s.receiver || 'N/A'}</p>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Origin</p>
                                <p className="font-medium text-foreground">{s.origin || 'N/A'}</p>

                                <p className="mt-3 text-sm text-muted-foreground">Destination</p>
                                <p className="font-medium text-foreground">{s.destination || 'N/A'}</p>

                                <p className="mt-3 text-sm text-muted-foreground">Weight</p>
                                <p className="font-medium text-foreground">{s.weight || 'N/A'}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">{s.date ? new Date(s.date).toLocaleString() : 'N/A'}</p>
                            </div>
                          </div>
                        );
                      }

                      // fallback to raw pretty text
                      return <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/5 p-4 rounded max-h-[40vh] overflow-auto">{formatExtractedText(uploadResult.document)}</pre>;
                    })()
                  }
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DocumentUpload;