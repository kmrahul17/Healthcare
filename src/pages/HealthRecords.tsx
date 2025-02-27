
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Calendar, Search, Settings, History, Filter, ArrowUpDown, Star, Bookmark, FolderOpen, CheckSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { RecordForm } from "@/components/health-records/RecordForm";
interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  doctor: string;
  description: string;
  documents: string[];
  category?: string;
  selected?: boolean;
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
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>(records);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
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

  const handleDownload = (documentName: string) => {
    console.log(`Downloading ${documentName}`);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Health Records</h1>
          <div className="flex space-x-2">
            {selectedRecords.length > 0 && (
              <Button onClick={exportSelectedRecords}>
                <Download className="mr-2 h-4 w-4" />
                Export Selected ({selectedRecords.length})
              </Button>
            )}
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

        <div className="grid gap-6 md:grid-cols-2">
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
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(record.documents[0])}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
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
