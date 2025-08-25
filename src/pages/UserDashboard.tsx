
import React from "react";
import SEO from "@/components/SEO";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

import { UserDashboard } from "@/components/UserDashboard";

const UserDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <ResponsiveLayout>
        <SEO 
          title="User Dashboard | AS Agents" 
          description="Your user account and security dashboard" 
        />
        <UserDashboard />
      </ResponsiveLayout>
    </div>
  );
};

export default UserDashboardPage;
