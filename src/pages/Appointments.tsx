
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import Layout from "@/components/Layout";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: "2024-03-20",
    time: "10:00 AM",
    doctor: "Dr. Smith",
    type: "General Checkup",
    status: "upcoming"
  },
  {
    id: "2",
    date: "2024-03-18",
    time: "2:30 PM",
    doctor: "Dr. Johnson",
    type: "Follow-up",
    status: "completed"
  }
];

const Appointments = () => {
  const [appointments] = useState<Appointment[]>(mockAppointments);

  const handleReschedule = (id: string) => {
    console.log(`Rescheduling appointment ${id}`);
  };

  const handleCancel = (id: string) => {
    console.log(`Cancelling appointment ${id}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <Button>
            Book New Appointment
          </Button>
        </div>

        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{appointment.type}</span>
                  <span className={`text-sm ${
                    appointment.status === "upcoming" ? "text-primary" :
                    appointment.status === "completed" ? "text-green-500" :
                    "text-red-500"
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.doctor}</span>
                    </div>
                  </div>
                  {appointment.status === "upcoming" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReschedule(appointment.id)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
