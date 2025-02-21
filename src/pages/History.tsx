
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, FileCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type HistoryItem = {
  type: "document" | "appointment" | "prescription";
  title: string;
  description: string;
  date: string;
  icon: React.ElementType;
};

const historyItems: HistoryItem[] = [
  {
    type: "document",
    title: "Medical Certificate Generated",
    description: "For absence due to fever",
    date: "Today, 2:30 PM",
    icon: FileText,
  },
  {
    type: "appointment",
    title: "Appointment Scheduled",
    description: "General checkup with Dr. Johnson",
    date: "Yesterday",
    icon: Calendar,
  },
  {
    type: "prescription",
    title: "Prescription Updated",
    description: "Allergy medication renewed",
    date: "Mar 20, 2024",
    icon: FileCheck,
  },
  {
    type: "document",
    title: "Lab Results Received",
    description: "Blood work analysis",
    date: "Mar 15, 2024",
    icon: FileText,
  },
  {
    type: "appointment",
    title: "Appointment Completed",
    description: "Dental checkup",
    date: "Mar 10, 2024",
    icon: Calendar,
  },
];

const History = () => {
  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-primary">History</h1>
          <p className="text-muted-foreground">
            View your medical history, past appointments, and previous treatments
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {historyItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-accent">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.title}</p>
                          <span className="text-sm text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default History;

