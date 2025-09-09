import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Server, Lock, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const PrivacyNotice = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy-First Knowledge Management:</strong> This is a self-hosted, open-source application. 
          Your data is stored on your own infrastructure and never shared with third parties unless you explicitly enable external features.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" />
              Self-Hosted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your data stays on your server. No external data collection or tracking by default.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" />
              End-to-End Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Row-level security ensures you can only access your own data. Optional local encryption available.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Full Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Open source code means you can review exactly how your data is handled and stored.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Your Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Export your data anytime. Delete everything with one click. You own your knowledge base.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};