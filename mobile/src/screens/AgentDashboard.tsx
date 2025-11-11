import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Star } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import { PetAssignmentCard } from '../components/PetAssignmentCard';
import { eachDayOfInterval, format, parseISO, isAfter } from 'date-fns';

type DayStatus = 'future' | 'none' | 'partial' | 'complete';

interface PetAssignment {
  session_id: string;
  pet_id: string;
  pet_name: string;
  pet_photo_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  activities_today: number;
  total_activities_today: number;
  day_statuses: { date: string; status: DayStatus }[];
  isLastDayToday: boolean;
  isUpcoming: boolean;
}

export default function AgentDashboard({ navigation }: any) {
  const [assignments, setAssignments] = useState<PetAssignment[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming'>('current');

  useEffect(() => {
    loadData();
  }, []);
  
  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    console.log('Loading assignments for user:', user.id);

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(profileData);

    // Load assignments
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('session_agents')
      .select(`
        *,
        sessions(
          *,
          pets(id, name, photo_url, pet_type)
        )
      `)
      .eq('fur_agent_id', user.id);
    
    console.log('=== AGENT ASSIGNMENTS DEBUG ===');
    console.log('User ID:', user.id);
    console.log('Assignments count:', data?.length || 0);
    console.log('===============================');

    if (!data || data.length === 0) {
      setAssignments([]);
      return;
    }

    // For each assignment, calculate day statuses and today's progress
    const assignmentsWithDetails = await Promise.all(
      data.map(async (item) => {
        const session = item.sessions;
        const pet = session.pets;
        
        // Get schedule times for this pet
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('id')
          .eq('pet_id', session.pet_id)
          .is('session_id', null)
          .maybeSingle();

        let totalActivitiesToday = 0;
        if (scheduleData) {
          const { data: scheduleTimes } = await supabase
            .from('schedule_times')
            .select('*')
            .eq('schedule_id', scheduleData.id);
          totalActivitiesToday = scheduleTimes?.length || 0;
        }

        // Get today's completed activities
        const { data: todayActivities } = await supabase
          .from('activities')
          .select('*')
          .eq('session_id', session.id)
          .eq('date', today);
        const activitiesCount = todayActivities?.length || 0;

        // Get all activities for this session
        const { data: allActivities } = await supabase
          .from('activities')
          .select('date')
          .eq('session_id', session.id);

        // Calculate day statuses
        const start = parseISO(session.start_date);
        const end = parseISO(session.end_date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const daysInSession = eachDayOfInterval({ start, end });

        // Count activities per day
        const activityMap = (allActivities || []).reduce((acc: any, activity: any) => {
          const date = activity.date;
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const scheduleTasksPerDay = totalActivitiesToday;

        const dayStatuses = daysInSession.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          if (isAfter(day, todayDate)) {
            return { date: dayStr, status: 'future' as const };
          }

          const completed = activityMap[dayStr] || 0;
          if (scheduleTasksPerDay === 0) {
            return {
              date: dayStr,
              status: completed > 0 ? ('complete' as const) : ('future' as const),
            };
          }
          if (completed === 0) {
            return { date: dayStr, status: 'none' as const };
          }
          if (completed < scheduleTasksPerDay) {
            return { date: dayStr, status: 'partial' as const };
          }
          return { date: dayStr, status: 'complete' as const };
        });

        const isUpcoming = isAfter(start, todayDate);
        const isLastDayToday = format(end, 'yyyy-MM-dd') === today;

        return {
          session_id: session.id,
          pet_id: session.pet_id,
          pet_name: pet?.name || 'Unknown Pet',
          pet_photo_url: pet?.photo_url || null,
          start_date: session.start_date,
          end_date: session.end_date,
          status: session.status,
          activities_today: activitiesCount,
          total_activities_today: totalActivitiesToday,
          day_statuses: dayStatuses,
          isLastDayToday,
          isUpcoming,
        };
      })
    );

    setAssignments(assignmentsWithDetails);
  };

  const currentAssignments = assignments.filter((a) => !a.isUpcoming);
  const upcomingAssignments = assignments.filter((a) => a.isUpcoming);
  const visibleAssignments = activeTab === 'current' ? currentAssignments : upcomingAssignments;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.greeting}>Welcome back! 👋</Text>
        <Text style={styles.name}>{profile?.name || 'Agent'}</Text>
        
        {/* Paw Points */}
        <View style={styles.pointsCard}>
          <Star color="#FCD34D" size={20} fill="#FCD34D" />
          <Text style={styles.pointsText}>{profile?.paw_points || 0} Paw Points</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.tabActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>
            Current ({currentAssignments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingAssignments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Assignments */}
      <View style={styles.content}>
        {visibleAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐕</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'current' ? 'No active assignments' : 'No upcoming assignments yet'}
            </Text>
            <Text style={styles.emptyText}>
              You'll see your pet assignments here once a Fur Boss assigns you!
            </Text>
          </View>
        ) : (
          visibleAssignments.map((assignment) => (
            <PetAssignmentCard
              key={assignment.session_id}
              assignment={assignment}
              onPress={() => navigation.navigate('AgentPetDetail', { sessionId: assignment.session_id })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  name: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pointsText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
