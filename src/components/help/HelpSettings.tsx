import React from 'react';
import { RotateCcw, BookOpen, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useHelp } from '@/contexts/HelpContext';
import { TourCard } from './TourCard';

export const HelpSettings: React.FC = () => {
  const { availableTours, completedTours, resetTourProgress, openHelp } = useHelp();

  const completedCount = completedTours.length;
  const totalCount = availableTours.length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Help & Learning
          </CardTitle>
          <CardDescription>
            Take guided tours to learn about features and access help resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tour Progress</p>
              <p className="text-2xl font-bold text-primary">
                {completedCount} / {totalCount}
              </p>
              <p className="text-xs text-muted-foreground">Tours completed</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openHelp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Help Center
              </Button>
              {completedCount > 0 && (
                <Button variant="outline" onClick={resetTourProgress}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Progress
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Available Tours */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Tours</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={openHelp}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">FAQs</p>
                  <p className="text-sm text-muted-foreground">Common questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <a href="mailto:support@taxpro.ng" className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Contact Support</p>
                  <p className="text-sm text-muted-foreground">Get personal help</p>
                </div>
              </a>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <a 
                href="https://docs.taxpro.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-muted-foreground">Full guides & API</p>
                </div>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
