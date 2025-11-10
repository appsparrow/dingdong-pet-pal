import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dog, Plus, Calendar, LogOut } from "lucide-react";

interface Profile {
  name: string;
  paw_points: number;
}

const BossDashboard = () => {
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

      if (profileData.role !== "fur_boss") {
        navigate("/agent-dashboard");
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
        <div className="bg-gradient-to-br from-primary via-primary/90 to-peach p-6 pt-12 pb-8 rounded-b-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Dog className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Welcome back</p>
                <h1 className="text-2xl font-bold text-white">
                  {profile?.name}! 🐕
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

          {/* Stats Pills */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap">
              <Dog className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">0 Pets</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 whitespace-nowrap">
              <Calendar className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">0 Sessions</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 mt-4">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-left shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <p className="text-white font-semibold">Add Pet</p>
              </button>
              <button className="bg-gradient-to-br from-secondary to-secondary/80 rounded-3xl p-6 text-left shadow-lg shadow-secondary/20 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-white font-semibold">New Session</p>
              </button>
            </div>
          </div>

          {/* My Pets */}
          <div>
            <h2 className="text-lg font-bold mb-3">My Pets</h2>
            <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dog className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground mb-4">No pets yet</p>
                <Button className="rounded-full bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Pet
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Care Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Care Sessions</h2>
              <button className="text-sm text-primary font-medium">View All</button>
            </div>
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center py-4">No active sessions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BossDashboard;
