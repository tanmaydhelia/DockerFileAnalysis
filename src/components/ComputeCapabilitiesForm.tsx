import React from 'react';
import { Cpu, HardDrive, Monitor, Cloud } from 'lucide-react';
import { ComputeCapabilities } from '../services/geminiService';

interface ComputeCapabilitiesFormProps {
  capabilities: ComputeCapabilities;
  onChange: (capabilities: ComputeCapabilities) => void;
  className?: string;
}

export const ComputeCapabilitiesForm: React.FC<ComputeCapabilitiesFormProps> = ({
  capabilities,
  onChange,
  className = ''
}) => {
  const updateCapability = <K extends keyof ComputeCapabilities>(
    key: K,
    value: ComputeCapabilities[K]
  ) => {
    onChange({ ...capabilities, [key]: value });
  };

  const CapabilitySelector: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: string;
    options: { value: string; label: string; description: string }[];
    onChange: (value: string) => void;
  }> = ({ label, icon, value, options, onChange }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {icon}
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 ${
              value === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{option.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {option.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center mb-6">
        <Monitor className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
          Compute Capabilities
        </h4>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <CapabilitySelector
          label="CPU Performance"
          icon={<Cpu className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
          value={capabilities.cpu}
          options={[
            { value: 'low', label: 'Low', description: '1-2 cores, <2GHz' },
            { value: 'medium', label: 'Medium', description: '4 cores, 2-3GHz' },
            { value: 'high', label: 'High', description: '8+ cores, 3GHz+' },
            { value: 'extreme', label: 'Extreme', description: '16+ cores, server-grade' }
          ]}
          onChange={(value) => updateCapability('cpu', value as ComputeCapabilities['cpu'])}
        />

        <CapabilitySelector
          label="Memory (RAM)"
          icon={<HardDrive className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />}
          value={capabilities.memory}
          options={[
            { value: 'low', label: 'Low', description: '4-8 GB' },
            { value: 'medium', label: 'Medium', description: '16-32 GB' },
            { value: 'high', label: 'High', description: '64+ GB' },
            { value: 'extreme', label: 'Extreme', description: '128+ GB' }
          ]}
          onChange={(value) => updateCapability('memory', value as ComputeCapabilities['memory'])}
        />

        <CapabilitySelector
          label="Architecture"
          icon={<Monitor className="w-4 h-4 text-accent-600 dark:text-accent-400" />}
          value={capabilities.architecture}
          options={[
            { value: 'x86_64', label: 'x86_64', description: 'Intel/AMD 64-bit' },
            { value: 'arm64', label: 'ARM64', description: 'Apple Silicon, ARM' },
            { value: 'multi', label: 'Multi-arch', description: 'Building for multiple' }
          ]}
          onChange={(value) => updateCapability('architecture', value as ComputeCapabilities['architecture'])}
        />

        <CapabilitySelector
          label="Environment"
          icon={<Cloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          value={capabilities.environment}
          options={[
            { value: 'local', label: 'Local', description: 'Development machine' },
            { value: 'ci_cd', label: 'CI/CD', description: 'GitHub Actions, etc.' },
            { value: 'cloud', label: 'Cloud', description: 'AWS, GCP, Azure' }
          ]}
          onChange={(value) => updateCapability('environment', value as ComputeCapabilities['environment'])}
        />
      </div>
    </div>
  );
};