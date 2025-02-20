
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, FileText } from "lucide-react";

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
}) => (
  <Card className="p-6 animate-slide-in">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-semibold mt-2">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </Card>
);

const ActivityItem = ({
  title,
  description,
  date,
}: {
  title: string;
  description: string;
  date: string;
}) => (
  <div className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{date}</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your health information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Next Appointment"
            value="Mar 24, 2024"
            subtitle="Dr. Sarah Johnson - General Checkup"
            icon={Calendar}
          />
          <DashboardCard
            title="Recent Records"
            value="3"
            subtitle="New records this month"
            icon={FileText}
          />
          <DashboardCard
            title="Pending Documents"
            value="2"
            subtitle="Documents awaiting review"
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-1">
              <ActivityItem
                title="Medical Certificate Generated"
                description="For absence due to fever"
                date="Today, 2:30 PM"
              />
              <ActivityItem
                title="Appointment Scheduled"
                description="General checkup with Dr. Johnson"
                date="Yesterday"
              />
              <ActivityItem
                title="Prescription Updated"
                description="Allergy medication renewed"
                date="Mar 20, 2024"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Health Reminders</h3>
            <div className="space-y-4">
              {[
                {
                  title: "Annual Physical Examination",
                  date: "Due in 2 weeks",
                },
                {
                  title: "Vaccination Booster",
                  date: "Due next month",
                },
                {
                  title: "Eye Checkup",
                  date: "Overdue by 2 weeks",
                },
              ].map((reminder) => (
                <div
                  key={reminder.title}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {reminder.title}
                    </h4>
                    <p className="text-sm text-gray-600">{reminder.date}</p>
                  </div>
                  <button className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    Schedule
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
