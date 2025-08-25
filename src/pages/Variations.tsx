import React, { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Variation {
  id: string;
  project_id: string;
  title: string;
  total: number;
  status: string;
  created_at: string;
}

const VariationsPage: React.FC = () => {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");

  // Simplified mock data for demonstration
  useEffect(() => {
    setVariations([
      {
        id: "1",
        project_id: "proj-1",
        title: "Additional electrical work",
        total: 2500,
        status: "approved",
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  const handleAdd = () => {
    if (!title.trim() || !total) return;
    
    const newVariation: Variation = {
      id: Date.now().toString(),
      project_id: "proj-1",
      title: title.trim(),
      total: parseFloat(total),
      status: "pending",
      created_at: new Date().toISOString()
    };
    
    setVariations(prev => [newVariation, ...prev]);
    setTitle("");
    setTotal("");
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveLayout>
        <SEO 
          title="Project Variations | AS Cladding" 
          description="Manage project variations and change orders" 
        />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Variations</h1>
            <p className="text-muted-foreground">Manage project variations and change orders</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Add New Variation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Variation Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Additional electrical work"
                />
              </div>
              <div>
                <Label htmlFor="total">Total Amount (£)</Label>
                <Input
                  id="total"
                  type="number"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button onClick={handleAdd} disabled={!title.trim() || !total}>
                Add Variation
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Variations List</CardTitle>
            </CardHeader>
            <CardContent>
              {variations.length === 0 ? (
                <p className="text-muted-foreground">No variations found.</p>
              ) : (
                <div className="space-y-4">
                  {variations.map((variation) => (
                    <div key={variation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{variation.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(variation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£{variation.total.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {variation.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    </div>
  );
};

export default VariationsPage;