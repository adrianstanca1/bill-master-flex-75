
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput } from '@/lib/sanitization';

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description too long').transform((val) => sanitizeInput(val, { maxLength: 500 })),
  quantity: z.number().min(0, 'Quantity must be positive').max(99999, 'Quantity too large'),
  unitPrice: z.number().min(0, 'Unit price must be positive').max(999999, 'Unit price too large'),
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').transform((val) => sanitizeInput(val, { maxLength: 200 })),
  items: z.array(itemSchema).min(1, 'At least one item is required').max(50, 'Too many items'),
  notes: z.string().optional().or(z.literal('')).transform((val) => val ? sanitizeInput(val, { maxLength: 1000 }) : ''),
});

type FormValues = z.infer<typeof formSchema>;

interface QuoteEditorProps {
  quote?: {
    id: string;
    title: string;
    items: any[];
    total: number;
    status: string;
  };
  onSave: (data: FormValues & { total: number }) => Promise<void>;
  onCancel: () => void;
}

export function QuoteEditor({ quote, onSave, onCancel }: QuoteEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { control, register, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quote?.title || '',
      items: quote?.items || [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const values = watch();

  const calculateTotal = () => {
    return values.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const total = calculateTotal();
      await onSave({ ...data, total });
      toast({ title: quote ? "Quote updated" : "Quote created" });
    } catch (error: any) {
      toast({
        title: "Error saving quote",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{quote ? 'Edit Quote' : 'New Quote'}</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Quote Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Quote for client project"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quote Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5">
                {index === 0 && <Label className="text-sm">Description</Label>}
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Description of work"
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-sm">Quantity</Label>}
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  placeholder="1.00"
                />
              </div>
              <div className="col-span-3">
                {index === 0 && <Label className="text-sm">Unit Price (£)</Label>}
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                £{calculateTotal().toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Terms and conditions, payment details, etc."
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {quote ? 'Update Quote' : 'Create Quote'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
