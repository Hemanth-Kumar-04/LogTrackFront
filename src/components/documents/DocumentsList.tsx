import React, { useState, useEffect } from 'react';
import { documentsAPI } from '@/lib/api';
import { Document } from '@/types/document';
import DocumentCard from './DocumentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Search, Package, Loader2 } from 'lucide-react';

interface DocumentsListProps {
  refreshTrigger: number;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentsAPI.getAll();
      setDocuments(response.documents || []);
      setFilteredDocuments(response.documents || []);
    } catch (error: any) {
      console.error('Fetch documents error:', error);
      toast({
        title: "Failed to load documents",
        description: error.response?.data?.message || "Could not fetch documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = documents.filter(doc =>
      doc.shipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  const handleDocumentDelete = () => {
    fetchDocuments();
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading documents...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by shipment ID, sender, receiver, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchDocuments}>
          Refresh
        </Button>
      </div>

      {filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {documents.length === 0 ? 'No documents uploaded' : 'No documents match your search'}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {documents.length === 0 
                  ? 'Get started by uploading your first shipping document.'
                  : 'Try adjusting your search terms to find what you\'re looking for.'
                }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={handleDocumentDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsList;