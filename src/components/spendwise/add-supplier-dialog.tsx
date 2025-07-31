import React, { useState } from 'react';
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

interface AddSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (newSupplier: Supplier) => void;
}

export default function AddSupplierDialog({ isOpen, onClose, onAddSupplier }: AddSupplierDialogProps) {
  const [formData, setFormData] = useState({
    supplierId: '',
    name: '',
    description: '',
    city: '',
    country: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddSupplier = () => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...formData,
      address: [formData.city, formData.country].filter(Boolean).join(', '),
      latitude: null,
      longitude: null,
    };
    onAddSupplier(newSupplier);
    onClose();
    setFormData({
      supplierId: '',
      name: '',
      description: '',
      city: '',
      country: '',
    });
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
            <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="supplierId" className="text-slate-400">Supplier ID *</Label>
                    <Input
                        id="supplierId"
                        value={formData.supplierId}
                        onChange={handleInputChange}
                        className="bg-slate-800 border-slate-600 focus:ring-blue-500"
                        placeholder="e.g., SUP-001"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-400">Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-slate-800 border-slate-600 focus:ring-blue-500"
                        placeholder="e.g., ABC Manufacturing"
                    />
                 </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-400">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border-slate-600 rounded-md p-2 focus:ring-blue-500"
                  placeholder="Brief description of the supplier"
                  rows={3}
                />
            </div>
            {/* Address information can be added here if needed */}
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