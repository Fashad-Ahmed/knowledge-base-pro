import { FileText, Search, Tag, TrendingUp, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const WelcomeDashboard = () => {
  const stats = [
    { icon: FileText, label: "Total Notes", value: "24", trend: "+5 this week" },
    { icon: Tag, label: "Tags Used", value: "18", trend: "+3 new" },
    { icon: Clock, label: "Hours Logged", value: "32", trend: "This month" },
    { icon: BookOpen, label: "Categories", value: "6", trend: "Well organized" },
  ];

  const recentActivity = [
    { action: "Created", item: "Project Roadmap", time: "2 hours ago", category: "Work" },
    { action: "Updated", item: "Learning Goals", time: "1 day ago", category: "Personal" },
    { action: "Tagged", item: "Research Notes", time: "2 days ago", category: "Research" },
    { action: "Archived", item: "Old Meeting Notes", time: "3 days ago", category: "Work" },
  ];

  const quickActions = [
    { icon: FileText, label: "New Note", description: "Start writing a new note" },
    { icon: Search, label: "Search", description: "Find existing notes" },
    { icon: Tag, label: "Manage Tags", description: "Organize your tags" },
    { icon: TrendingUp, label: "Analytics", description: "View your writing stats" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-lg text-muted-foreground">
            Ready to capture your thoughts and build your knowledge base?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(({ icon: Icon, label, value, trend }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground">{trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your most common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map(({ icon: Icon, label, description }) => (
                    <Button
                      key={label}
                      variant="outline"
                      className="h-auto p-4 justify-start hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-primary mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{label}</div>
                          <div className="text-sm text-muted-foreground">{description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest knowledge work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">{activity.action}</span>{" "}
                          <span className="text-muted-foreground">{activity.item}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-accent-light to-accent-light/50 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <TrendingUp className="w-5 h-5" />
              Knowledge Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-accent-foreground/80">
              Try using consistent tags across your notes to build powerful connections. 
              Tags like #project, #learning, and #ideas help you find related content quickly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};