'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  clearUserPreferences,
  HEALTH_INTERESTS,
  type UserPreferences 
} from '@/lib/user-preferences';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPreferences(getUserPreferences());
  }, []);

  const toggleInterest = (id: string) => {
    const updated = {
      ...preferences,
      interests: preferences.interests.includes(id)
        ? preferences.interests.filter(i => i !== id)
        : [...preferences.interests, id],
    };
    setPreferences(updated);
  };

  const handleSave = () => {
    saveUserPreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all preferences?')) {
      clearUserPreferences();
      window.location.href = '/';
    }
  };

  const conditions = HEALTH_INTERESTS.filter(i => i.category === 'condition');
  const topics = HEALTH_INTERESTS.filter(i => i.category === 'topic');
  const lifestyle = HEALTH_INTERESTS.filter(i => i.category === 'lifestyle');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Settings</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              Your Health Preferences
            </h2>
          </div>

          <div className="space-y-6 border rounded-lg p-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Health Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {conditions.map(interest => (
                  <Badge
                    key={interest.id}
                    variant={preferences.interests.includes(interest.id) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleInterest(interest.id)}
                  >
                    {interest.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Health Topics</Label>
              <div className="flex flex-wrap gap-2">
                {topics.map(interest => (
                  <Badge
                    key={interest.id}
                    variant={preferences.interests.includes(interest.id) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleInterest(interest.id)}
                  >
                    {interest.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Lifestyle & Wellness</Label>
              <div className="flex flex-wrap gap-2">
                {lifestyle.map(interest => (
                  <Badge
                    key={interest.id}
                    variant={preferences.interests.includes(interest.id) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleInterest(interest.id)}
                  >
                    {interest.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-6">
            <Label className="text-base font-semibold block">Reading Level</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'simple', label: 'Simple', desc: 'Plain language' },
                { value: 'moderate', label: 'Balanced', desc: 'Mix of detail' },
                { value: 'technical', label: 'Technical', desc: 'Research-focused' },
              ].map(option => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    preferences.readingLevel === option.value
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-border hover:border-emerald-300'
                  }`}
                  onClick={() => setPreferences({ ...preferences, readingLevel: option.value as any })}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button variant="destructive" onClick={handleReset}>
              Reset All Preferences
            </Button>
            <Button onClick={handleSave} disabled={saved}>
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
