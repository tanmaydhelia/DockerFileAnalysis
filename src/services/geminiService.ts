import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface DockerStep {
  instruction: string;
  description: string;
  impact: string;
  compilationTime?: string;
  computeIntensity?: 'low' | 'medium' | 'high' | 'extreme';
}

export interface RequirementInfo {
  package: string;
  estimatedSize: string;
  description: string;
  compilationRequired?: boolean;
  buildTime?: string;
}

export interface ComputeCapabilities {
  cpu: 'low' | 'medium' | 'high' | 'extreme';
  memory: 'low' | 'medium' | 'high' | 'extreme';
  architecture: 'x86_64' | 'arm64' | 'multi';
  environment: 'local' | 'ci_cd' | 'cloud';
}

export interface CompilationAnalysis {
  totalEstimatedTime: string;
  bottlenecks: string[];
  recommendations: string[];
  parallelizable: boolean;
}
function extractJSON(text: string): string | null {
  const match = text.match(/```json([\s\S]*?)```/); // Looks for a JSON block in Markdown
  if (match) return match[1].trim();
  // Fallback: try to find first { ... } block
  const curlyMatch = text.match(/{[\s\S]*}/);
  return curlyMatch ? curlyMatch[0] : null;
}

export const analyzeDockerfile = async (dockerfileContent: string): Promise<DockerStep[]> => {
  if (!genAI) {
    return getFallbackDockerAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
    Analyze this Dockerfile with focus on compilation times and compute requirements:
    ${dockerfileContent}
    
    For each instruction, analyze:
    1. The exact instruction
    2. A clear description of what it does
    3. The impact on image size or build time
    4. Estimated compilation time (if applicable)
    5. Compute intensity level (low/medium/high/extreme)
    
    Pay special attention to:
    - Native compilation steps (gcc, make, cargo build, etc.)
    - Multi-stage builds and their complexity
    - Package installations that require compilation
    - Architecture-specific builds
    - Parallel build opportunities
    
    Return as JSON array with objects containing: instruction, description, impact, compilationTime, computeIntensity
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text) || text;
    try {
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : getFallbackDockerAnalysis();
    } catch {
      return getFallbackDockerAnalysis();
    }
  } catch (error) {
    console.error('Error analyzing Dockerfile with Gemini:', error);
    return getFallbackDockerAnalysis();
  }
};

export const analyzeRequirements = async (requirementsContent: string): Promise<{ requirements: RequirementInfo[], totalSize: string }> => {
  if (!genAI) {
    return getFallbackRequirementsAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
    Analyze this requirements.txt file focusing on compilation requirements and build times:
    ${requirementsContent}
    
    For each package, analyze:
    1. The package name with version
    2. Estimated download size
    3. Brief description of what the package does
    4. Whether compilation from source is required
    5. Estimated build time if compilation is needed
    
    Consider packages that commonly require compilation:
    - NumPy, SciPy, Pandas (C extensions)
    - Pillow (image processing)
    - lxml (XML processing)
    - Cryptography libraries
    - Machine learning libraries (TensorFlow, PyTorch)
    
    Return as JSON: { requirements: [{ package, estimatedSize, description, compilationRequired, buildTime }], totalSize: "XX.X MB" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text) || text;
    try {
      const parsed = JSON.parse(jsonText);
      return parsed.requirements && parsed.totalSize ? parsed : getFallbackRequirementsAnalysis();
    } catch {
      return getFallbackRequirementsAnalysis();
    }
  } catch (error) {
    console.error('Error analyzing requirements with Gemini:', error);
    return getFallbackRequirementsAnalysis(); 
  }
};

