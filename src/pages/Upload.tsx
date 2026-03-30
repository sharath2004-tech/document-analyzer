import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import {
    AlertCircle,
    CheckCircle2,
    CloudUpload,
    FileText,
    Loader2,
    X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  docId?: string;
}

interface ServerDocument {
  id: string;
  title: string;
  file_name: string;
  uploaded_at: string;
  status: 'processing' | 'ready' | 'error';
  pages: number;
  summary?: string;
  concept_count?: number;
  bloom_level?: string;
}

export default function Upload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [recentDocs, setRecentDocs] = useState<ServerDocument[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  // Fetch recent documents from backend
  useEffect(() => {
    api.listDocuments().then((resp) => {
      setRecentDocs(resp.documents || []);
    }).catch(() => {});
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const uploadFile = async (file: File) => {
    const id = Date.now().toString();
    const uploadedFile: UploadedFile = {
      id,
      file,
      status: 'uploading',
      progress: 0,
    };

    setFiles((prev) => [...prev, uploadedFile]);

    try {
      // Show progress animation
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: 50 } : f))
      );

      const result = await api.uploadDocument(file);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'processing', progress: 100, docId: result.id } : f
        )
      );

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const doc = await api.getDocument(result.id);
          if (doc.status === 'ready') {
            clearInterval(pollInterval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: 'complete' } : f
              )
            );
          } else if (doc.status === 'error') {
            clearInterval(pollInterval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: 'error', error: 'Processing failed' } : f
              )
            );
          }
        } catch {
          // Keep polling
        }
      }, 3000);

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'error', error: err.message || 'Upload failed' } : f
        )
      );
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain'
    );

    validFiles.forEach((file) => uploadFile(file));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach((file) => uploadFile(file));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const completedFiles = files.filter((f) => f.status === 'complete');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 animate-slide-up">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Upload Documents
            </h1>
            <p className="text-muted-foreground">
              Upload PDF, DOCX, or TXT files to analyze with AI
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative mb-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
              isDragOver
                ? 'border-accent bg-accent/5 scale-[1.02]'
                : 'border-border bg-card hover:border-accent/50'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-12 text-center">
              <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                isDragOver ? 'bg-accent scale-110' : 'bg-gradient-accent'
              }`}>
                <CloudUpload className={`h-8 w-8 ${isDragOver ? 'text-accent-foreground' : 'text-accent-foreground'}`} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse your computer
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, and TXT files up to 50MB
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {files.length > 0 && (
            <div className="mb-8 space-y-4 animate-fade-in">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Uploading ({files.length} files)
              </h2>
              {files.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <FileText className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {uploadedFile.status === 'uploading' && (
                        <div className="w-32">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-300"
                              style={{ width: `${uploadedFile.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(uploadedFile.progress)}%
                          </p>
                        </div>
                      )}
                      {uploadedFile.status === 'processing' && (
                        <div className="flex items-center gap-2 text-info">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      )}
                      {uploadedFile.status === 'complete' && (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm">Complete</span>
                        </div>
                      )}
                      {uploadedFile.status === 'error' && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {completedFiles.length > 0 && (
                <Button
                  variant="hero"
                  className="w-full mt-4"
                  onClick={() => {
                    const firstComplete = completedFiles[0];
                    if (firstComplete?.docId) {
                      navigate(`/analyze/${firstComplete.docId}`);
                    }
                  }}
                >
                  Analyze Documents
                </Button>
              )}
            </div>
          )}

          {/* Recent Uploads */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Recent Uploads
            </h2>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {recentDocs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No documents uploaded yet. Upload a PDF to get started.
                </div>
              )}
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => doc.status === 'ready' && navigate(`/analyze/${doc.id}`)}
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {doc.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doc.file_name} • {doc.pages} pages
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.status === 'processing' && (
                      <div className="flex items-center gap-2 text-info">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processing</span>
                      </div>
                    )}
                    {doc.status === 'ready' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                        Ready
                      </span>
                    )}
                    {doc.status === 'error' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                        Error
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
