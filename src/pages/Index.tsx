import { Calendar, Users, FileText, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const MetricCard = ({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  icon: any;
  className: string;
}) => (
  <div className={`rounded-xl p-6 text-white ${className}`}>
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-medium opacity-80">{title}</h3>
    <p className="mt-1 text-3xl font-semibold">{value}</p>
  </div>
);

const ActivityItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4">
    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
    <p className="text-gray-600">{text}</p>
  </div>
);

const DeadlineItem = ({ date, text }: { date: string; text: string }) => (
  <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-4">
    <Calendar className="h-5 w-5 text-red-500" />
    <div>
      <p className="font-medium text-gray-900">{text}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John</h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your clients today.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Upcoming Deadlines"
          value="5"
          icon={Calendar}
          className="bg-blue-500"
        />
        <MetricCard
          title="Active Clients"
          value="24"
          icon={Users}
          className="bg-green-500"
        />
        <MetricCard
          title="Documents Pending"
          value="12"
          icon={FileText}
          className="bg-yellow-500"
        />
        <MetricCard
          title="Compliance Alerts"
          value="3"
          icon={AlertCircle}
          className="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <ActivityItem text="Local File updated for Client A" />
            <ActivityItem text="New benchmark analysis completed" />
            <ActivityItem text="Transfer pricing documentation reviewed" />
            <ActivityItem text="Compliance check completed for Client B" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Upcoming Deadlines
          </h2>
          <div className="space-y-4">
            <DeadlineItem
              date="March 31"
              text="Master File submission"
            />
            <DeadlineItem
              date="April 15"
              text="Local File preparation"
            />
            <DeadlineItem
              date="April 30"
              text="Quarterly compliance review"
            />
            <DeadlineItem
              date="May 15"
              text="Annual tax filing"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;