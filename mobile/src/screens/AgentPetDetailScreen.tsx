import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Dog } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import { TodayScheduleChecklist } from '../components/TodayScheduleChecklist';
import * as ImagePicker from 'expo-image-picker';
import { format, parseISO } from 'date-fns';

interface Schedule {
  id: string;
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
}

interface ScheduleTime {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
}

interface Activity {
  id: string;
  activity_type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker?: {
    name: string;
  };
  photo_url?: string;
  created_at: string;
}

interface Pet {
  id: string;
  name: string;
  photo_url: string | null;
  breed: string | null;
}

export default function AgentPetDetailScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTime[]>([]);
  const [activitiesData, setActivitiesData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<{ start_date: string; end_date: string } | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadPetAndSchedule();
    }
  }, [sessionId]);

  useFocusEffect(useCallback(() => { if (sessionId) loadPetAndSchedule(); }, [sessionId]));

  const loadPetAndSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.navigate('Auth');
        return;
      }

      // Get session and pet info
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          pet_id,
          start_date,
          end_date,
          notes,
          pets (
            id,
            name,
            photo_url,
            breed
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData?.pets) {
        setPet(sessionData.pets as Pet);
        setSessionInfo({
          start_date: sessionData.start_date,
          end_date: sessionData.end_date,
        });

        // Get schedule for this pet
        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('*')
          .eq('pet_id', sessionData.pet_id)
          .is('session_id', null)
          .maybeSingle();

        if (scheduleData) {
          setSchedule(scheduleData);

          // Get schedule times
          const { data: timesData } = await supabase
            .from('schedule_times')
            .select('*')
            .eq('schedule_id', scheduleData.id);

          if (timesData) {
            setScheduleTimes(timesData as ScheduleTime[]);
          }
        }

        // Get today's activities
        const today = new Date().toISOString().split('T')[0];
        const { data: activitiesData } = await supabase
          .from('activities')
          .select(`
            *,
            caretaker:profiles!activities_caretaker_id_fkey (
              name,
              email
            )
          `)
          .eq('session_id', sessionId)
          .eq('date', today)
          .order('created_at', { ascending: false });

        if (activitiesData) {
          setActivitiesData(activitiesData as any);
        }
      }
    } catch (error) {
      console.error('Error loading pet and schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckActivity = async (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => {
    // Ask if they want to add a photo
    Alert.alert(
      'Mark Activity Complete',
      'Would you like to add a photo?',
      [
        {
          text: 'Just Mark Done',
          onPress: () => markActivityComplete(activityType, timePeriod, null),
        },
        {
          text: 'Add Photo',
          onPress: () => pickPhotoAndMark(activityType, timePeriod),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickPhotoAndMark = async (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await markActivityComplete(activityType, timePeriod, result.assets[0].uri);
    }
  };

  const markActivityComplete = async (activityType: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening', photoUri: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let photoUrl = null;
      if (photoUri) {
        // Upload photo to Supabase Storage
        const fileExt = photoUri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `activity-photos/${fileName}`;

        const response = await fetch(photoUri);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from('activity-photos')
          .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt}`,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('activity-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('activities').insert({
        session_id: sessionId,
        pet_id: pet?.id,
        caretaker_id: user.id,
        activity_type: activityType,
        time_period: timePeriod,
        date: today,
        photo_url: photoUrl,
      });

      if (error) throw error;

      await loadPetAndSchedule();
    } catch (error) {
      console.error('Error marking activity:', error);
      Alert.alert('Error', 'Failed to mark activity complete');
    }
  };

  const handleUnmarkActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      await loadPetAndSchedule();
    } catch (error) {
      console.error('Error unmarking activity:', error);
      Alert.alert('Error', 'Failed to unmark activity');
    }
  };

  if (loading || !pet) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isLastDay = sessionInfo && sessionInfo.end_date === format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pet.name}</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollContent}>
        {/* Pet Info Card */}
        <View style={styles.petInfoCard}>
          <View style={styles.petPhotoContainer}>
            {pet.photo_url ? (
              <Image source={{ uri: pet.photo_url }} style={styles.petPhoto} />
            ) : (
              <View style={styles.petPhotoPlaceholder}>
                <Dog color={colors.secondary} size={48} />
              </View>
            )}
          </View>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            {pet.breed && <Text style={styles.petBreed}>{pet.breed}</Text>}
          </View>
        </View>

        {/* Session Info */}
        {sessionInfo && (
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoText}>
              Session: {format(parseISO(sessionInfo.start_date), 'MMM d')} - {format(parseISO(sessionInfo.end_date), 'MMM d, yyyy')}
            </Text>
          </View>
        )}

        {/* Last Day Message */}
        {isLastDay && (
          <View style={styles.lastDayCard}>
            <Text style={styles.lastDayText}>
              🥹 Last day together! Give {pet.name} extra snuggles before you go.
            </Text>
          </View>
        )}

        {/* Today's Schedule Checklist */}
        <View style={styles.checklistContainer}>
          <TodayScheduleChecklist
            scheduleTimes={scheduleTimes}
            completedActivities={activitiesData}
            onCheckActivity={handleCheckActivity}
            onUnmarkActivity={handleUnmarkActivity}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  petInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  petPhotoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  petPhoto: {
    width: '100%',
    height: '100%',
  },
  petPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sessionInfoCard: {
    padding: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 16,
  },
  sessionInfoText: {
    fontSize: 14,
    color: '#7C3AED',
    textAlign: 'center',
  },
  lastDayCard: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  lastDayText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  checklistContainer: {
    marginBottom: 24,
  },
});
