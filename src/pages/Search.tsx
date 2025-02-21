
import React, { useState } from "react";
import { Search as SearchIcon, History, BookmarkCheck, Filter, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const recentSearches = [
  "Medical reports 2024",
  "Prescriptions",
  "Lab results",
  "Appointments history",
];

const savedSearches = [
  "Important documents",
  "Urgent care visits",
  "Regular checkups",
  "Vaccination records",
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-primary">Search</h1>
        <p className="text-muted-foreground">
          Search through your medical records, appointments, and documents
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search medical records, appointments..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="h-12" variant="outline">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </Button>
        <Button className="h-12" variant="outline">
          <SortDesc className="h-5 w-5 mr-2" />
          Sort
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Recent Searches</h2>
          </div>
          <Separator />
          <ul className="space-y-3">
            {recentSearches.map((search, index) => (
              <li
                key={index}
                className="flex items-center px-4 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <span className="text-sm">{search}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Saved Searches</h2>
          </div>
          <Separator />
          <ul className="space-y-3">
            {savedSearches.map((search, index) => (
              <li
                key={index}
                className="flex items-center px-4 py-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <span className="text-sm">{search}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Search;
