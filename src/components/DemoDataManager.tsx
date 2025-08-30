import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database,
  Download,
  Trash2,
  FileText,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';
import { useState } from 'react';

interface DemoDataCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  count: number;
}

const DEMO_CATEGORIES: DemoDataCategory[] = [
  {
    id: 'projects',
    name: 'Projects',
    description: 'Sample construction projects with different statuses',
    icon: FileText,
    count: 3
  },
  {
    id: 'invoices', 
    name: 'Invoices',
    description: 'Demo invoices with various payment statuses',
    icon: FileText,
    count: 3
  },
  {
    id: 'quotes',
    name: 'Quotes',
    description: 'Sample quotes for different clients',
    icon: FileText,
    count: 2
  },
  {
    id: 'reminders',
    name: 'Reminders',
    description: 'Important business reminders and tasks',
    icon: Clock,
    count: 3
  }
];

export function DemoDataManager() {
  const { generateDemoData, clearDemoData, loading } = useDemoData();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DEMO_CATEGORIES.map(cat => cat.id)
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleGenerateDemo = async () => {
    const options = selectedCategories.reduce((acc, categoryId) => ({
      ...acc,
      [categoryId]: true
    }), {} as Record<string, boolean>);

    await generateDemoData(options);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClearDemo = async () => {
    await clearDemoData();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Generate realistic demo data to explore AS Agents features. This data will be associated with your company and can be cleared at any time.
          </AlertDescription>
        </Alert>

        {showSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Demo data operation completed successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Category Selection */}
        <div className="space-y-3">
          <h4 className="font-medium">Select Data Categories</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {DEMO_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategories.includes(category.id);
              
              return (
                <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={category.id}
                    checked={isSelected}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <label
                        htmlFor={category.id}
                        className="font-medium cursor-pointer"
                      >
                        {category.name}
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {category.count} items
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleGenerateDemo}
            disabled={loading || selectedCategories.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Demo Data
              </>
            )}
          </Button>

          <Button 
            onClick={handleClearDemo}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </>
            )}
          </Button>
        </div>

        {/* Data Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">What gets generated:</h4>
          <div className="grid gap-2 text-sm">
            {selectedCategories.map(categoryId => {
              const category = DEMO_CATEGORIES.find(cat => cat.id === categoryId);
              if (!category) return null;
              
              return (
                <div key={categoryId} className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <Badge variant="secondary">{category.count} records</Badge>
                </div>
              );
            })}
            {selectedCategories.length === 0 && (
              <p className="text-muted-foreground italic">No categories selected</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}