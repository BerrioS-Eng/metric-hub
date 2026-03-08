"use client";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuLayoutDashboard, LuUsersRound } from "react-icons/lu";
import { FaChartBar } from "react-icons/fa";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import UserManagement from "@/components/dashboard/UserManagement";

export default function dashboard() {
  const [activeTab, setActiveTab] = useState("income-expense");
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Main Menu</CardTitle>
            <CardDescription>
              Navigate between different sections of the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="income-expense">
                  <LuLayoutDashboard className="h-4 w-4 mr-2" />
                  Income & Expenses
                </TabsTrigger>
                <TabsTrigger value="users" disabled={!isAdmin}>
                  <LuUsersRound className="h-4 w-4 mr-2" />
                  User Management
                  {!user && " (Admin Only)"}
                </TabsTrigger>
                <TabsTrigger value="reports" disabled={!isAdmin}>
                  <FaChartBar className="h-4 w-4 mr-2" />
                  Reports
                  {!user && " (Admin Only)"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="income-expense" className="mt-6">
                
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <UserManagement />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <p>Reports Content</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};