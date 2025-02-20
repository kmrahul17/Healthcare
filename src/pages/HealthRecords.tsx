
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Calendar, Search, Settings, History, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  doctor: string;
  description: string;
  documents: string[];
}

interface SearchHistory {
  term: string;
  timestamp: string;
}

const mockRecords: MedicalRecord[] = [
  {
    id: "1",
    date: "2024-03-15",
    type: "Consultation",
    doctor: "Dr. Smith",
    description: "Regular checkup - Blood pressure normal",
    documents: ["medical_report_1.pdf"]
  },
  {
    id: "2",
    date: "2024-03-10",
    type: "Prescription",
    doctor: "Dr. Johnson",
    description: "Prescribed antibiotics for infection",
    documents: ["prescription_1.pdf"]
  }
];

const HealthRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>(records);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
    doctor: ""
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Add to search history
    if (term.trim() !== "") {
      const newHistory: SearchHistory = {
        term: term,
        timestamp: new Date().toISOString()
      };
      setSearchHistory(prev => [newHistory, ...prev.slice(0, 9)]);
    }

    // Apply filters
    const filtered = records.filter(record => {
      const matchesSearch = 
        record.type.toLowerCase().includes(term.toLowerCase()) ||
        record.doctor.toLowerCase().includes(term.toLowerCase()) ||
        record.description.toLowerCase().includes(term.toLowerCase());

      const matchesType = !filters.type || record.type.toLowerCase().includes(filters.type.toLowerCase());
      const matchesDoctor = !filters.doctor || record.doctor.toLowerCase().includes(filters.doctor.toLowerCase());
      const matchesDateRange = (!filters.dateFrom || record.date >= filters.dateFrom) &&
                              (!filters.dateTo || record.date <= filters.dateTo);

      return matchesSearch && matchesType && matchesDoctor && matchesDateRange;
    });
    
    setFilteredRecords(filtered);
  };

  const handleDownload = (documentName: string) => {
    // In a real application, this would trigger a document download
    console.log(`Downloading ${documentName}`);
  };

  const applySearchFromHistory = (historicalTerm: string) => {
    setSearchTerm(historicalTerm);
    handleSearch(historicalTerm);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      dateFrom: "",
      dateTo: "",
      doctor: ""
    });
    handleSearch(searchTerm);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Health Records</h1>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
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
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Record Type</label>
                  <Input
                    placeholder="Filter by type..."
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  />
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
                <Button onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
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
            <Card key={record.id} className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{record.type}</span>
                  <span className="text-sm text-muted-foreground">{record.date}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
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
