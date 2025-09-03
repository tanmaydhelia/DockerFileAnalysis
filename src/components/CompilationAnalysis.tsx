import React from 'react';
import { Clock, AlertTriangle, Lightbulb, Zap, Timer } from 'lucide-react';
import { CompilationAnalysis as CompilationAnalysisType } from '../services/geminiService';

interface CompilationAnalysisProps {
  analysis: CompilationAnalysisType;
  className?: string;
}

export const CompilationAnalysis: React.FC<CompilationAnalysisProps> = ({
  analysis,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center mb-6">
        <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
          Compilation Time Analysis
        </h4>
      </div>

      {/* Total Time */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {analysis.totalEstimatedTime}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              Total Build Time
            </div>
          </div>
          {analysis.parallelizable && (
            <div className="ml-4 flex items-center text-green-600 dark:text-green-400">
              <Zap className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Parallelizable</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bottlenecks */}
        <div>
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h5 className="font-semibold text-gray-900 dark:text-white">
              Build Bottlenecks
            </h5>
          </div>
          <div className="space-y-2">
            {analysis.bottlenecks.map((bottleneck, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {bottleneck}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            <h5 className="font-semibold text-gray-900 dark:text-white">
              Optimization Tips
            </h5>
          </div>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {recommendation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};