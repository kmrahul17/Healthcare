
import React from "react";
import { Bell, Lock, User, Palette, Phone, HelpCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const settingsSections = [
  {
    icon: User,
    title: "Profile Settings",
    description: "Manage your personal information and preferences",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure your notification preferences",
  },
  {
    icon: Lock,
    title: "Privacy & Security",
    description: "Manage your security settings and privacy preferences",
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize the look and feel of your dashboard",
  },
  {
    icon: Phone,
    title: "Contact Information",
    description: "Update your contact details and emergency contacts",
  },
  {
    icon: HelpCircle,
    title: "Help & Support",
    description: "Get help and access support resources",
  },
];

const Settings = () => {
  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-primary">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {settingsSections.map((section, index) => (
            <React.Fragment key={section.title}>
              {index > 0 && <Separator />}
              <div className="flex items-start space-x-4 py-2">
                <div className="p-2 rounded-lg bg-accent">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
