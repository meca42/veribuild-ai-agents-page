import { useState } from "react";
import { User, Building2, Key, Webhook, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/PageHeader";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and organization settings" />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">
              <User size={16} className="mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="organization">
              <Building2 size={16} className="mr-2" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="api-keys">
              <Key size={16} className="mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook size={16} className="mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield size={16} className="mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="max-w-2xl bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Profile Information</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@acme.com" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Project Manager" className="mt-1" />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="organization" className="mt-6">
            <div className="max-w-2xl bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Organization Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" defaultValue="Acme Construction" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="orgAddress">Address</Label>
                  <Input id="orgAddress" defaultValue="123 Main St, Phoenix, AZ 85001" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="orgPhone">Phone</Label>
                  <Input id="orgPhone" type="tel" defaultValue="+1 (555) 987-6543" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="orgWebsite">Website</Label>
                  <Input id="orgWebsite" type="url" defaultValue="https://acme-construction.com" className="mt-1" />
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-900 mb-4">Team Members</h4>
                  <div className="space-y-3">
                    {[
                      { name: "John Doe", email: "john.doe@acme.com", role: "Admin" },
                      { name: "Sarah Chen", email: "sarah.chen@acme.com", role: "Member" },
                      { name: "Mike Johnson", email: "mike.johnson@acme.com", role: "Member" },
                    ].map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{member.name}</div>
                          <div className="text-xs text-neutral-500">{member.email}</div>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    Invite Team Member
                  </Button>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="mt-6">
            <div className="max-w-2xl bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">API Keys</h3>
                <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                  Generate New Key
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Production API Key", key: "vb_prod_••••••••••••1234", created: "2025-08-01" },
                  { name: "Development API Key", key: "vb_dev_••••••••••••5678", created: "2025-09-15" },
                ].map((apiKey, idx) => (
                  <div key={idx} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-neutral-900">{apiKey.name}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Rotate
                        </Button>
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-neutral-600 bg-neutral-50 p-2 rounded">
                      {apiKey.key}
                    </div>
                    <div className="text-xs text-neutral-500 mt-2">
                      Created: {new Date(apiKey.created).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">API Documentation</h4>
                <p className="text-sm text-blue-800">
                  View our API documentation to learn how to integrate VeriBuild into your workflows.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  View Docs
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-6">
            <div className="max-w-2xl bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Webhooks</h3>
                <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                  Add Webhook
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    url: "https://api.example.com/webhooks/veribuild",
                    events: ["rfi.created", "submittal.approved", "delivery.received"],
                    status: "active",
                  },
                ].map((webhook, idx) => (
                  <div key={idx} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-mono text-neutral-900">{webhook.url}</div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">{webhook.status}</Badge>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <h4 className="text-sm font-medium text-neutral-900 mb-2">Available Events</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                  <div>• rfi.created</div>
                  <div>• submittal.approved</div>
                  <div>• delivery.received</div>
                  <div>• issue.created</div>
                  <div>• inspection.completed</div>
                  <div>• agent.run.completed</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" className="mt-1" />
                  </div>
                  <Button className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">Two-Factor Authentication</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on macOS", location: "Phoenix, AZ", lastActive: "Current session" },
                    { device: "Safari on iPhone", location: "Phoenix, AZ", lastActive: "2 hours ago" },
                  ].map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{session.device}</div>
                        <div className="text-xs text-neutral-500">
                          {session.location} • {session.lastActive}
                        </div>
                      </div>
                      {idx > 0 && (
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
