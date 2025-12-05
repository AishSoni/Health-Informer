'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  HEALTH_INTERESTS, 
  saveUserPreferences, 
  type UserPreferences 
} from '@/lib/user-preferences';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [readingLevel, setReadingLevel] = useState<'simple' | 'moderate' | 'technical'>('moderate');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'asNeeded'>('daily');

  const conditions = HEALTH_INTERESTS.filter(i => i.category === 'condition');
  const topics = HEALTH_INTERESTS.filter(i => i.category === 'topic');
  const lifestyle = HEALTH_INTERESTS.filter(i => i.category === 'lifestyle');

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    const preferences: Partial<UserPreferences> = {
      interests: selectedInterests,
      readingLevel,
      frequency,
      onboarded: true,
    };
    
    saveUserPreferences(preferences);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            Welcome to Health Informer
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Let&apos;s personalize your experience</h3>
              <p className="text-muted-foreground">
                Select the health topics and conditions you&apos;re interested in. 
                We&apos;ll use this to curate relevant news for you.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Health Conditions</Label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(interest => (
                    <Badge
                      key={interest.id}
                      variant={selectedInterests.includes(interest.id) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleInterest(interest.id)}
                    >
                      {interest.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Health Topics</Label>
                <div className="flex flex-wrap gap-2">
                  {topics.map(interest => (
                    <Badge
                      key={interest.id}
                      variant={selectedInterests.includes(interest.id) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleInterest(interest.id)}
                    >
                      {interest.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Lifestyle & Wellness</Label>
                <div className="flex flex-wrap gap-2">
                  {lifestyle.map(interest => (
                    <Badge
                      key={interest.id}
                      variant={selectedInterests.includes(interest.id) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleInterest(interest.id)}
                    >
                      {interest.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {selectedInterests.length} selected
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedInterests.length === 0}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Reading preferences</h3>
              <p className="text-muted-foreground">
                How would you like health information presented?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Content Complexity</Label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'simple', label: 'Simple & Easy', desc: 'Plain language, minimal jargon' },
                    { value: 'moderate', label: 'Balanced', desc: 'Mix of accessible and detailed info' },
                    { value: 'technical', label: 'Technical & Detailed', desc: 'Medical terminology, research-focused' },
                  ].map(option => (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        readingLevel === option.value
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-border hover:border-emerald-300'
                      }`}
                      onClick={() => setReadingLevel(option.value as any)}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Update Frequency</Label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'daily', label: 'Daily Digest', desc: 'Get updates every day' },
                    { value: 'weekly', label: 'Weekly Summary', desc: 'Prefer weekly roundups' },
                    { value: 'asNeeded', label: 'On Demand', desc: 'I\'ll check when I want' },
                  ].map(option => (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        frequency === option.value
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                          : 'border-border hover:border-emerald-300'
                      }`}
                      onClick={() => setFrequency(option.value as any)}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleComplete}>
                Get Started <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
