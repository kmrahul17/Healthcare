
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Calendar, Search, Settings, History, Filter, ArrowUpDown, Star, Bookmark, FolderOpen, CheckSquare,Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";

import { DocumentScanner } from "@/components/health-records/DocumentScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { RecordForm } from "@/components/health-records/RecordForm";
const extractKeyInformation = (text: string) => {
  const summary = {
    doctorName: extractDoctorName(text),
    date: extractDate(text),
    diagnosis: extractDiagnosis(text),
    medications: extractMedications(text),
    keyFindings: extractKeyFindings(text),
  };
  return summary;
};

const extractDoctorName = (text: string): string => {
  const doctorMatch = text.match(/(?:Dr\.|Doctor)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/);
  return doctorMatch ? doctorMatch[0] : "Unknown";
};

const extractDate = (text: string): string => {
  const dateMatch = text.match(/\d{2}[-/]\d{2}[-/]\d{4}/);
  return dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];
};

const extractDiagnosis = (text: string): string => {
  const diagnosisMatch = text.match(/(?:diagnosis|assessment|impression):.*?[.;\n]/i);
  return diagnosisMatch ? diagnosisMatch[0].replace(/(?:diagnosis|assessment|impression):/i, '').trim() : "";
};

const extractMedications = (text: string): string[] => {
  const medRegex = /(?:prescribed|medication|rx|drug):?(.*?)(?:\n|$)/gi;
  const medications: string[] = [];
  let match;
  while ((match = medRegex.exec(text)) !== null) {
    medications.push(match[1].trim());
  }
  return medications;
};

const extractKeyFindings = (text: string): string[] => {
  const findings = text
    .split(/[.;\n]/)
    .map(line => line.trim())
    .filter(line => 
      line.length > 10 && 
      (line.includes(':') || line.match(/^[A-Z]/))
    )
    .slice(0, 3);
  return findings;
};
interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  doctor: string;
  description: string;
  documents: string[];
  category?: string;
  selected?: boolean;
  metadata?: {
    diagnosis?: string;
    medications?: string[];
    keyFindings?: string[];
    fullText: string;
  };
}

interface SearchHistory {
  term: string;
  timestamp: string;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: typeof defaultFilters;
}

const defaultFilters = {
  type: "",
  dateFrom: "",
  dateTo: "",
  doctor: "",
  category: "",
  sortBy: "date",
  sortOrder: "desc" as "asc" | "desc"
};

const mockRecords: MedicalRecord[] = [
  {
    id: "1",
    date: "2024-03-15",
    type: "Consultation",
    doctor: "Dr. Smith",
    description: "Regular checkup - Blood pressure normal",
    documents: ["medical_report_1.pdf"],
    category: "General Health"
  },
  {
    id: "2",
    date: "2024-03-10",
    type: "Prescription",
    doctor: "Dr. Johnson",
    description: "Prescribed antibiotics for infection",
    documents: ["prescription_1.pdf"],
    category: "Medications"
  }
];

const HealthRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>(records);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([
    {
      id: "1",
      name: "Recent Consultations",
      filters: { ...defaultFilters, type: "Consultation", dateFrom: "2024-01-01" }
    }
  ]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() !== "") {
      const newHistory: SearchHistory = {
        term: term,
        timestamp: new Date().toISOString()
      };
      setSearchHistory(prev => [newHistory, ...prev.slice(0, 9)]);
    }

    applyFiltersAndSort(term, filters);
  };

  const applyFiltersAndSort = (term: string, currentFilters: typeof filters) => {
    let filtered = records.filter(record => {
      const matchesSearch = 
        record.type.toLowerCase().includes(term.toLowerCase()) ||
        record.doctor.toLowerCase().includes(term.toLowerCase()) ||
        record.description.toLowerCase().includes(term.toLowerCase());

      const matchesType = !currentFilters.type || record.type.toLowerCase().includes(currentFilters.type.toLowerCase());
      const matchesDoctor = !currentFilters.doctor || record.doctor.toLowerCase().includes(currentFilters.doctor.toLowerCase());
      const matchesDateRange = (!currentFilters.dateFrom || record.date >= currentFilters.dateFrom) &&
                              (!currentFilters.dateTo || record.date <= currentFilters.dateTo);
      const matchesCategory = !currentFilters.category || record.category === currentFilters.category;

      return matchesSearch && matchesType && matchesDoctor && matchesDateRange && matchesCategory;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const sortField = currentFilters.sortBy;
      const direction = currentFilters.sortOrder === "asc" ? 1 : -1;
      
      if (sortField === "date") {
        return (a.date > b.date ? 1 : -1) * direction;
      }
      if (sortField === "type") {
        return (a.type > b.type ? 1 : -1) * direction;
      }
      return 0;
    });

    setFilteredRecords(filtered);
  };

  const handleDownload = async (record: MedicalRecord) => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
  
      // Add header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Medical Record", 20, 20);
  
      // Add metadata
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      let yPos = 40;
      const addLine = (text: string) => {
        pdf.text(text, 20, yPos);
        yPos += 10;
      };
  
      addLine(`Date: ${record.date}`);
      addLine(`Doctor: ${record.doctor}`);
      addLine(`Type: ${record.type}`);
      addLine(`Category: ${record.category || 'N/A'}`);
  
      // Add description
      yPos += 5;
      addLine("Description:");
      addLine(record.description);
  
      // For scanned documents, add additional metadata
      if (record.type === "Scanned Document" && record.metadata) {
        if (record.metadata.diagnosis) {
          yPos += 5;
          addLine("Diagnosis:");
          addLine(record.metadata.diagnosis);
        }
  
        if (record.metadata.medications?.length) {
          yPos += 5;
          addLine("Medications:");
          record.metadata.medications.forEach(med => {
            addLine(`• ${med}`);
          });
        }
  
        if (record.metadata.keyFindings?.length) {
          yPos += 5;
          addLine("Key Findings:");
          record.metadata.keyFindings.forEach(finding => {
            addLine(`• ${finding}`);
          });
        }
  
        // Add the scanned image if available
        if (record.documents[0]?.startsWith('data:image')) {
          pdf.addImage(
            record.documents[0],
            'JPEG',
            20,
            yPos + 10,
            170,
            100
          );
        }
      }
  
      // Save the PDF
      pdf.save(`medical-record-${record.id}.pdf`);
  
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const applySearchFromHistory = (historicalTerm: string) => {
    setSearchTerm(historicalTerm);
    handleSearch(historicalTerm);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    handleSearch(searchTerm);
  };

  const saveCurrentFiltersAsPreset = () => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: `Preset ${savedPresets.length + 1}`,
      filters: { ...filters }
    };
    setSavedPresets(prev => [...prev, newPreset]);
  };

  const applyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    applyFiltersAndSort(searchTerm, preset.filters);
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) ? prev.filter(recordId => recordId !== id) : [...prev, id]
    );
  };

  const exportSelectedRecords = () => {
    const selectedData = records.filter(record => selectedRecords.includes(record.id));
    const jsonString = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_records.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const categories = Array.from(new Set(records.map(record => record.category)));
  const handleScanComplete = (text: string, image: string) => {
    try {
      setExtractedText(text);
      
      const summary = extractKeyInformation(text);
      
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        date: summary.date,
        type: "Scanned Document",
        doctor: summary.doctorName,
        description: summary.keyFindings.join('. ') || text.substring(0, 200) + "...",
        documents: [image],
        category: "Scanned Documents",
        metadata: {
          diagnosis: summary.diagnosis,
          medications: summary.medications,
          keyFindings: summary.keyFindings,
          fullText: text
        }
      };
    
      setRecords(prev => [...prev, newRecord]);
      
      toast({
        title: "Success",
        description: "Document scanned and saved successfully",
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Error",
        description: "Failed to process document",
        variant: "destructive",
      });
    }
  };
  const DocumentSummary = ({ text }: { text: string }) => {
    const summary = extractKeyInformation(text);
    
    return (
      <div className="space-y-4">
        <div className="grid gap-3">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Doctor</h4>
            <p className="font-medium">{summary.doctorName}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Date</h4>
            <p className="font-medium">{summary.date}</p>
          </div>
  
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Patient Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* Add regex patterns to extract these values */}
              {text.match(/Height.*?(\d+)/i) && <span>Height: {text.match(/Height.*?(\d+)/i)![1]} cm</span>}
              {text.match(/Weight.*?(\d+)/i) && <span>Weight: {text.match(/Weight.*?(\d+)/i)![1]} Kg</span>}
              
              {text.match(/BMI.*?([\d.]+)/i) && <span>BMI: {text.match(/BMI.*?([\d.]+)/i)![1]}</span>}
              {text.match(/BP:?\s*(\d+\/\d+)/i) && <span>BP: {text.match(/BP:?\s*(\d+\/\d+)/i)![1]} mmHg</span>}
            </div>
          </div>
  
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Chief Complaints</h4>
            <ul className="list-disc list-inside text-sm">
              {text.match(/complaints?(.*?)(?:diagnosis|medications|\n\n)/is)?.[1]
                .split('\n')
                .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
                .map((complaint, index) => (
                  <li key={index}>{complaint.replace(/^[*-]\s*/, '').trim()}</li>
                ))}
            </ul>
          </div>
  
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Diagnosis</h4>
            <p className="font-medium">{summary.diagnosis}</p>
          </div>
  
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Medications</h4>
            <ul className="list-disc list-inside text-sm">
              {summary.medications.map((med, index) => (
                <li key={index}>{med}</li>
              ))}
            </ul>
          </div>
  
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Advice</h4>
            <ul className="list-disc list-inside text-sm">
              {text.match(/advice:?(.*?)(?:follow|$)/is)?.[1]
                .split('\n')
                .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
                .map((advice, index) => (
                  <li key={index}>{advice.replace(/^[*-]\s*/, '').trim()}</li>
                ))}
            </ul>
          </div>
  
          {text.match(/follow.*?(\d{2}[-/]\d{2}[-/]\d{4})/i) && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Follow Up</h4>
              <p className="font-medium">
                {text.match(/follow.*?(\d{2}[-/]\d{2}[-/]\d{4})/i)![1]}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    
    <Layout>
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Health Records</h1>
        <div className="flex space-x-2">
          {selectedRecords.length > 0 && (
            <Button onClick={exportSelectedRecords}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected ({selectedRecords.length})
            </Button>
          )}
          <DocumentScanner onScanComplete={handleScanComplete} />
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters & Sort
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <div className="flex items-center space-x-2">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                      <option value="date">Date</option>
                      <option value="type">Type</option>
                    </select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setFilters({ 
                        ...filters, 
                        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" 
                      })}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Record Type</label>
                  <Input
                    placeholder="Filter by type..."
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Doctor</label>
                  <Input
                    placeholder="Filter by doctor..."
                    value={filters.doctor}
                    onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear
                  </Button>
                  <Button onClick={saveCurrentFiltersAsPreset} className="flex-1">
                    <Star className="mr-2 h-4 w-4" />
                    Save Preset
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved Presets
                </h3>
                <div className="space-y-2">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => applyPreset(preset)}
                    >
                      <span className="text-sm">{preset.name}</span>
                      <Star className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {searchHistory.map((history, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => applySearchFromHistory(history.term)}
                    >
                      <span className="text-sm">{history.term}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(history.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
          {extractedText && (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Document Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentSummary text={extractedText} />
      </CardContent>
    </Card>
  </div>
)}

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecords.map((record) => (
          <Card 
            key={record.id} 
            className={`animate-fade-in ${selectedRecords.includes(record.id) ? 'border-primary' : ''}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRecords.includes(record.id)}
                    onChange={() => toggleRecordSelection(record.id)}
                    className="rounded border-gray-300"
                  />
                  <span>{record.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">{record.date}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{record.category}</span>
                  </div>
                  <p className="font-medium">{record.doctor}</p>
                  <p className="text-muted-foreground">{record.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                <Button
  variant="outline"
  size="sm"
  onClick={() => handleDownload(record)}
>
  <Download className="mr-2 h-4 w-4" />
  Download Report
</Button>
                  {record.type === "Scanned Document" && record.metadata && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExtractedText(record.metadata.fullText)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </Layout>
);
};

export default HealthRecords;
