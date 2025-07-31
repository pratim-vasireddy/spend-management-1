import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Supplier } from '@/types/spendwise';
import { Building, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface FormField {
  id: keyof Supplier;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

export type FieldGroup = FormField[];

interface AddSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (newSupplier: Partial<Supplier>) => void;
  fieldGroups: FieldGroup[];
}

export default function AddSupplierDialog({ isOpen, onClose, onAddSupplier, fieldGroups }: AddSupplierDialogProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>({});

  useEffect(() => {
    if (isOpen) {
      const initialFormData = fieldGroups
        .flat()
        .reduce((acc, field) => {
          acc[field.id] = '';
          return acc;
        }, {} as Partial<Supplier>);
      setFormData(initialFormData);
    }
  }, [isOpen, fieldGroups]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddSupplier = () => {
    const newSupplier: Partial<Supplier> = {
      id: uuidv4(),
      ...formData,
      address: [formData.city, formData.country].filter(Boolean).join(', '),
      latitude: null,
      longitude: null,
    };
    onAddSupplier(newSupplier as Supplier);
    onClose();
  };

  const renderField = (field: FormField) => {
    const { id, label, type, placeholder, required } = field;
    const labelText = `${label}${required ? ' *' : ''}`;

    if (type === 'textarea') {
      return (
        <div key={id} className="space-y-2">
          <Label htmlFor={id} className="text-slate-400">{labelText}</Label>
          <textarea
            id={id}
            value={formData[id] as string || ''}
            onChange={handleInputChange}
            className="w-full bg-slate-800 border-slate-600 rounded-md p-2 focus:ring-blue-500"
            placeholder={placeholder}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div key={id} className="space-y-2">
        <Label htmlFor={id} className="text-slate-400">{labelText}</Label>
        <Input
          id={id}
          type={type}
          value={formData[id] as string || ''}
          onChange={handleInputChange}
          className="bg-slate-800 border-slate-600 focus:ring-blue-500"
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 rounded-lg p-3">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Add New Supplier</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the details for the new supplier.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-1 my-4 bg-slate-800 border border-slate-700 rounded-lg">
           <div className="p-4">
              <h3 className="text-base font-semibold text-slate-300 mb-4 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Supplier Preview
              </h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-900 p-3 rounded-md">
                  <p className="text-xs text-slate-400">Supplier ID</p>
                  <p className="font-bold text-sm truncate">{formData.supplierId || 'SUP-XXX'}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-md">
                  <p className="text-xs text-slate-400">Company Name</p>
                  <p className="font-bold text-sm text-green-400 truncate">{formData.name || 'Company Name'}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-md">
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="font-bold text-sm text-orange-400 truncate">{formData.country || 'Country'}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-md">
                  <p className="text-xs text-slate-400">Performance</p>
                  <p className="font-bold text-sm text-yellow-400">5/5 ★</p>
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          {fieldGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={`grid grid-cols-1 md:grid-cols-${group.length} gap-6`}>
              {group.map(renderField)}
            </div>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="text-white border-slate-600 hover:bg-slate-700">
            Cancel
          </Button>
          <Button type="button" onClick={handleAddSupplier} className="bg-blue-600 hover:bg-blue-700 text-white">
             <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}