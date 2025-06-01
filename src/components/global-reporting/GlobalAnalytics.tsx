import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Globe, AlertTriangle, CheckCircle } from "lucide-react";

interface GlobalAnalyticsProps {
  deadlines: any[];
  reports: any[];
  compliance: any[];
  countries: string[];
}

export function GlobalAnalytics({ deadlines, reports, compliance, countries }: GlobalAnalyticsProps) {
  // Process data for charts
  const countryData = countries.map(country => {
    const countryDeadlines = deadlines.filter(d => d.country === country);
    const countryReports = reports.filter(r => r.country === country);
    const countryCompliance = compliance.filter(c => c.country === country);
    
    const urgentDeadlines = countryDeadlines.filter(d => {
      const dueDate = new Date(d.due_date);
      const now = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });

    return {
      country: country.length > 10 ? country.substring(0, 10) + '...' : country,
      fullName: country,
      deadlines: countryDeadlines.length,
      reports: countryReports.length,
      compliance: countryCompliance.length,
      urgent: urgentDeadlines.length,
      complianceRate: countryCompliance.length > 0 ? 
        Math.round((countryCompliance.filter(c => c.status === 'completed').length / countryCompliance.length) * 100) : 0
    };
  });

  const taxTypeData = reports.reduce((acc: any[], report) => {
    const existing = acc.find(item => item.type === report.tax_type);
    if (existing) {
      existing.count += 1;
      existing.amount += report.amount;
    } else {
      acc.push({
        type: report.tax_type,
        count: 1,
        amount: report.amount
      });
    }
    return acc;
  }, []);

  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthReports = reports.filter(r => {
      const reportDate = new Date(r.created_at);
      return reportDate.getMonth() === date.getMonth() && 
             reportDate.getFullYear() === date.getFullYear();
    });
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      reports: monthReports.length,
      amount: monthReports.reduce((sum, r) => sum + r.amount, 0)
    };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const overallStats = {
    totalCountries: countries.length,
    totalDeadlines: deadlines.length,
    urgentDeadlines: deadlines.filter(d => {
      const dueDate = new Date(d.due_date);
      const now = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    }).length,
    completedReports: reports.filter(r => r.status === 'completed' || r.status === 'filed').length,
    totalReports: reports.length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Countries</p>
                <p className="text-2xl font-bold">{overallStats.totalCountries}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {overallStats.totalReports > 0 ? 
                    Math.round((overallStats.completedReports / overallStats.totalReports) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Deadlines</p>
                <p className="text-2xl font-bold">{overallStats.urgentDeadlines}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{overallStats.totalReports}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deadlines by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="deadlines" fill="#8884d8" />
                <Bar dataKey="urgent" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taxTypeData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {taxTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Reporting Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Rate by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countryData.slice(0, 6).map((country, index) => (
                <div key={country.fullName} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="font-medium">{country.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${country.complianceRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-10">{country.complianceRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Country Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Country</th>
                  <th className="text-left p-2">Deadlines</th>
                  <th className="text-left p-2">Reports</th>
                  <th className="text-left p-2">Urgent</th>
                  <th className="text-left p-2">Compliance</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((country) => (
                  <tr key={country.fullName} className="border-b">
                    <td className="p-2 font-medium">{country.fullName}</td>
                    <td className="p-2">{country.deadlines}</td>
                    <td className="p-2">{country.reports}</td>
                    <td className="p-2">
                      {country.urgent > 0 ? (
                        <Badge variant="destructive">{country.urgent}</Badge>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="p-2">{country.compliance}</td>
                    <td className="p-2">
                      <Badge 
                        className={
                          country.complianceRate >= 80 ? 'bg-green-100 text-green-800' :
                          country.complianceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {country.complianceRate >= 80 ? 'Good' :
                         country.complianceRate >= 60 ? 'Attention' : 'Critical'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
