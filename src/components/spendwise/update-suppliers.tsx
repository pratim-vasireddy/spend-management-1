import type { Supplier } from '@/types/spendwise';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Fingerprint, Building, FileText, Globe2, PlusCircle, Info, Trash2, MapPin, Loader2, FileSpreadsheet, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SupplierWorldMap from './supplier-world-map';
import { geocodeSupplierAddress } from '@/lib/geocodingService';
import { useToast } from "@/hooks/use-toast";
import React, { useState, useRef } from 'react';
import { parseSuppliersExcel } from './excel-parser';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AddSupplierDialog, { FieldGroup } from './add-supplier-dialog';

interface UpdateSuppliersTabProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const addSupplierFieldGroups: FieldGroup[] = [
    [
        { id: 'supplierId', label: 'Supplier ID', type: 'text', placeholder: 'e.g., SUP-001', required: true },
        { id: 'name', label: 'Name', type: 'text', placeholder: 'e.g., ABC Manufacturing', required: true },
    ],
    [
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the supplier' },
    ],
    [
        { id: 'city', label: 'City', type: 'text', placeholder: 'e.g., Tokyo' },
        { id: 'country', label: 'Country', type: 'text', placeholder: 'e.g., Japan' },
    ]
];

export default function UpdateSuppliersTab({ suppliers, setSuppliers }: UpdateSuppliersTabProps) {
  const { toast } = useToast();
  const [geocodingSupplierId, setGeocodingSupplierId] = useState<string | null>(null);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prevSuppliers => prevSuppliers.filter(s => s.id !== supplierId));
  };

  const handleAddNewSupplier = (newSupplier: Supplier) => {
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  const handleGeocodeSupplier = async (supplierToGeocode: Supplier) => {
      if (!supplierToGeocode) return;

      const hasAddressInfo = supplierToGeocode.city || supplierToGeocode.streetAddress || supplierToGeocode.postalCode || supplierToGeocode.country;
      if (!hasAddressInfo) {
        toast({
          variant: "destructive",
          title: "Insufficient Address Info",
          description: `Cannot geocode ${supplierToGeocode.name}. Please add city, street address, postal code, or country information.`,
          duration: 5000,
        });
        return;
      }

      setGeocodingSupplierId(supplierToGeocode.id);

      try {
        const result = await geocodeSupplierAddress({
          streetAddress: supplierToGeocode.streetAddress,
          city: supplierToGeocode.city,
          stateOrProvince: supplierToGeocode.stateOrProvince,
          postalCode: supplierToGeocode.postalCode,
          country: supplierToGeocode.country,
        });

        setSuppliers(prevSuppliers =>
          prevSuppliers.map(s =>
            s.id === supplierToGeocode.id ? { ...s, latitude: result.lat, longitude: result.lng } : s
          )
        );

        toast({
          title: "Geocoding Successful",
          description: `Coordinates found for ${supplierToGeocode.name}: (${result.lat.toFixed(4)}, ${result.lng.toFixed(4)})`,
          duration: 4000,
        });

      } catch (error: any) {
        console.error("Geocoding error:", error);

        let errorMessage = `Could not find coordinates for ${supplierToGeocode.name}.`;

        if (error.message) {
          if (error.message.includes('ZERO_RESULTS')) {
            errorMessage += " The address was not found. Please check the address details.";
          } else if (error.message.includes('REQUEST_DENIED')) {
            errorMessage += " API access denied. Please check your API key and billing settings.";
          } else if (error.message.includes('OVER_QUERY_LIMIT')) {
            errorMessage += " API quota exceeded. Please try again later.";
          } else if (error.message.includes('INVALID_REQUEST')) {
            errorMessage += " Invalid address format. Please check the address components.";
          } else {
            errorMessage += ` Error: ${error.message}`;
          }
        }

        toast({
          variant: "destructive",
          title: "Geocoding Failed",
          description: errorMessage,
          duration: 8000,
        });

      } finally {
        setGeocodingSupplierId(null);
      }
    };

  const handleExcelUpload = async (file: File) => {
    setIsUploadingExcel(true);
    try {
      const result = await parseSuppliersExcel(file, suppliers);
      if (result.data.length > 0) {
        setSuppliers(prev => [...prev, ...result.data]);
        toast({
          title: "Suppliers Imported",
          description: `Successfully imported ${result.data.length} suppliers from Excel.`
        });
      }
      if (result.errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Import Warnings",
          description: `${result.errors.length} rows had issues. Check console for details.`
        });
        console.error("Excel import errors:", result.errors);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to process Excel file"
      });
    } finally {
      setIsUploadingExcel(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Building className="mr-2 h-5 w-5" />
          <CardTitle className="text-lg">2. Add/Update Suppliers</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">Manage supplier information. Click the <MapPin className="inline h-3 w-3" /> icon to fetch coordinates for the map. Ensure Geocoding API is enabled in Google Cloud Console.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-8 gap-6 text-xs">
        <div className="md:col-span-5 space-y-4">
          <section>
            <div className="flex justify-between items-center mb-1.5">
               <h3 className="text-base font-semibold text-muted-foreground">Supplier Details</h3>
               <div className="flex items-center gap-2 ml-auto"> 
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="text-xs text-slate-50 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-slate-50">
                      <Database className="mr-1.5 h-3.5 w-3.5" /> Data
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsAddSupplierDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Add Supplier</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} disabled={isUploadingExcel}>
                      {isUploadingExcel ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                      )}
                      <span>{isUploadingExcel ? "Uploading..." : "Upload Excel"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleExcelUpload(file);
                      e.target.value = ""; // Reset file input
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            {suppliers.length === 0 ? (
              <p className="text-muted-foreground text-center py-3">No suppliers available. Generate, add, or upload some suppliers.</p>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)] overflow-auto rounded-md border">
                <Table className="relative">
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="w-[80px] px-4 py-3 font-semibold text-xs text-slate-200 tracking-wide uppercase"><Fingerprint className="inline-block mr-1 h-3.5 w-3.5" />ID</TableHead>
                      <TableHead className="min-w-[130px] px-4 py-3 font-semibold text-xs text-slate-200 tracking-wide uppercase"><Building className="inline-block mr-1 h-3.5 w-3.5" />Name</TableHead>
                      <TableHead className="min-w-[130px] px-4 py-3 font-semibold text-xs text-slate-200 tracking-wide uppercase"><FileText className="inline-block mr-1 h-3.5 w-3.5" />Description</TableHead>
                      <TableHead className="min-w-[90px] px-4 py-3 font-semibold text-xs text-slate-200 tracking-wide uppercase">City</TableHead>
                      <TableHead className="min-w-[90px] px-4 py-3 font-semibold text-xs text-slate-200 tracking-wide uppercase"><Globe2 className="inline-block mr-1 h-3.5 w-3.5" />Country</TableHead>
                      <TableHead className="text-center w-[90px] px-4 py-3 font-semibold text-xs text-slate-200 tracking-wide uppercase">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-mono text-xs py-1.5">{supplier.supplierId}</TableCell>
                        <TableCell className="py-1.5">{supplier.name}</TableCell>
                        <TableCell className="py-1.5">{supplier.description}</TableCell>
                        <TableCell className="py-1.5">{supplier.city}</TableCell>
                        <TableCell className="py-1.5">{supplier.country}</TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center justify-center space-x-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 group hover:bg-green-500/10"
                                  onClick={() => handleGeocodeSupplier(supplier)}
                                  disabled={geocodingSupplierId === supplier.id || (!supplier.city && !supplier.streetAddress && !supplier.postalCode && !supplier.country)}
                                  aria-label="Fetch Coordinates"
                                >
                                  {geocodingSupplierId === supplier.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <MapPin className={'h-3.5 w-3.5 text-slate-400 group-hover:text-green-400'} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{supplier.latitude && supplier.longitude ? `Coords: ${supplier.latitude.toFixed(2)}, ${supplier.longitude.toFixed(2)}` : 'Fetch Coordinates'}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                               <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10" aria-label="Delete Supplier" onClick={() => handleDeleteSupplier(supplier.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p>Delete Supplier</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </section>
        </div>
        <div className="md:col-span-3 space-y-4">
          <SupplierWorldMap suppliers={suppliers} />
        </div>
        <AddSupplierDialog
          isOpen={isAddSupplierDialogOpen}
          onClose={() => setIsAddSupplierDialogOpen(false)}
          onAddSupplier={handleAddNewSupplier}
          fieldGroups={addSupplierFieldGroups}
        />
      </CardContent>
    </Card>
  );
}