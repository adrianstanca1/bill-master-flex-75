
import React from 'react';
import { UseFormRegister, UseFieldArrayReturn, Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Upload } from 'lucide-react';
import { FormValues } from './InvoiceGenerator';
import { useToast } from '@/hooks/use-toast';
import { validateAndSanitizeField, sanitizeFileUpload } from '@/lib/sanitization';
import { secureStorage } from '@/lib/SecureStorage';

interface InvoiceFormProps {
  register: UseFormRegister<FormValues>;
  fields: UseFieldArrayReturn<FormValues, 'items', 'id'>['fields'];
  append: UseFieldArrayReturn<FormValues, 'items', 'id'>['append'];
  remove: UseFieldArrayReturn<FormValues, 'items', 'id'>['remove'];
  control: Control<FormValues>;
  onSaveDefaults: () => void;
  onPreview: () => void;
  onSaveBackend: () => void;
}

export function InvoiceForm({ 
  register, 
  fields, 
  append, 
  remove, 
  onSaveDefaults, 
  onPreview,
  onSaveBackend,
}: InvoiceFormProps) {
  const { toast } = useToast();

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Enhanced file validation with MIME type verification
      const { isValid, errors } = sanitizeFileUpload(file);
      if (!isValid) {
        toast({
          title: "Invalid file",
          description: errors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Additional MIME type verification
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedMimeTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PNG, JPEG, JPG, and WebP images are allowed",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const logoUrl = e.target?.result as string;
        await secureStorage.setItem('company-logo', logoUrl);
        toast({
          title: "Logo uploaded",
          description: "Your company logo has been saved securely",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">AS Invoice Generator</h1>
          <p className="text-text-secondary">Create professional UK invoices with VAT calculations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onSaveDefaults}>
            Save Defaults
          </Button>
          <Button variant="secondary" onClick={onSaveBackend}>
            Save to Supabase
          </Button>
          <Button onClick={onPreview} className="bg-gradient-primary">
            Preview Invoice
          </Button>
        </div>
      </div>

      {/* Company & Client Information */}
      <Card className="bg-surface border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Company & Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <Label className="text-text-secondary font-medium">Your Company</Label>
                <div className="mt-2 space-y-3">
                   <Input 
                     placeholder="Company name" 
                     className="bg-input border-border text-text-primary"
                     {...register('company.name', {
                       validate: (value) => {
                         const { isValid, errors } = validateAndSanitizeField(value || '', 'company');
                         return isValid || errors[0];
                       }
                     })} 
                   />
                  <Textarea 
                    placeholder="Company address (multi-line)" 
                    rows={4}
                    className="bg-input border-border text-text-primary resize-none"
                    {...register('company.address')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                   <Input 
                     placeholder="Email" 
                     type="email"
                     className="bg-input border-border text-text-primary"
                     {...register('company.email', {
                       validate: (value) => {
                         if (!value) return true;
                         const { isValid, errors } = validateAndSanitizeField(value, 'email');
                         return isValid || errors[0];
                       }
                     })} 
                   />
                   <Input 
                     placeholder="Phone" 
                     className="bg-input border-border text-text-primary"
                     {...register('company.phone', {
                       validate: (value) => {
                         if (!value) return true;
                         const { isValid, errors } = validateAndSanitizeField(value, 'phone');
                         return isValid || errors[0];
                       }
                     })} 
                   />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="VAT Number" 
                      className="bg-input border-border text-text-primary"
                      {...register('company.vatNumber')} 
                    />
                    <Input 
                      placeholder="Company Reg #" 
                      className="bg-input border-border text-text-primary"
                      {...register('company.regNumber')} 
                    />
                  </div>
                  
                  {/* Logo Upload */}
                  <div>
                    <Label className="text-text-secondary font-medium">Company Logo</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-input border border-border rounded-md cursor-pointer hover:bg-muted transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Upload Logo</span>
                      </label>
                      <p className="text-xs text-text-secondary mt-1">
                        Recommended: PNG, JPG (max 2MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-text-secondary font-medium">Client Information</Label>
                <div className="mt-2 space-y-3">
                  <Input 
                    placeholder="Client name" 
                    className="bg-input border-border text-text-primary"
                    {...register('client.name')} 
                  />
                  <Textarea 
                    placeholder="Client address (multi-line)" 
                    rows={4}
                    className="bg-input border-border text-text-primary resize-none"
                    {...register('client.address')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Contact person" 
                      className="bg-input border-border text-text-primary"
                      {...register('client.contact')} 
                    />
                    <Input 
                      placeholder="Email" 
                      type="email"
                      className="bg-input border-border text-text-primary"
                      {...register('client.email')} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card className="bg-surface border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-text-secondary">Invoice Number</Label>
              <Input 
                placeholder="INV-0001" 
                className="bg-input border-border text-text-primary mt-1"
                {...register('invoice.number')} 
              />
            </div>
            <div>
              <Label className="text-text-secondary">Invoice Date</Label>
              <Input 
                type="date" 
                className="bg-input border-border text-text-primary mt-1"
                {...register('invoice.date')} 
              />
            </div>
            <div>
              <Label className="text-text-secondary">Due Date</Label>
              <Input 
                type="date" 
                className="bg-input border-border text-text-primary mt-1"
                {...register('invoice.dueDate')} 
              />
            </div>
            <div className="md:col-span-3">
              <Label className="text-text-secondary">Reference / PO Number</Label>
              <Input 
                placeholder="Purchase order or reference number" 
                className="bg-input border-border text-text-primary mt-1"
                {...register('invoice.reference')} 
              />
            </div>
            <div className="md:col-span-3">
              <Label className="text-text-secondary">Notes</Label>
              <Textarea 
                placeholder="Payment terms, bank details, or other notes..." 
                rows={3}
                className="bg-input border-border text-text-primary mt-1 resize-none"
                {...register('invoice.notes')} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="bg-surface border-border shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-text-primary">Line Items</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  {idx === 0 && <Label className="text-text-secondary text-xs">Description</Label>}
                  <Input 
                    placeholder="Description of work/product" 
                    className="bg-input border-border text-text-primary"
                    {...register(`items.${idx}.description` as const)} 
                  />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <Label className="text-text-secondary text-xs">Quantity</Label>}
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="1.00"
                    className="bg-input border-border text-text-primary"
                    {...register(`items.${idx}.quantity`, { valueAsNumber: true })} 
                  />
                </div>
                <div className="col-span-3">
                  {idx === 0 && <Label className="text-text-secondary text-xs">Unit Price (£)</Label>}
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="bg-input border-border text-text-primary"
                    {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })} 
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  {fields.length > 1 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
