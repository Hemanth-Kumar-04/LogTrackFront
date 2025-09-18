import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document } from '@/types/document';
import { 
  FileText, 
  MapPin, 
  Package, 
  Calendar, 
  User, 
  Users,
  Trash2,
  Weight
} from 'lucide-react';
import { documentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface DocumentCardProps {
  document: Document;
  onDelete: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const handleDelete = async () => {
    try {
      await documentsAPI.delete(document._id);
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted",
      });
      onDelete();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    // Mock status based on date - in real app this would come from API
    const docDate = new Date(document.date);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) return <Badge variant="outline" className="bg-info/10 text-info border-info/20">Processing</Badge>;
    if (daysDiff < 7) return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">In Transit</Badge>;
    return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Delivered</Badge>;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {document.shipment_id}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{document.filename}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Sender</p>
                <p className="text-muted-foreground">{document.sender}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Receiver</p>
                <p className="text-muted-foreground">{document.receiver}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Destination</p>
                <p className="text-muted-foreground">{document.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Weight</p>
                <p className="text-muted-foreground">{document.weight}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(document.date).toLocaleDateString()}</span>
          </div>
          
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;