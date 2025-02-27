import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { MedicalRecord } from "@/types";

interface RecordFormProps {
  onSubmit: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: MedicalRecord;
}

const recordTypes = [
  "Consultation",
  "Prescription",
  "Test Result",
  "Vaccination",
  "Surgery",
  "Treatment"
];

export function RecordForm({ onSubmit, onCancel, initialData }: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicalRecord>>(
    initialData || {
      date: new Date().toISOString().split('T')[0],
      type: "",
      doctor: "",
      description: "",
      documents: [],
      category: "General Health"
    }
  );
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData as Omit<MedicalRecord, 'id'>,
        documents: files ? Array.from(files).map(f => f.name) : []
      });
      toast({
        title: "Success",
        description: "Record saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Record Type*</Label>
          <select
            className="w-full rounded-md border p-2"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="">Select Type</option>
            {recordTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Date*</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Doctor/Provider*</Label>
        <Input
          value={formData.doctor}
          onChange={e => setFormData({ ...formData, doctor: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description*</Label>
        <Textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Documents</Label>
        <Input
          type="file"
          multiple
          onChange={e => setFiles(e.target.files)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Add Record'}
        </Button>
      </div>
    </form>
  );
}