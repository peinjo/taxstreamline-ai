
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface DeadlineItem {
  id: number;
  title: string;
  due_date: string;
  status: string;
  country: string;
  priority: string;
  tax_type: string;
  created_at: string;
}

interface ComplianceItem {
  id: number;
  title: string;
  requirement_type: string;
  status: string;
  country: string;
  frequency: string;
  description: string;
  next_due_date: string;
  created_at: string;
}

interface GlobalWorldMapProps {
  deadlines: DeadlineItem[];
  compliance: ComplianceItem[];
  countries: string[];
}

export function GlobalWorldMap({ deadlines, compliance, countries }: GlobalWorldMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Calculate country statistics
  const getCountryStats = (country: string) => {
    const countryDeadlines = deadlines.filter(d => d.country === country);
    const countryCompliance = compliance.filter(c => c.country === country);
    
    const urgentDeadlines = countryDeadlines.filter(d => {
      const dueDate = new Date(d.due_date);
      const now = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });

    const overdueDeadlines = countryDeadlines.filter(d => {
      const dueDate = new Date(d.due_date);
      const now = new Date();
      return dueDate < now;
    });

    let status = 'good';
    if (overdueDeadlines.length > 0) status = 'critical';
    else if (urgentDeadlines.length > 0) status = 'warning';

    return {
      totalDeadlines: countryDeadlines.length,
      urgentDeadlines: urgentDeadlines.length,
      overdueDeadlines: overdueDeadlines.length,
      complianceItems: countryCompliance.length,
      status
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'warning': return 'bg-yellow-500 border-yellow-600';
      case 'good': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* World Map Visualization */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simplified world map representation using country cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {countries.map((country) => {
              const stats = getCountryStats(country);
              return (
                <div
                  key={country}
                  onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedCountry === country ? 'ring-2 ring-primary' : ''
                  } ${getStatusColor(stats.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white text-sm">{country}</h3>
                    {getStatusIcon(stats.status)}
                  </div>
                  <div className="space-y-1 text-xs text-white/90">
                    <div className="flex justify-between">
                      <span>Deadlines:</span>
                      <span>{stats.totalDeadlines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Urgent:</span>
                      <span>{stats.urgentDeadlines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overdue:</span>
                      <span>{stats.overdueDeadlines}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Urgent Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Overdue Items</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Details Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {selectedCountry ? `${selectedCountry} Details` : 'Select a Country'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCountry ? (
            <div className="space-y-4">
              {(() => {
                const stats = getCountryStats(selectedCountry);
                const countryDeadlines = deadlines.filter(d => d.country === selectedCountry);
                const countryCompliance = compliance.filter(c => c.country === selectedCountry);
                
                return (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded">
                        <div className="text-2xl font-bold">{stats.totalDeadlines}</div>
                        <div className="text-sm text-muted-foreground">Total Deadlines</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded">
                        <div className="text-2xl font-bold">{stats.complianceItems}</div>
                        <div className="text-sm text-muted-foreground">Compliance Items</div>
                      </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div>
                      <h4 className="font-medium mb-2">Upcoming Deadlines</h4>
                      <div className="space-y-2">
                        {countryDeadlines.slice(0, 3).map((deadline) => (
                          <div key={deadline.id} className="p-2 border rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{deadline.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {deadline.priority}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {new Date(deadline.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compliance Requirements */}
                    <div>
                      <h4 className="font-medium mb-2">Compliance Requirements</h4>
                      <div className="space-y-2">
                        {countryCompliance.slice(0, 3).map((item) => (
                          <div key={item.id} className="p-2 border rounded text-sm">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-muted-foreground text-xs">
                              {item.frequency} • {item.requirement_type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click on a country to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
