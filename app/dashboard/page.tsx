"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Calendar, Users, Gift, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddEventModal } from "@/components/admin/add-event-modal";
import { EditEventModal } from "@/components/admin/edit-event-modal";
import { ManagePrizesModal } from "@/components/admin/manage-prizes-modal";
import { AdminHeader } from "@/components/layout/admin-header";
import { formatDate } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";

type Event = {
  id: string;
  title: string;
  description: string;
  status: "running" | "upcoming" | "completed";
  start_date: string;
  end_date: string;
  created_at: string;
  image_url?: string | null;
  participant_count?: number;
  prizes_count?: number;
};

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [managingPrizesEvent, setManagingPrizesEvent] = useState<Event | null>(null);
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

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await fetchAllRows(
        supabase
          .from("events")
          .select("*, image_url")
          .order("created_at", { ascending: false })
      );

      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const [participantsResult, prizesResult] = await Promise.all([
            supabase
              .from("participants")
              .select("id", { count: "exact", head: true })
              .eq("event_id", event.id),
            supabase
              .from("prizes")
              .select("id", { count: "exact", head: true })
              .eq("event_id", event.id),
          ]);

          return {
            ...event,
            participant_count: participantsResult.count || 0,
            prizes_count: prizesResult.count || 0,
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This will also delete all associated prizes and participants.`)) {
      return;
    }

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });

      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-500">Running</Badge>;
      case "upcoming":
        return <Badge>Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const runningEvents = events.filter((e) => e.status === "running");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const completedEvents = events.filter((e) => e.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{events.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Running</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{runningEvents.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{upcomingEvents.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Total Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {events.reduce((sum, e) => sum + (e.participant_count || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add New Event
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                All Events
              </TabsTrigger>
              <TabsTrigger value="running" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                Running
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <EventsList
                events={events}
                onEdit={setEditingEvent}
                onDelete={handleDeleteEvent}
                onManagePrizes={setManagingPrizesEvent}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="running" className="mt-6">
              <EventsList
                events={runningEvents}
                onEdit={setEditingEvent}
                onDelete={handleDeleteEvent}
                onManagePrizes={setManagingPrizesEvent}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <EventsList
                events={upcomingEvents}
                onEdit={setEditingEvent}
                onDelete={handleDeleteEvent}
                onManagePrizes={setManagingPrizesEvent}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <EventsList
                events={completedEvents}
                onEdit={setEditingEvent}
                onDelete={handleDeleteEvent}
                onManagePrizes={setManagingPrizesEvent}
                getStatusBadge={getStatusBadge}
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchEvents();
        }}
      />

      {editingEvent && (
        <EditEventModal
          isOpen={!!editingEvent}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setEditingEvent(null);
            fetchEvents();
          }}
        />
      )}

      {managingPrizesEvent && (
        <ManagePrizesModal
          isOpen={!!managingPrizesEvent}
          event={managingPrizesEvent}
          onClose={() => setManagingPrizesEvent(null)}
          onSuccess={() => {
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}

function EventsList({
  events,
  onEdit,
  onDelete,
  onManagePrizes,
  getStatusBadge,
  formatDate,
}: {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string, title: string) => void;
  onManagePrizes: (event: Event) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No events found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {events.map((event) => (
        <Card key={event.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <CardTitle className="text-xl text-white">{event.title}</CardTitle>
                  {getStatusBadge(event.status)}
                  <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/10">
                    <Gift className="h-3 w-3 mr-1" />
                    {event.prizes_count || 0} {event.prizes_count === 1 ? 'Prize' : 'Prizes'}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 line-clamp-2">{event.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManagePrizes(event)}
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Gift className="h-4 w-4" />
                  Prizes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id, event.title)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4" />
                <span>{event.participant_count || 0} participants</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Gift className="h-4 w-4" />
                <span>{event.prizes_count || 0} prizes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

