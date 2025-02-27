export interface MedicalRecord {
    id: string;
    date: string;
    type: string;
    doctor: string;
    description: string;
    documents: string[];
    category?: string;
    selected?: boolean;
  }
  
  export interface SearchHistory {
    term: string;
    timestamp: string;
  }
  
  export interface FilterPreset {
    id: string;
    name: string;
    filters: {
      type: string;
      dateFrom: string;
      dateTo: string;
      doctor: string;
      category: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    };
  }