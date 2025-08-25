
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Edit, Eye, Search, Plus } from 'lucide-react';
import { QuotePreview } from './QuotePreview';

interface Quote {
  id: string;
  title: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

interface QuotesListProps {
  quotes: Quote[];
  isLoading: boolean;
  onCreateNew: () => void;
  onEdit: (quote: Quote) => void;
  onConvertToInvoice?: (quote: Quote) => void;
}

export function QuotesList({ quotes, isLoading, onCreateNew, onEdit, onConvertToInvoice }: QuotesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const filteredQuotes = quotes.filter(quote =>
    quote.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedQuote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedQuote(null)}>
            ← Back to Quotes
          </Button>
        </div>
        <QuotePreview
          quote={selectedQuote}
          onEdit={() => {
            setSelectedQuote(null);
            onEdit(selectedQuote);
          }}
          onSend={() => {
            // TODO: Implement send functionality
            console.log('Send quote:', selectedQuote.id);
          }}
          onDownload={() => {
            // TODO: Implement download functionality
            console.log('Download quote:', selectedQuote.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">Manage your construction project quotes</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotes ({filteredQuotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading quotes...</div>
          ) : filteredQuotes.length > 0 ? (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{quote.title}</h3>
                        <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Created: {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                      <p className="font-semibold text-lg">£{quote.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(quote)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {onConvertToInvoice && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onConvertToInvoice(quote)}
                        >
                          Convert to Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No quotes found. {searchTerm && 'Try adjusting your search.'}</p>
              {!searchTerm && (
                <Button className="mt-4" onClick={onCreateNew}>
                  Create your first quote
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
