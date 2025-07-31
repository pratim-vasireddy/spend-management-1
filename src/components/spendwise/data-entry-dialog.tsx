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
import { PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

export type FieldGroup = FormField[];

interface DataEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  fieldGroups: FieldGroup[];
  title: string;
  description: string;
  preview?: (data: any) => React.ReactNode;
}

export default function DataEntryDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  fieldGroups,
  title,
  description,
  preview
}: DataEntryDialogProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      const initialFormData = fieldGroups
        .flat()
        .reduce((acc, field) => {
          acc[field.id] = '';
          return acc;
        }, {} as any);
      setFormData(initialFormData);
    }
  }, [isOpen, fieldGroups]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const dataWithId = { id: uuidv4(), ...formData };
    onSubmit(dataWithId);
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
            value={formData[id] || ''}
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
          value={formData[id] || ''}
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
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {preview && preview(formData)}

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
          <Button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
             <PlusCircle className="mr-2 h-4 w-4" />
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}