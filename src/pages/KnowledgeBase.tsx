import { AppSidebar } from '@/components/layout/AppSidebar';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function KnowledgeBase() {
  return (
    <>
      <Helmet>
        <title>Knowledge Base - SupportHub</title>
        <meta name="description" content="Ihre Wissensdatenbank" />
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
              <h1 className="text-xl font-semibold text-foreground">Knowledge Base</h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md">
                  <CardHeader className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <CardTitle>Knowledge Base</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                    <p>Hier werden Ihre Wissensartikel angezeigt.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
