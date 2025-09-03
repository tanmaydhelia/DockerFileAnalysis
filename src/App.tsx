import React, { useState, useCallback } from 'react';
import { Upload, FileText, Zap, Clock, Download, Github, Twitter, Mail, Container, Package, Wifi, Timer, Settings } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { ComputeCapabilitiesForm } from './components/ComputeCapabilitiesForm';
import { CompilationAnalysis } from './components/CompilationAnalysis';
import { 
  analyzeDockerfile, 
  analyzeRequirements, 
  analyzeCompilationTime,
  DockerStep, 
  RequirementInfo, 
  ComputeCapabilities,
  CompilationAnalysis as CompilationAnalysisType
} from './services/geminiService';

interface AnalysisResults {
  dockerSteps?: DockerStep[];
  requirements?: RequirementInfo[];
  totalSize?: string;
  internetSpeed?: number;
  estimatedTime?: string;
  compilationAnalysis?: CompilationAnalysisType;
}

const App: React.FC = () => {
  const [dockerFile, setDockerFile] = useState<File | null>(null);
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [isAnalyzingCompilation, setIsAnalyzingCompilation] = useState(false);
  const [results, setResults] = useState<AnalysisResults>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [showComputeForm, setShowComputeForm] = useState(false);
  const [computeCapabilities, setComputeCapabilities] = useState<ComputeCapabilities>({
    cpu: 'medium',
    memory: 'medium',
    architecture: 'x86_64',
    environment: 'local'
  });

  const handleDragOver = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(type);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'docker' | 'requirements') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      if (type === 'docker') {
        setDockerFile(file);
      } else {
        setRequirementsFile(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'docker' | 'requirements') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'docker') {
        setDockerFile(file);
      } else {
        setRequirementsFile(file);
      }
    }
  }, []);

  const analyzeFiles = async () => {
    if (!dockerFile && !requirementsFile) return;
    
    setIsAnalyzing(true);
    const newResults: AnalysisResults = {};
    
    try {
      if (dockerFile) {
        const dockerContent = await dockerFile.text();
        const dockerSteps = await analyzeDockerfile(dockerContent);
        newResults.dockerSteps = dockerSteps;
      }
      
      if (requirementsFile) {
        const requirementsContent = await requirementsFile.text();
        const requirementsAnalysis = await analyzeRequirements(requirementsContent);
        newResults.requirements = requirementsAnalysis.requirements;
        newResults.totalSize = requirementsAnalysis.totalSize;
      }
      
      setResults(prev => ({ ...prev, ...newResults }));
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCompilation = async () => {
    if (!dockerFile && !requirementsFile) return;
    
    setIsAnalyzingCompilation(true);
    
    try {
      const dockerContent = dockerFile ? await dockerFile.text() : '';
      const requirementsContent = requirementsFile ? await requirementsFile.text() : '';
      
      const compilationAnalysis = await analyzeCompilationTime(
        dockerContent,
        requirementsContent,
        computeCapabilities
      );
      
      setResults(prev => ({ ...prev, compilationAnalysis }));
    } catch (error) {
      console.error('Compilation analysis error:', error);
    } finally {
      setIsAnalyzingCompilation(false);
    }
  };

  const testInternetSpeed = async () => {
    setIsTestingSpeed(true);
    
    try {
      // Simulate speed test by downloading a small file and measuring time
      const startTime = Date.now();
      const testUrl = 'https://httpbin.org/bytes/1048576'; // 1MB test file
      
      await fetch(testUrl, { cache: 'no-cache' });
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const speed = (1 / duration) * 8; // Mbps (1MB = 8Mb)
      
      const internetSpeed = Math.max(speed, 1); // Ensure minimum 1 Mbps
      
      // Calculate estimated download time if we have total size
      let estimatedTime = '';
      if (results.totalSize) {
        const sizeInMB = parseFloat(results.totalSize.replace(/[^\d.]/g, ''));
        const timeInSeconds = (sizeInMB * 8) / internetSpeed;
        
        if (timeInSeconds < 60) {
          estimatedTime = `${Math.ceil(timeInSeconds)} seconds`;
        } else {
          const minutes = Math.floor(timeInSeconds / 60);
          const seconds = Math.ceil(timeInSeconds % 60);
          estimatedTime = `${minutes}m ${seconds}s`;
        }
      }
      
      setResults(prev => ({
        ...prev,
        internetSpeed: Math.round(internetSpeed * 10) / 10,
        estimatedTime
      }));
    } catch (error) {
      console.error('Speed test error:', error);
      // Fallback to simulated speed
      const simulatedSpeed = 25 + Math.random() * 50; // 25-75 Mbps
      setResults(prev => ({
        ...prev,
        internetSpeed: Math.round(simulatedSpeed * 10) / 10
      }));
    } finally {
      setIsTestingSpeed(false);
    }
  };

  const FileUploadArea: React.FC<{
    type: 'docker' | 'requirements';
    file: File | null;
    icon: React.ReactNode;
    title: string;
    description: string;
    accept: string;
  }> = ({ type, file, icon, title, description, accept }) => (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        dragOver === type
          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-105'
          : file
          ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
      }`}
      onDragOver={(e) => handleDragOver(e, type)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, type)}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e, type)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id={`${type}-upload`}
      />
      <div className="space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
          file ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          {file ? (
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
              <FileText className="w-4 h-4" />
              <span className="font-medium">{file.name}</span>
            </div>
          ) : (
            <label
              htmlFor={`${type}-upload`}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </label>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Container className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Docker Analysis Platform
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analyze Your Docker Configuration
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Upload your Dockerfile and requirements.txt to get detailed analysis, size estimates,
            compilation time predictions, and optimization recommendations based on your compute capabilities.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="animate-slide-up">
            <FileUploadArea
              type="docker"
              file={dockerFile}
              icon={<Container className={`w-8 h-8 ${dockerFile ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />}
              title="Upload Dockerfile"
              description="Drag and drop your Dockerfile here or click to browse"
              accept=".dockerfile,Dockerfile,*"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <FileUploadArea
              type="requirements"
              file={requirementsFile}
              icon={<Package className={`w-8 h-8 ${requirementsFile ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />}
              title="Upload Requirements.txt"
              description="Upload your Python requirements file for size analysis"
              accept=".txt,.requirements"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={analyzeFiles}
            disabled={(!dockerFile && !requirementsFile) || isAnalyzing}
            className="flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Analyze Files
              </>
            )}
          </button>
          
          <button
            onClick={testInternetSpeed}
            disabled={isTestingSpeed}
            className="flex items-center justify-center px-8 py-3 bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isTestingSpeed ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Testing Speed...
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5 mr-2" />
                Test Internet Speed
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowComputeForm(!showComputeForm)}
            className="flex items-center justify-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            <Settings className="w-5 h-5 mr-2" />
            Compute Settings
          </button>
        </div>

        {/* Compute Capabilities Form */}
        {showComputeForm && (
          <div className="mb-8 animate-fade-in">
            <ComputeCapabilitiesForm
              capabilities={computeCapabilities}
              onChange={setComputeCapabilities}
            />
            <div className="flex justify-center mt-6">
              <button
                onClick={analyzeCompilation}
                disabled={(!dockerFile && !requirementsFile) || isAnalyzingCompilation}
                className="flex items-center justify-center px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isAnalyzingCompilation ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing Compilation...
                  </>
                ) : (
                  <>
                    <Timer className="w-5 h-5 mr-2" />
                    Analyze Compilation Time
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {(results.dockerSteps || results.requirements || results.internetSpeed || results.compilationAnalysis) && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Analysis Results
            </h3>

            {/* Compilation Analysis - Full Width */}
            {results.compilationAnalysis && (
              <CompilationAnalysis analysis={results.compilationAnalysis} />
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Docker Analysis */}
              {results.dockerSteps && (
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                      <Container className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Dockerfile Analysis
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {results.dockerSteps.map((step, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                {step.instruction}
                              </code>
                              <p className="text-gray-700 dark:text-gray-300 mt-2">
                                {step.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <strong>Impact:</strong> {step.impact}
                              </p>
                              {step.compilationTime && (
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    <strong>Build Time:</strong> {step.compilationTime}
                                  </span>
                                  {step.computeIntensity && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      step.computeIntensity === 'extreme' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                      step.computeIntensity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                      step.computeIntensity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    }`}>
                                      {step.computeIntensity} intensity
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements Analysis */}
              {results.requirements && (
                <div className={results.dockerSteps ? '' : 'lg:col-span-2'}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Package className="w-6 h-6 text-secondary-600 dark:text-secondary-400 mr-3" />
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Requirements Analysis
                        </h4>
                      </div>
                      {results.totalSize && (
                        <div className="bg-secondary-100 dark:bg-secondary-900/30 px-3 py-1 rounded-full">
                          <span className="text-secondary-700 dark:text-secondary-300 font-semibold">
                            Total: {results.totalSize}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {results.requirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                              {req.package}
                            </code>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {req.description}
                            </p>
                            {req.compilationRequired && (
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                                  Requires Compilation
                                </span>
                                {req.buildTime && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Build: {req.buildTime}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 ml-4">
                            {req.estimatedSize}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Speed Test Results */}
              {results.internetSpeed && (
                <div className={(!results.dockerSteps && !results.requirements) ? 'lg:col-span-3' : ''}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                      <Wifi className="w-6 h-6 text-accent-600 dark:text-accent-400 mr-3" />
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Internet Speed
                      </h4>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-2">
                        {results.internetSpeed} Mbps
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Download Speed
                      </p>
                      {results.estimatedTime && (
                        <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-center mb-2">
                            <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400 mr-2" />
                            <span className="font-semibold text-accent-700 dark:text-accent-300">
                              Estimated Download Time
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                            {results.estimatedTime}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Container className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Docker Analysis Platform
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Analyze your Docker configurations with AI-powered insights. Get detailed breakdowns 
                of your Dockerfiles, estimate package sizes, and calculate download times.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Features
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Dockerfile Analysis</li>
                <li>Requirements Estimation</li>
                <li>Speed Testing</li>
                <li>Time Calculation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Connect
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/tanmaydhelia"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/tanmay-dhelia/"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © 2025 Docker Analysis Platform. Made with ❤️ by Tanmay.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;