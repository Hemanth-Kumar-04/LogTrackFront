import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentsList from '@/components/documents/DocumentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  TrendingUp, 
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await (await import('@/lib/api')).documentsAPI.getStats();
        if (!mounted) return;
        setStats(res.stats);
      } catch (e) {
    
        console.error('Failed to load stats', e);
      }
    };

    load();
    return () => { mounted = false; };
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your logistics documents and track shipments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats ? (
            [
              { title: 'Total Shipments', value: stats.total, desc: 'Total uploaded documents', icon: Package, color: 'bg-primary/10 text-primary' },
              { title: 'In Transit', value: stats.inTransit, desc: 'Recently updated shipments', icon: Truck, color: 'bg-warning/10 text-warning' },
              { title: 'Delivered', value: stats.delivered, desc: 'Older shipments', icon: CheckCircle, color: 'bg-success/10 text-success' },
              { title: 'Processing', value: stats.processing, desc: 'Recently added', icon: FileText, color: 'bg-info/10 text-info' },
            ].map((stat, index) => (
              <Card key={stat.title} className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </CardContent>
              </Card>
            ))
          ) : (
          
            [
              { title: 'Total Shipments', value: '—', desc: 'Loading…', icon: Package, color: 'bg-primary/10 text-primary' },
              { title: 'In Transit', value: '—', desc: 'Loading…', icon: Truck, color: 'bg-warning/10 text-warning' },
              { title: 'Delivered', value: '—', desc: 'Loading…', icon: CheckCircle, color: 'bg-success/10 text-success' },
              { title: 'Processing', value: '—', desc: 'Loading…', icon: FileText, color: 'bg-info/10 text-info' },
            ].map((stat, index) => (
              <Card key={stat.title} className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

   
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Documents</CardTitle>
                <CardDescription>
                  View and manage all uploaded shipping documents and track their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentsList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
                <CardDescription>
                  Upload shipping documents for automatic data extraction and processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;