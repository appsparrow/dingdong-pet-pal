import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Dog } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { format, parseISO, eachDayOfInterval, isAfter } from 'date-fns';

type DayStatus = 'future' | 'none' | 'partial' | 'complete';

interface DayStatusEntry {
  date: string;
  status: DayStatus;
}

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
  day_statuses: DayStatusEntry[];
  isLastDayToday: boolean;
  isUpcoming: boolean;
}

interface Props {
  assignment: PetAssignment;
  onPress: () => void;
}

const statusColors: Record<DayStatus, string> = {
  future: '#D1D5DB',  // gray
  none: '#EF4444',     // red
  partial: '#F97316', // orange
  complete: '#10B981', // green
};

export function PetAssignmentCard({ assignment, onPress }: Props) {
  const completionPercentage =
    assignment.total_activities_today > 0
      ? Math.round((assignment.activities_today / assignment.total_activities_today) * 100)
      : assignment.activities_today > 0
        ? 100
        : 0;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.card}
      >
        <View style={styles.content}>
          {/* Pet Photo */}
          <View style={styles.photoContainer}>
            {assignment.pet_photo_url ? (
              <Image source={{ uri: assignment.pet_photo_url }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Dog color={colors.secondary} size={32} />
              </View>
            )}
          </View>

          {/* Pet Info */}
          <View style={styles.info}>
            {/* Name and Status */}
            <View style={styles.header}>
              <Text style={styles.petName} numberOfLines={1}>{assignment.pet_name}</Text>
              <View style={[styles.statusBadge, assignment.status === 'active' ? styles.statusActive : styles.statusPlanned]}>
                <Text style={styles.statusText}>{assignment.status.toUpperCase()}</Text>
              </View>
            </View>

            {/* Session Dates */}
            <View style={styles.dateRow}>
              <Calendar color={colors.textSecondary} size={14} />
              <Text style={styles.dateText}>
                {format(parseISO(assignment.start_date), 'MMM d')} - {format(parseISO(assignment.end_date), 'MMM d, yyyy')}
              </Text>
            </View>

            {/* Progress Dots */}
            <View style={styles.dotsContainer}>
              <View style={styles.dots}>
                {assignment.day_statuses.slice(0, 14).map((entry, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      { backgroundColor: statusColors[entry.status] }
                    ]}
                  />
                ))}
                {assignment.day_statuses.length > 14 && (
                  <Text style={styles.moreText}>+{assignment.day_statuses.length - 14}</Text>
                )}
              </View>
              <Text style={styles.legendText}>
                🔴 Nothing • 🟠 Partial • 🟢 Complete
              </Text>
            </View>

            {/* Today's Progress */}
            {assignment.total_activities_today > 0 && !assignment.isUpcoming && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Today's Tasks</Text>
                  <Text style={styles.progressCount}>
                    {assignment.activities_today}/{assignment.total_activities_today}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#34D399', '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
                  />
                </View>
              </View>
            )}

            {/* Last Day Message */}
            {assignment.isLastDayToday && (
              <View style={styles.lastDayBanner}>
                <Text style={styles.lastDayText}>
                  🥹 Last day with {assignment.pet_name}! Leave it sparkling clean.
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    borderRadius: 24,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    gap: 16,
  },
  photoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.primary + '20',
  },
  statusPlanned: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dotsContainer: {
    marginBottom: 12,
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  lastDayBanner: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  lastDayText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
});

