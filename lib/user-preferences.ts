export interface HealthInterest {
  id: string;
  label: string;
  category: 'condition' | 'topic' | 'lifestyle';
}

export interface UserPreferences {
  interests: string[]; // IDs of selected HealthInterest items
  conditions: string[]; // Specific health conditions
  readingLevel: 'simple' | 'moderate' | 'technical';
  frequency: 'daily' | 'weekly' | 'asNeeded';
  onboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  conditions: [],
  readingLevel: 'moderate',
  frequency: 'daily',
  onboarded: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const HEALTH_INTERESTS: HealthInterest[] = [
  // Conditions
  { id: 'diabetes', label: 'Diabetes', category: 'condition' },
  { id: 'heart-disease', label: 'Heart Disease', category: 'condition' },
  { id: 'cancer', label: 'Cancer', category: 'condition' },
  { id: 'alzheimers', label: "Alzheimer's & Dementia", category: 'condition' },
  { id: 'arthritis', label: 'Arthritis', category: 'condition' },
  { id: 'mental-health', label: 'Mental Health', category: 'condition' },
  
  // Topics
  { id: 'nutrition', label: 'Nutrition & Diet', category: 'topic' },
  { id: 'exercise', label: 'Exercise & Fitness', category: 'topic' },
  { id: 'sleep', label: 'Sleep Health', category: 'topic' },
  { id: 'preventive-care', label: 'Preventive Care', category: 'topic' },
  { id: 'medications', label: 'Medications & Treatments', category: 'topic' },
  { id: 'aging', label: 'Healthy Aging', category: 'topic' },
  
  // Lifestyle
  { id: 'weight-management', label: 'Weight Management', category: 'lifestyle' },
  { id: 'stress-management', label: 'Stress Management', category: 'lifestyle' },
  { id: 'womens-health', label: "Women's Health", category: 'lifestyle' },
  { id: 'mens-health', label: "Men's Health", category: 'lifestyle' },
  { id: 'family-health', label: 'Family & Child Health', category: 'lifestyle' },
  { id: 'alternative-medicine', label: 'Alternative Medicine', category: 'lifestyle' },
];

const STORAGE_KEY = 'health-informer-preferences';

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return;
  
  const current = getUserPreferences();
  const updated = {
    ...current,
    ...preferences,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearUserPreferences(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasCompletedOnboarding(): boolean {
  return getUserPreferences().onboarded;
}
