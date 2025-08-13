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
}

export interface RequirementInfo {
  package: string;
  estimatedSize: string;
  description: string;
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
    Analyze this Dockerfile and provide a detailed breakdown of each instruction:
    ${dockerfileContent}
    For each instruction, provide:
    1. The exact instruction
    2. A clear description of what it does
    3. The impact on image size or build time
    Return the response as a JSON array with objects containing: instruction, description, impact
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
    Analyze this requirements.txt file and estimate the size of each package:
    ${requirementsContent}
    For each package, provide:
    1. The package name with version
    2. Estimated download size
    3. Brief description of what the package does
    Also calculate the total estimated size.
    Return as JSON with: { requirements: [{ package, estimatedSize, description }], totalSize: "XX.X MB" }
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

// Fallback functions for demo purposes
const getFallbackDockerAnalysis = (): DockerStep[] => [
  {
    instruction: 'FROM python:3.9-slim',
    description: 'Sets the base image to Python 3.9 slim version',
    impact: 'Downloads ~45MB base image'
  },
  {
    instruction: 'WORKDIR /app',
    description: 'Creates and sets working directory to /app',
    impact: 'Minimal impact, creates directory structure'
  },
  {
    instruction: 'COPY requirements.txt .',
    description: 'Copies requirements file to container',
    impact: 'Small file copy, ~1KB typically'
  },
  {
    instruction: 'RUN pip install -r requirements.txt',
    description: 'Installs Python dependencies',
    impact: 'Variable impact based on requirements'
  },
  {
    instruction: 'COPY . .',
    description: 'Copies application source code',
    impact: 'Depends on application size'
  },
  {
    instruction: 'EXPOSE 8000',
    description: 'Exposes port 8000 for the application',
    impact: 'No storage impact, configures networking'
  },
  {
    instruction: 'CMD ["python", "app.py"]',
    description: 'Sets the default command to run the application',
    impact: 'No additional impact, sets runtime behavior'
  }
];

const getFallbackRequirementsAnalysis = () => ({
  requirements: [
    {
      package: 'flask==2.3.3',
      estimatedSize: '2.1 MB',
      description: 'Web framework for Python applications'
    },
    {
      package: 'numpy==1.24.3',
      estimatedSize: '15.8 MB',
      description: 'Scientific computing library'
    },
    {
      package: 'pandas==2.0.3',
      estimatedSize: '28.4 MB',
      description: 'Data manipulation and analysis library'
    },
    {
      package: 'requests==2.31.0',
      estimatedSize: '1.5 MB',
      description: 'HTTP library for API requests'
    },
    {
      package: 'sqlalchemy==2.0.20',
      estimatedSize: '3.2 MB',
      description: 'Database toolkit and ORM'
    }
  ],
  totalSize: '51.0 MB'
});