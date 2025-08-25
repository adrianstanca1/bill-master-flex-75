
import React from 'react';
import { AlertTriangle, Key, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ErrorHandlerProps {
  error: any;
  context?: string;
  onRetry?: () => void;
  showApiKeyPrompt?: boolean;
}

export default function ErrorHandler({ error, context = '', onRetry, showApiKeyPrompt = false }: ErrorHandlerProps) {
  const { toast } = useToast();

  const getErrorMessage = (error: any): { title: string; description: string; solution: string; actionNeeded?: string } => {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    // Authentication errors
    if (errorMessage.includes('JWT') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return {
        title: 'Authentication Required',
        description: 'You need to be signed in to use this feature.',
        solution: 'Please sign in to your account and try again.',
        actionNeeded: 'sign-in'
      };
    }

    // API Key errors
    if (errorMessage.includes('OPENAI_API_KEY') || errorMessage.includes('OpenAI')) {
      return {
        title: 'OpenAI API Key Missing',
        description: 'The OpenAI API key is required for AI-powered features.',
        solution: 'Please add your OpenAI API key in Account Settings.',
        actionNeeded: 'openai-key'
      };
    }

    if (errorMessage.includes('FIRECRAWL_API_KEY') || errorMessage.includes('Firecrawl')) {
      return {
        title: 'Firecrawl API Key Missing',
        description: 'The Firecrawl API key is required for TenderBot.',
        solution: 'Please add your Firecrawl API key in Account Settings.',
        actionNeeded: 'firecrawl-key'
      };
    }

    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to our services.',
        solution: 'Please check your internet connection and try again.',
        actionNeeded: 'retry'
      };
    }

    // Company ID errors
    if (errorMessage.includes('company') || errorMessage.includes('Company ID')) {
      return {
        title: 'Company Setup Required',
        description: 'Your company information needs to be configured.',
        solution: 'Please complete your company setup in Settings.',
        actionNeeded: 'company-setup'
      };
    }

    // Rate limit errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        title: 'Rate Limit Exceeded',
        description: 'Too many requests. Please wait before trying again.',
        solution: 'Wait a few minutes and try again.',
        actionNeeded: 'retry'
      };
    }

    // Generic error
    return {
      title: 'Something went wrong',
      description: errorMessage,
      solution: 'Please try again or contact support if the problem persists.',
      actionNeeded: 'retry'
    };
  };

  const errorInfo = getErrorMessage(error);

  const handleAction = (action?: string) => {
    switch (action) {
      case 'sign-in':
        window.location.href = '/auth';
        break;
      case 'openai-key':
      case 'firecrawl-key':
      case 'company-setup':
        window.location.href = '/account-settings';
        break;
      case 'retry':
        if (onRetry) {
          onRetry();
        } else {
          window.location.reload();
        }
        break;
      default:
        if (onRetry) onRetry();
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">{errorInfo.title}</h3>
          {context && (
            <p className="text-xs text-red-600 mt-1">Context: {context}</p>
          )}
          <p className="text-sm text-red-700 mt-1">{errorInfo.description}</p>
          <p className="text-sm text-red-600 mt-2 font-medium">{errorInfo.solution}</p>
          
          {errorInfo.actionNeeded && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleAction(errorInfo.actionNeeded)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
              >
                {errorInfo.actionNeeded === 'sign-in' && <Key className="h-3 w-3 mr-1" />}
                {errorInfo.actionNeeded === 'openai-key' && <Key className="h-3 w-3 mr-1" />}
                {errorInfo.actionNeeded === 'firecrawl-key' && <Key className="h-3 w-3 mr-1" />}
                {errorInfo.actionNeeded === 'company-setup' && <Settings className="h-3 w-3 mr-1" />}
                {errorInfo.actionNeeded === 'retry' && <RefreshCw className="h-3 w-3 mr-1" />}
                
                {errorInfo.actionNeeded === 'sign-in' && 'Sign In'}
                {errorInfo.actionNeeded === 'openai-key' && 'Add OpenAI Key'}
                {errorInfo.actionNeeded === 'firecrawl-key' && 'Add Firecrawl Key'}
                {errorInfo.actionNeeded === 'company-setup' && 'Complete Setup'}
                {errorInfo.actionNeeded === 'retry' && 'Try Again'}
              </button>
              
              {onRetry && errorInfo.actionNeeded !== 'retry' && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
