import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import {
    AlertTriangle,
    BookOpen,
    Brain,
    Check,
    ChevronDown,
    ChevronRight,
    Copy,
    Download,
    FileText,
    Lightbulb,
    Loader2,
    MessageSquare,
    Network,
    Send,
    Target,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const bloomColors = {
  remember: 'bg-bloom-remember',
  understand: 'bg-bloom-understand',
  apply: 'bg-bloom-apply',
  analyze: 'bg-bloom-analyze',
  evaluate: 'bg-bloom-evaluate',
  create: 'bg-bloom-create',
};

const bloomLabels = {
  remember: 'Remember',
  understand: 'Understand',
  apply: 'Apply',
  analyze: 'Analyze',
  evaluate: 'Evaluate',
  create: 'Create',
};

export default function Analyze() {
  const { documentId } = useParams();
  const [activeTab, setActiveTab] = useState('summary');
  const [question, setQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  // Real API state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [qaHistory, setQaHistory] = useState<any[]>([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [activeSummaryType, setActiveSummaryType] = useState<'brief' | 'detailed' | 'exam_notes'>('detailed');

  useEffect(() => {
    if (!documentId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [doc, fullAnalysis] = await Promise.all([
          api.getDocument(documentId),
          api.getFullAnalysis(documentId).catch(() => null),
        ]);
        setDocument(doc);
        if (fullAnalysis) {
          setAnalysis(fullAnalysis);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll if still processing
    const interval = setInterval(async () => {
      try {
        const doc = await api.getDocument(documentId);
        setDocument(doc);
        if (doc.status === 'ready' && !analysis) {
          const fullAnalysis = await api.getFullAnalysis(documentId);
          setAnalysis(fullAnalysis);
          clearInterval(interval);
        }
        if (doc.status === 'error') {
          clearInterval(interval);
        }
      } catch { /* keep polling */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [documentId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !documentId) return;
    setAskingQuestion(true);
    try {
      const result = await api.askQuestion(documentId, question);
      setQaHistory((prev) => [...prev, result]);
      setQuestion('');
    } catch (err: any) {
      setQaHistory((prev) => [...prev, { question, answer: `Error: ${err.message}`, sources: [] }]);
    } finally {
      setAskingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="pt-24 pb-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading document analysis...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="pt-24 pb-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error || 'Document not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const summaryData = analysis?.summary;
  const conceptsData = analysis?.concepts || [];
  const bloomData = analysis?.bloom_taxonomy || [];
  const insightsData = analysis?.insights || [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Document Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0">
                <FileText className="h-7 w-7 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                  {document.title}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {document.file_name} • {document.pages} pages {document.concept_count ? `• ${document.concept_count} concepts identified` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-card border border-border p-1 h-auto">
              <TabsTrigger value="summary" className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Q&A</span>
              </TabsTrigger>
              <TabsTrigger value="blooms" className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Bloom's</span>
              </TabsTrigger>
              <TabsTrigger value="concepts" className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Concepts</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6 animate-fade-in">
              {!summaryData ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Analysis in progress...</p>
                </div>
              ) : (
                <>
                  {/* Summary Type Selector */}
                  <div className="flex flex-wrap gap-3">
                    {(['brief', 'detailed', 'exam_notes'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={type === activeSummaryType ? 'accent' : 'outline'}
                        size="sm"
                        onClick={() => setActiveSummaryType(type)}
                      >
                        {type === 'brief' ? 'Brief' : type === 'detailed' ? 'Detailed' : 'Exam Notes'}
                      </Button>
                    ))}
                  </div>

                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg font-semibold text-foreground capitalize">
                        {activeSummaryType.replace('_', ' ')} Summary
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(summaryData[activeSummaryType], 'summary')}
                        >
                          {copiedId === 'summary' ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {summaryData[activeSummaryType]}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Q&A Tab */}
            <TabsContent value="qa" className="space-y-6 animate-fade-in">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Chat History */}
                <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                  {qaHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Ask a question about this document to get started.
                    </div>
                  )}
                  {qaHistory.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      {/* Question */}
                      <div className="flex justify-end">
                        <div className="bg-accent text-accent-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                          <p className="text-sm">{item.question}</p>
                        </div>
                      </div>
                      {/* Answer */}
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-foreground">{item.answer}</p>
                          {item.sources && item.sources.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.sources.map((source: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                                >
                                  📄 {source}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleAskQuestion} className="border-t border-border p-4">
                  <div className="flex gap-3">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about this document..."
                      className="flex-1"
                      disabled={askingQuestion}
                    />
                    <Button type="submit" variant="accent" disabled={!question.trim() || askingQuestion}>
                      {askingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* Bloom's Taxonomy Tab */}
            <TabsContent value="blooms" className="space-y-6 animate-fade-in">
              {bloomData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Bloom's taxonomy analysis in progress...</p>
                </div>
              ) : (
                <>
                  {/* Pyramid Visualization */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-6">
                      Bloom's Taxonomy Distribution
                    </h3>
                    <div className="flex flex-col items-center gap-2">
                      {[...bloomData].reverse().map((item: any, index: number) => {
                        const width = 40 + index * 10;
                        const level = item.level as keyof typeof bloomColors;
                        return (
                          <div
                            key={item.level}
                            className={`${bloomColors[level] || 'bg-gray-500'} text-white rounded-lg px-4 py-3 text-center transition-all hover:scale-105 cursor-pointer`}
                            style={{ width: `${width}%` }}
                          >
                            <p className="font-semibold text-sm">{bloomLabels[level] || item.level}</p>
                            <p className="text-xs opacity-90">{item.percentage}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {bloomData.map((item: any) => {
                      const level = item.level as keyof typeof bloomColors;
                      return (
                        <div key={item.level} className="bg-card rounded-xl border border-border p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`h-4 w-4 rounded-full ${bloomColors[level] || 'bg-gray-500'}`} />
                            <h4 className="font-semibold text-foreground capitalize">
                              {bloomLabels[level] || item.level}
                            </h4>
                            <span className="ml-auto text-sm text-muted-foreground">
                              {item.percentage}%
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Concepts:</p>
                              <div className="flex flex-wrap gap-1">
                                {(item.concepts || []).map((concept: string) => (
                                  <span
                                    key={concept}
                                    className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                                  >
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Sample Questions:</p>
                              <ul className="text-sm text-foreground space-y-1">
                                {(item.questions || []).slice(0, 1).map((q: string, i: number) => (
                                  <li key={i} className="text-xs">• {q}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Concepts Tab */}
            <TabsContent value="concepts" className="space-y-6 animate-fade-in">
              {conceptsData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Concept extraction in progress...</p>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border divide-y divide-border">
                  {conceptsData.map((concept: any) => {
                    const level = concept.bloom_level as keyof typeof bloomColors;
                    return (
                      <div key={concept.id} className="p-4">
                        <button
                          onClick={() => setExpandedConcept(expandedConcept === concept.id ? null : concept.id)}
                          className="w-full flex items-center gap-3 text-left"
                        >
                          <div className={`h-3 w-3 rounded-full ${bloomColors[level] || 'bg-gray-500'}`} />
                          <span className="font-medium text-foreground flex-1">{concept.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                            {concept.bloom_level}
                          </span>
                          {expandedConcept === concept.id ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        
                        {expandedConcept === concept.id && (
                          <div className="mt-4 pl-6 space-y-3 animate-fade-in">
                            <p className="text-sm text-muted-foreground">{concept.description}</p>
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Related Concepts:</p>
                              <div className="flex flex-wrap gap-2">
                                {(concept.related_concepts || []).map((related: string) => (
                                  <span
                                    key={related}
                                    className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
                                  >
                                    {related}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6 animate-fade-in">
              {insightsData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Generating insights...</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    {insightsData.map((insight: any) => {
                      const icons: Record<string, any> = {
                        strength: TrendingUp,
                        weakness: AlertTriangle,
                        recommendation: Lightbulb,
                      };
                      const colors: Record<string, string> = {
                        strength: 'text-success bg-success/10 border-success/20',
                        weakness: 'text-warning bg-warning/10 border-warning/20',
                        recommendation: 'text-info bg-info/10 border-info/20',
                      };
                      const Icon = icons[insight.type] || Lightbulb;
                      
                      return (
                        <div
                          key={insight.id}
                          className={`p-5 rounded-xl border ${colors[insight.type] || 'text-info bg-info/10 border-info/20'}`}
                        >
                          <Icon className="h-6 w-6 mb-3" />
                          <h4 className="font-semibold text-foreground mb-2">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          {insight.bloom_level && (
                            <p className="text-xs mt-3 text-muted-foreground">
                              Bloom's Level: {insight.bloom_level}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Learning Progress */}
                  {bloomData.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                        Bloom's Level Mastery
                      </h3>
                      <div className="space-y-4">
                        {bloomData.map((item: any) => {
                          const level = item.level as keyof typeof bloomColors;
                          return (
                            <div key={item.level} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize text-foreground">{bloomLabels[level] || item.level}</span>
                                <span className="text-muted-foreground">{item.percentage}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${bloomColors[level] || 'bg-gray-500'} transition-all duration-500`}
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
