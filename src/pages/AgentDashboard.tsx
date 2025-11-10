import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dog, CheckCircle, Camera, LogOut, Award, Calendar } from "lucide-react";

interface Profile {
  name: string;
  paw_points: number;
}

const AgentDashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("name, paw_points, role")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profileData.role === "fur_boss") {
        navigate("/boss-dashboard");
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-secondary via-secondary/90 to-accent p-6 pt-12 pb-8 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Hello</p>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.name}! 🐾
                </h1>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Paw Points */}
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Your Paw Points</p>
              <p className="text-3xl font-bold text-white">{profile?.paw_points || 0}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 mt-4">
          {/* Today's Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Today's Tasks</h2>
              <span className="text-sm text-muted-foreground">0 tasks</span>
            </div>
            <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground mb-2">No tasks today</p>
                <p className="text-sm text-muted-foreground">You're all caught up! 🎉</p>
              </CardContent>
            </Card>
          </div>

          {/* My Assignments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">My Assignments</h2>
              <button className="text-sm text-secondary font-medium">View All</button>
            </div>
            <div className="space-y-3">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center py-4">No assignments yet</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-bold mb-3">Recent Activity</h2>
            <div className="space-y-3">
              <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-mint/20 to-mint/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-mint/30 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-mint-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Welcome to DingDongDog!</p>
                    <p className="text-sm text-muted-foreground">Start earning Paw Points</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
