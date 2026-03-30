import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import {
    AlertCircle,
    ArrowRight,
    Brain,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    MessageSquare,
    Plus,
    Upload
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const statusConfig = {
  ready: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', animate: false },
  processing: { icon: Loader2, color: 'text-info', bg: 'bg-info/10', animate: true },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', animate: false },
};

const activityIcons = {
  upload: Upload,
  analysis: Brain,
  qa: MessageSquare,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listDocuments()
      .then((resp) => setDocuments(resp.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 animate-slide-up">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'teacher' 
                ? 'Manage your educational content and track student progress.'
                : 'Continue your learning journey with AI-powered document analysis.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Documents Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Your Documents
                </h2>
                <Button variant="accent" size="sm" asChild>
                  <Link to="/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
                  </div>
                )}
                {!loading && documents.map((doc, index) => {
                  const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.processing;
                  const StatusIcon = status.icon;
                  
                  return (
                    <Link
                      key={doc.id}
                      to={doc.status === 'ready' ? `/analyze/${doc.id}` : '#'}
                      className={`group p-5 rounded-xl bg-card border border-border hover:border-accent/30 hover:shadow-elevated transition-all duration-300 ${
                        doc.status !== 'ready' ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="h-6 w-6 text-accent-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                                {doc.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {doc.file_name} • {doc.pages} pages
                              </p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
                              <StatusIcon className={`h-3.5 w-3.5 ${status.color} ${status.animate ? 'animate-spin' : ''}`} />
                              <span className={`text-xs font-medium ${status.color} capitalize`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>
                          
                          {doc.status === 'ready' && (
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              {doc.concept_count != null && (
                                <span className="text-muted-foreground">
                                  {doc.concept_count} concepts
                                </span>
                              )}
                              {doc.bloom_level && (
                                <span className="text-accent font-medium capitalize">
                                  {doc.bloom_level} level
                                </span>
                              )}
                              <span className="ml-auto text-muted-foreground flex items-center gap-1 group-hover:text-accent transition-colors">
                                View Analysis
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {!loading && documents.length === 0 && (
                <div className="text-center py-12 rounded-xl bg-card border border-dashed border-border">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first document to get started
                  </p>
                  <Button variant="accent" asChild>
                    <Link to="/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Recent Activity
              </h2>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="space-y-4">
                  {documents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activity yet. Upload a document to get started.
                    </p>
                  )}
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">
                          {doc.status === 'ready' ? 'Analyzed' : doc.status === 'processing' ? 'Processing' : 'Uploaded'} "{doc.title}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-medium text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="font-medium text-foreground">{documents.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concepts Learned</span>
                    <span className="font-medium text-foreground">
                      {documents.reduce((sum, d) => sum + (d.concept_count ?? 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pages Analyzed</span>
                    <span className="font-medium text-foreground">
                      {documents.reduce((sum, d) => sum + (d.pages ?? 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ready Documents</span>
                    <span className="font-medium text-foreground">
                      {documents.filter(d => d.status === 'ready').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
