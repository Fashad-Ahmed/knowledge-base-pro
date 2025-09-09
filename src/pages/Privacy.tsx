import { MainLayout } from "@/components/layout/MainLayout";
import { PrivacyControls } from "@/components/privacy/PrivacyControls";
import { PrivacyNotice } from "@/components/privacy/PrivacyNotice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Privacy = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Privacy & Security</h1>
          <p className="text-muted-foreground">
            Manage your privacy settings and understand how your data is handled in this self-hosted knowledge management system.
          </p>
        </div>

        <Tabs defaultValue="notice" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notice">Privacy Information</TabsTrigger>
            <TabsTrigger value="controls">Privacy Controls</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notice" className="space-y-4">
            <PrivacyNotice />
          </TabsContent>
          
          <TabsContent value="controls" className="space-y-4">
            <PrivacyControls />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Privacy;