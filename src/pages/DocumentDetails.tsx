import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { documentsAPI } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Document } from '@/types/document';

const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await documentsAPI.getById(id);
        setDocument(res.document || res);
      } catch (err: any) {
        console.error('Failed to load document', err);
        toast({ title: 'Failed to load document', description: err?.response?.data?.message || 'Unable to fetch document', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [id]);

  // helper to format extracted text from the saved raw response
  const formatExtractedText = (doc: Document | null) => {
    if (!doc) return 'No extracted text available';
    const raw = (doc as any).rawResponse || (doc as any).raw || null;
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

  // attempt to parse extracted response into an object for a structured view
  const parseExtractedObject = (doc: Document | null) => {
    if (!doc) return null;
    const raw = (doc as any).rawResponse || (doc as any).raw || null;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading document...</p>
          </Card>
        </main>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Document not found.</p>
            <div className="mt-4">
              <Button onClick={() => navigate('/dashboard')}>Back</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Document Details</h1>
            <p className="text-muted-foreground">Details and extracted data for the uploaded document</p>
          </div>
          <div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Back</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: metadata */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{(document.shipment_id || (parseExtractedObject(document)?.shipment_id) || (parseExtractedObject(document)?.shipmentId) || '—')} <span className="text-muted-foreground">— {document.filename}</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {(() => {
                    const parsed = parseExtractedObject(document) as any;
                    const pick = (key: string, altKeys: string[] = []) => {
                      if ((document as any)[key]) return (document as any)[key];
                      if (parsed) {
                        for (const k of [key, ...altKeys]) {
                          if (parsed[k]) return parsed[k];
                        }
                      }
                      return null;
                    };

                    const formatAddress = (text: string | null) => {
                      if (!text) return '—';
                      // split on newlines or '  ' or comma sequences for nicer lines
                      const parts = String(text).split(/\n|,\s*|\s{2,}/).map(p => p.trim()).filter(Boolean);
                      return parts.map((p, i) => <div key={i}>{p}</div>);
                    };

                    const sender = pick('sender');
                    const receiver = pick('receiver');
                    const destination = pick('destination', ['dest', 'to']);
                    const weight = pick('weight');
                    const uploaded = (document as any).createdAt || (document as any).date || null;
                    const extractedDate = parsed?.date || null;

                    const formatDate = (d: string | number | null) => {
                      if (!d) return '—';
                      const dt = new Date(d);
                      if (isNaN(dt.getTime())) return String(d);
                      return dt.toLocaleString();
                    };

                    return (
                      <>
                        <div>
                          <p className="font-medium">Sender</p>
                          <p className="text-muted-foreground">{sender ? formatAddress(String(sender)) : '—'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Receiver</p>
                          <p className="text-muted-foreground">{receiver ? formatAddress(String(receiver)) : '—'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Destination</p>
                          <p className="text-muted-foreground">{destination ? formatAddress(String(destination)) : '—'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Weight</p>
                          <p className="text-muted-foreground">{weight || '—'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Uploaded</p>
                          <p className="text-muted-foreground">{formatDate(uploaded)}</p>
                        </div>
                        {extractedDate && (
                          <div>
                            <p className="font-medium">Extracted Date</p>
                            <p className="text-muted-foreground">{formatDate(extractedDate)}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: extracted text */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
              </CardHeader>
              <CardContent>
                {
                  (() => {
                    const parsed = parseExtractedObject(document);
                    if (parsed && typeof parsed === 'object') {
                      const s = parsed as any;
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Shipment ID</p>
                              <p className="font-medium">{s.shipment_id || s.shipmentId || s.awb || 'N/A'}</p>

                              <p className="mt-3 text-sm text-muted-foreground">Sender</p>
                              <p className="font-medium">{s.sender || 'N/A'}</p>

                              <p className="mt-3 text-sm text-muted-foreground">Receiver</p>
                              <p className="font-medium">{s.receiver || 'N/A'}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Origin</p>
                              <p className="font-medium">{s.origin || 'N/A'}</p>

                              <p className="mt-3 text-sm text-muted-foreground">Destination</p>
                              <p className="font-medium">{s.destination || 'N/A'}</p>

                              <p className="mt-3 text-sm text-muted-foreground">Weight</p>
                              <p className="font-medium">{s.weight || 'N/A'}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{s.date ? new Date(s.date).toLocaleString() : 'N/A'}</p>
                          </div>

                          {/* raw JSON removed to show only user-friendly fields */}
                        </div>
                      );
                    }

                    // fallback to raw pretty text
                    return <pre className="whitespace-pre-wrap text-sm bg-muted/5 p-4 rounded max-h-[60vh] overflow-auto">{formatExtractedText(document)}</pre>;
                  })()
                }
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetails;
