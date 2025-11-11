# Mobile App Fixes - Comprehensive List

## Issues Identified from Screenshots

### 1. Profile Screen Header Overlap ✅
**Problem**: "Name" label overlaps with gradient header in edit mode
**Fix**: Add proper spacing (paddingTop) to content area below header

### 2. Profile Photo Upload UX ✅
**Problem**: No visual indicator for photo upload, deprecated image picker
**Fixes**:
- Add camera icon overlay on avatar
- Show remove button after upload
- Replace `MediaTypeOptions` with `MediaType`
- Apply same pattern to pet photos

### 3. Role Switcher Not Visible ✅
**Problem**: User doesn't see where/how to switch between Boss and Agent
**Fix**: Add prominent toggle button in header showing current role

### 4. Agent Dashboard - Upcoming Assignments Missing ✅
**Problem**: Future sessions don't appear in agent dashboard
**Fix**: 
- Show "Upcoming" tab/section
- Filter sessions where start_date > today
- Display in separate section from active

### 5. Spacing Consistency ✅
**Problem**: Inconsistent padding, margins across screens
**Fix**: Create standard spacing constants (like Tailwind)

---

## Implementation Plan

### Phase 1: Fix Image Picker Deprecation
```typescript
// BEFORE (deprecated):
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images, // ❌ Deprecated
});

// AFTER (correct):
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaType.Images, // ✅ Updated
});
```

### Phase 2: Profile Photo Upload UI
```typescript
// Profile avatar with camera overlay
<View style={styles.avatarContainer}>
  {profile.photo_url ? (
    <>
      <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
      <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
        <X color="#fff" size={16} />
      </TouchableOpacity>
    </>
  ) : (
    <View style={styles.avatarPlaceholder}>
      <UserRound color="#ccc" size={48} />
    </View>
  )}
  <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
    <Camera color="#fff" size={20} />
  </TouchableOpacity>
</View>
```

### Phase 3: Role Switcher in Header
```typescript
// Add to BossDashboard and AgentDashboard headers
<View style={styles.headerRight}>
  <TouchableOpacity 
    style={styles.roleSwitcher}
    onPress={switchRole}
  >
    <Text style={styles.roleText}>
      {activeRole === 'fur_boss' ? '👤 Switch to Agent' : '🐶 Switch to Boss'}
    </Text>
  </TouchableOpacity>
</View>
```

### Phase 4: Agent Dashboard Upcoming Section
```typescript
const upcomingAssignments = assignments.filter(a => {
  const today = new Date().toISOString().split('T')[0];
  return a.sessions.start_date > today;
});

// Render in separate section
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Upcoming Assignments</Text>
  {upcomingAssignments.map(renderAssignment)}
</View>
```

### Phase 5: Spacing System (Tailwind-like)
```typescript
// mobile/src/theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Usage in styles:
content: {
  paddingTop: spacing['3xl'], // 32px
  paddingHorizontal: spacing.lg, // 16px
}
```

---

## Files to Update

1. **mobile/src/screens/ProfileScreen.tsx**
   - Fix header overlap (paddingTop)
   - Add photo upload UI with camera/remove icons
   - Fix ImagePicker deprecated API

2. **mobile/src/components/AddPetModal.tsx**
   - Add camera/remove icons for pet photo
   - Fix ImagePicker deprecated API

3. **mobile/src/components/EditPetModal.tsx**
   - Same as AddPetModal

4. **mobile/src/screens/AgentDashboard.tsx**
   - Add upcoming assignments section
   - Filter by start_date
   - Add role switcher in header

5. **mobile/src/screens/BossDashboard.tsx**
   - Add role switcher in header

6. **mobile/src/theme/spacing.ts** (NEW)
   - Create spacing constants

7. **mobile/App.tsx**
   - Ensure role switcher persists and updates UI

---

## Expected Results

✅ No more header overlap  
✅ Clear photo upload UX with camera icon  
✅ Remove photo button after upload  
✅ No deprecation warnings  
✅ Visible role switcher in header  
✅ Upcoming assignments show for agents  
✅ Consistent spacing across all screens  

---

## Testing Checklist

- [ ] Profile: tap avatar → camera opens → select photo → shows with remove button
- [ ] Pet modal: same photo upload/remove flow
- [ ] No console warnings about MediaTypeOptions
- [ ] Role switcher visible and functional in both dashboards
- [ ] Agent sees upcoming assignments (future start dates)
- [ ] All screens have consistent padding/margins
- [ ] Edit mode doesn't overlap headers


