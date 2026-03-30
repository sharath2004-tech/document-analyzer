import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  MessageSquare, 
  Network, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Target,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Smart Summaries',
    description: 'Get multi-level summaries from brief overviews to detailed exam notes, tailored to your learning needs.',
  },
  {
    icon: MessageSquare,
    title: 'Interactive Q&A',
    description: 'Ask questions about your documents and receive context-grounded answers with source citations.',
  },
  {
    icon: Target,
    title: "Bloom's Taxonomy",
    description: 'Visualize concepts mapped to cognitive levels, from remembering to creating.',
  },
  {
    icon: Network,
    title: 'Concept Mapping',
    description: 'Discover key concepts and their relationships with interactive dependency visualization.',
  },
  {
    icon: Brain,
    title: 'Learning Insights',
    description: 'Get personalized recommendations based on your strengths and areas for improvement.',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    description: 'Upload any educational document and get comprehensive analysis in seconds.',
  },
];

const benefits = [
  'Understand complex topics faster',
  'Prepare effectively for exams',
  'Identify knowledge gaps',
  'Track learning progress',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                AI-Powered Document Analysis
              </span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
              Transform Documents into{' '}
              <span className="gradient-text">Deep Understanding</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              Upload any educational content and unlock intelligent summaries, 
              interactive Q&A, concept maps, and personalized learning insights.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Start Learning Smarter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/login">
                  Try Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                <span className="text-sm">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <span className="text-sm">500K+ Documents Analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed specifically for educational content understanding
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-elevated transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Learn Smarter, Not Harder
              </h2>
              <p className="text-muted-foreground mb-8">
                DocuMind uses advanced AI to break down complex educational materials 
                into digestible insights, helping you master any subject efficiently.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button variant="accent" size="lg" className="mt-8" asChild>
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-hero p-8 flex items-center justify-center animate-float">
                <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-6 shadow-float w-full max-w-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-accent flex items-center justify-center">
                      <Brain className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Analysis Complete</p>
                      <p className="text-sm text-muted-foreground">Chapter 5: Quantum Physics</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Key Concepts</span>
                      <span className="font-medium text-foreground">24 found</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bloom's Level</span>
                      <span className="font-medium text-accent">Analyze</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Study Time</span>
                      <span className="font-medium text-foreground">~45 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators who are already using DocuMind 
            to unlock deeper understanding from their educational materials.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl" 
              className="bg-background text-foreground hover:bg-background/90 shadow-float"
              asChild
            >
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-serif text-lg font-semibold">DocuMind</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 DocuMind. Empowering learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
