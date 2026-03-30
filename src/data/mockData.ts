// Mock data for the EdTech Document Analyzer

export interface Document {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  pages: number;
  summary?: string;
  conceptCount?: number;
  bloomLevel?: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'analysis' | 'qa';
  title: string;
  documentId?: string;
  timestamp: string;
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  relatedConcepts: string[];
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface BloomItem {
  level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  concepts: string[];
  questions: string[];
  percentage: number;
}

export interface Insight {
  id: string;
  type: 'strength' | 'weakness' | 'recommendation';
  title: string;
  description: string;
  bloomLevel?: string;
}

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Introduction to Quantum Mechanics',
    fileName: 'quantum_mechanics_ch1.pdf',
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'ready',
    pages: 42,
    summary: 'This chapter introduces the fundamental principles of quantum mechanics...',
    conceptCount: 24,
    bloomLevel: 'Analyze',
  },
  {
    id: '2',
    title: 'Organic Chemistry: Reactions',
    fileName: 'organic_chem_reactions.pdf',
    uploadedAt: '2024-01-14T14:20:00Z',
    status: 'ready',
    pages: 38,
    summary: 'An overview of common organic chemistry reactions and mechanisms...',
    conceptCount: 31,
    bloomLevel: 'Apply',
  },
  {
    id: '3',
    title: 'Machine Learning Fundamentals',
    fileName: 'ml_fundamentals.pdf',
    uploadedAt: '2024-01-13T09:15:00Z',
    status: 'processing',
    pages: 56,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'analysis',
    title: 'Completed analysis of "Introduction to Quantum Mechanics"',
    documentId: '1',
    timestamp: '2024-01-15T10:45:00Z',
  },
  {
    id: '2',
    type: 'qa',
    title: 'Asked 5 questions about quantum superposition',
    documentId: '1',
    timestamp: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    type: 'upload',
    title: 'Uploaded "Organic Chemistry: Reactions"',
    documentId: '2',
    timestamp: '2024-01-14T14:20:00Z',
  },
];

export const mockConcepts: Concept[] = [
  {
    id: '1',
    name: 'Wave-Particle Duality',
    description: 'The concept that quantum entities exhibit properties of both waves and particles.',
    relatedConcepts: ['Superposition', 'Quantum State'],
    bloomLevel: 'understand',
  },
  {
    id: '2',
    name: 'Superposition',
    description: 'A quantum system can exist in multiple states simultaneously until measured.',
    relatedConcepts: ['Wave-Particle Duality', 'Measurement Problem'],
    bloomLevel: 'analyze',
  },
  {
    id: '3',
    name: 'Quantum Entanglement',
    description: 'Particles become correlated such that the state of one instantly influences the other.',
    relatedConcepts: ['Superposition', 'Quantum State'],
    bloomLevel: 'evaluate',
  },
  {
    id: '4',
    name: 'Heisenberg Uncertainty Principle',
    description: 'It is impossible to simultaneously know both the position and momentum of a particle with precision.',
    relatedConcepts: ['Wave-Particle Duality', 'Measurement Problem'],
    bloomLevel: 'apply',
  },
];

export const mockBloomData: BloomItem[] = [
  {
    level: 'remember',
    concepts: ['Quantum State', 'Planck Constant'],
    questions: ['What is the value of Planck\'s constant?', 'List the postulates of quantum mechanics.'],
    percentage: 15,
  },
  {
    level: 'understand',
    concepts: ['Wave-Particle Duality', 'Energy Quantization'],
    questions: ['Explain wave-particle duality in your own words.', 'Why is energy quantized in atoms?'],
    percentage: 20,
  },
  {
    level: 'apply',
    concepts: ['Heisenberg Uncertainty Principle', 'Schrödinger Equation'],
    questions: ['Calculate the uncertainty in position given momentum uncertainty.', 'Apply the Schrödinger equation to a particle in a box.'],
    percentage: 25,
  },
  {
    level: 'analyze',
    concepts: ['Superposition', 'Quantum Measurement'],
    questions: ['Compare classical and quantum measurement.', 'Analyze the implications of superposition.'],
    percentage: 20,
  },
  {
    level: 'evaluate',
    concepts: ['Quantum Entanglement', 'Copenhagen Interpretation'],
    questions: ['Evaluate the strengths of the Copenhagen interpretation.', 'Critique Einstein\'s objections to quantum mechanics.'],
    percentage: 12,
  },
  {
    level: 'create',
    concepts: ['Quantum Computing', 'Quantum Algorithms'],
    questions: ['Design a simple quantum algorithm.', 'Propose an experiment to demonstrate entanglement.'],
    percentage: 8,
  },
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'strength',
    title: 'Strong conceptual understanding',
    description: 'You demonstrate excellent grasp of fundamental quantum principles.',
    bloomLevel: 'Understand',
  },
  {
    id: '2',
    type: 'weakness',
    title: 'Mathematical application needs work',
    description: 'Practice more problems involving the Schrödinger equation.',
    bloomLevel: 'Apply',
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Ready for advanced topics',
    description: 'Consider exploring quantum entanglement and its applications.',
    bloomLevel: 'Evaluate',
  },
];

export const mockQAHistory = [
  {
    id: '1',
    question: 'What is quantum superposition?',
    answer: 'Quantum superposition is a fundamental principle of quantum mechanics that holds that a physical system—such as an electron—exists partly in all its particular, theoretically possible states simultaneously. However, when measured, it gives a result corresponding to only one of the possible configurations.',
    sources: ['Page 12, Section 2.3', 'Page 15, Figure 2.1'],
  },
  {
    id: '2',
    question: 'How does the uncertainty principle affect measurements?',
    answer: 'The Heisenberg Uncertainty Principle states that there is a fundamental limit to the precision with which certain pairs of physical properties can be simultaneously known. The more precisely one property is measured, the less precisely the other can be controlled, determined, or known.',
    sources: ['Page 23, Section 3.1', 'Page 25, Example 3.2'],
  },
];

export const mockSummary = {
  brief: 'This chapter covers the foundational concepts of quantum mechanics, including wave-particle duality, superposition, and the uncertainty principle.',
  detailed: `Chapter 1: Introduction to Quantum Mechanics

**Overview**
This chapter provides a comprehensive introduction to the fundamental principles of quantum mechanics. It begins with the historical context of the quantum revolution and progresses through the key concepts that form the foundation of modern quantum theory.

**Key Topics Covered:**

1. **Historical Development**
   - The ultraviolet catastrophe and black-body radiation
   - Planck's quantum hypothesis
   - Einstein's photoelectric effect explanation

2. **Wave-Particle Duality**
   - de Broglie's matter waves
   - Double-slit experiment
   - Complementarity principle

3. **Quantum State and Superposition**
   - State vectors and Hilbert space
   - Linear combinations of states
   - Probability amplitudes

4. **The Uncertainty Principle**
   - Heisenberg's formulation
   - Position-momentum uncertainty
   - Energy-time uncertainty

5. **Measurement in Quantum Mechanics**
   - The measurement problem
   - Wave function collapse
   - Interpretations of quantum mechanics`,
  examNotes: `**EXAM PREPARATION NOTES**

⭐ Key Formulas:
- Planck's relation: E = hν
- de Broglie wavelength: λ = h/p
- Uncertainty principle: ΔxΔp ≥ ℏ/2

📝 Important Concepts to Remember:
1. Wave-particle duality applies to ALL matter
2. Superposition allows simultaneous states
3. Measurement causes wave function collapse

🎯 Common Exam Questions:
- Explain the photoelectric effect
- Calculate de Broglie wavelength for electrons
- Derive uncertainty relations`,
};
