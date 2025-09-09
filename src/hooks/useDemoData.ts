import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useDemoData() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createDemoData = async () => {
    setIsCreating(true);
    try {
      toast({
        title: "Demo data feature coming soon",
        description: "This feature will be available once all modules are implemented.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create demo data",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDemoData,
    generateDemoData: createDemoData, // Alias for backward compatibility
    clearDemoData: createDemoData, // Placeholder
    isCreating,
    loading: isCreating, // Alias for backward compatibility
  };
}