export const analyzeCompilationTime = async (
  dockerfileContent: string, 
  requirementsContent: string, 
  computeCapabilities: ComputeCapabilities
): Promise<CompilationAnalysis> => {
  if (!genAI) {
    return getFallbackCompilationAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
    Analyze the compilation time for this Docker build considering the compute capabilities:
    
    DOCKERFILE:
    ${dockerfileContent}
    
    REQUIREMENTS:
    ${requirementsContent}
    
    COMPUTE CAPABILITIES:
    - CPU: ${computeCapabilities.cpu}
    - Memory: ${computeCapabilities.memory}
    - Architecture: ${computeCapabilities.architecture}
    - Environment: ${computeCapabilities.environment}
    
    Provide analysis including:
    1. Total estimated compilation time
    2. Main bottlenecks that slow down the build
    3. Optimization recommendations
    4. Whether steps can be parallelized
    
    Consider:
    - Multi-architecture builds take 2-5x longer
    - CI/CD environments often have limited CPU/memory
    - Native compilation vs pre-built wheels
    - Docker layer caching opportunities
    - Build context size impact
    
    Return as JSON: { totalEstimatedTime, bottlenecks: [], recommendations: [], parallelizable: boolean }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text) || text;
    try {
      const parsed = JSON.parse(jsonText);
      return parsed.totalEstimatedTime ? parsed : getFallbackCompilationAnalysis();
    } catch {
      return getFallbackCompilationAnalysis();
    }
  } catch (error) {
    console.error('Error analyzing compilation time:', error);
    return getFallbackCompilationAnalysis();
  }
};

// Fallback functions for demo purposes
const getFallbackDockerAnalysis = (): DockerStep[] => [
  {
    instruction: 'FROM python:3.9-slim',
    description: 'Sets the base image to Python 3.9 slim version',
    impact: 'Downloads ~45MB base image',
    compilationTime: '30s',
    computeIntensity: 'low'
  },
  {
    instruction: 'WORKDIR /app',
    description: 'Creates and sets working directory to /app',
    impact: 'Minimal impact, creates directory structure',
    compilationTime: '<1s',
    computeIntensity: 'low'
  },
  {
    instruction: 'COPY requirements.txt .',
    description: 'Copies requirements file to container',
    impact: 'Small file copy, ~1KB typically',
    compilationTime: '<1s',
    computeIntensity: 'low'
  },
  {
    instruction: 'RUN pip install -r requirements.txt',
    description: 'Installs Python dependencies',
    impact: 'Variable impact based on requirements',
    compilationTime: '5-15m',
    computeIntensity: 'high'
  },
  {
    instruction: 'COPY . .',
    description: 'Copies application source code',
    impact: 'Depends on application size',
    compilationTime: '10s',
    computeIntensity: 'low'
  },
  {
    instruction: 'EXPOSE 8000',
    description: 'Exposes port 8000 for the application',
    impact: 'No storage impact, configures networking',
    compilationTime: '<1s',
    computeIntensity: 'low'
  },
  {
    instruction: 'CMD ["python", "app.py"]',
    description: 'Sets the default command to run the application',
    impact: 'No additional impact, sets runtime behavior',
    compilationTime: '<1s',
    computeIntensity: 'low'
  }
];

const getFallbackRequirementsAnalysis = () => ({
  requirements: [
    {
      package: 'flask==2.3.3',
      estimatedSize: '2.1 MB',
      description: 'Web framework for Python applications',
      compilationRequired: false,
      buildTime: 'N/A'
    },
    {
      package: 'numpy==1.24.3',
      estimatedSize: '15.8 MB',
      description: 'Scientific computing library',
      compilationRequired: true,
      buildTime: '3-8m'
    },
    {
      package: 'pandas==2.0.3',
      estimatedSize: '28.4 MB',
      description: 'Data manipulation and analysis library',
      compilationRequired: true,
      buildTime: '5-12m'
    },
    {
      package: 'requests==2.31.0',
      estimatedSize: '1.5 MB',
      description: 'HTTP library for API requests',
      compilationRequired: false,
      buildTime: 'N/A'
    },
    {
      package: 'sqlalchemy==2.0.20',
      estimatedSize: '3.2 MB',
      description: 'Database toolkit and ORM',
      compilationRequired: false,
      buildTime: 'N/A'
    }
  ],
  totalSize: '51.0 MB'
});

const getFallbackCompilationAnalysis = (): CompilationAnalysis => ({
  totalEstimatedTime: '8-15 minutes',
  bottlenecks: [
    'NumPy compilation from source (3-8 minutes)',
    'Pandas native extensions (5-12 minutes)',
    'Single-threaded pip install process',
    'No build cache utilization'
  ],
  recommendations: [
    'Use multi-stage builds to cache compilation steps',
    'Consider using pre-built wheels when available',
    'Implement Docker layer caching in CI/CD',
    'Use BuildKit for parallel builds',
    'Pin exact versions to improve cache hits'
  ],
  parallelizable: true
});