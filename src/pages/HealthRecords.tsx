
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Calendar, Search } from "lucide-react";
import Layout from "@/components/Layout";

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  doctor: string;
  description: string;
  documents: string[];
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = records.filter(record => 
      record.type.toLowerCase().includes(term.toLowerCase()) ||
      record.doctor.toLowerCase().includes(term.toLowerCase()) ||
      record.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const handleDownload = (documentName: string) => {
    // In a real application, this would trigger a document download
    console.log(`Downloading ${documentName}`);
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
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Filter by Date
          </Button>
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
