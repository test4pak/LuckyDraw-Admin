"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ManagePrizesModalProps {
  isOpen: boolean;
  event: {
    id: string;
    title: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

type Prize = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
};

export function ManagePrizesModal({ isOpen, event, onClose, onSuccess }: ManagePrizesModalProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPrizes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, event.id]);

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      const data = await fetchAllRows(
        supabase
          .from("prizes")
          .select("*")
          .eq("event_id", event.id)
          .order("created_at", { ascending: true })
      );

      setPrizes(data || []);
    } catch (error: any) {
      console.error("Error fetching prizes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch prizes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setImageUrl("");
    setErrors({});
    setIsAddMode(false);
    setEditingPrize(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddMode(true);
  };

  const handleEdit = (prize: Prize) => {
    setName(prize.name);
    setDescription(prize.description);
    setCategory(prize.category || "");
    setImageUrl(prize.image_url || "");
    setEditingPrize(prize);
    setIsAddMode(true);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Prize name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!category.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      if (editingPrize) {
        const { error } = await supabase
          .from("prizes")
          .update({
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            image_url: imageUrl.trim() || null,
          })
          .eq("id", editingPrize.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Prize updated successfully!",
        });
      } else {
        const { error } = await supabase.from("prizes").insert([
          {
            event_id: event.id,
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            image_url: imageUrl.trim() || null,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Prize added successfully!",
        });
      }

      resetForm();
      fetchPrizes();
      onSuccess();
    } catch (error: any) {
      console.error("Error saving prize:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save prize. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prizeId: string, prizeName: string) => {
    if (!confirm(`Are you sure you want to delete "${prizeName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("prizes").delete().eq("id", prizeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prize deleted successfully!",
      });

      fetchPrizes();
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting prize:", error);
      toast({
        title: "Error",
        description: "Failed to delete prize. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-2xl overflow-hidden pointer-events-auto border border-slate-700 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-700 p-4 sm:p-6 flex justify-between items-center flex-shrink-0 bg-slate-900/50">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Manage Prizes</h2>
                  <p className="text-sm text-slate-400 mt-1">{event.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {isAddMode ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {editingPrize ? "Edit Prize" : "Add New Prize"}
                      </h3>
                      <Button variant="outline" size="sm" onClick={resetForm} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Cancel
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Prize Name *
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={`bg-slate-900 text-white placeholder:text-slate-500 border-slate-600 ${errors.name ? "border-red-500" : ""}`}
                        placeholder="e.g., iPhone 15 Pro"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Description *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (errors.description) setErrors({ ...errors, description: "" });
                        }}
                        className={`w-full min-h-[80px] px-3 py-2 rounded-md border bg-slate-900 text-white placeholder:text-slate-500 ${
                          errors.description ? "border-red-500" : "border-slate-600"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        placeholder="Describe the prize"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Category *
                      </label>
                      <Input
                        type="text"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          if (errors.category) setErrors({ ...errors, category: "" });
                        }}
                        className={`bg-slate-900 text-white placeholder:text-slate-500 border-slate-600 ${errors.category ? "border-red-500" : ""}`}
                        placeholder="e.g., Electronics, Cash, Vouchers"
                      />
                      {errors.category && (
                        <p className="mt-1 text-sm text-destructive">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Image URL (Optional)
                      </label>
                      <Input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="bg-slate-900 text-white placeholder:text-slate-500 border-slate-600"
                      />
                      {imageUrl && (
                        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border">
                          <Image
                            src={imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={() => {
                              toast({
                                title: "Invalid Image",
                                description: "Could not load image from URL.",
                                variant: "destructive",
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {saving ? "Saving..." : editingPrize ? "Update Prize" : "Add Prize"}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Prizes ({prizes.length})</h3>
                      <Button onClick={handleAdd} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Plus className="h-4 w-4" />
                        Add Prize
                      </Button>
                    </div>

                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-slate-400">Loading prizes...</p>
                      </div>
                    ) : prizes.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <p>No prizes yet. Click &quot;Add Prize&quot; to get started.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prizes.map((prize) => (
                          <Card key={prize.id} className="relative bg-slate-900/50 border-slate-700">
                            <CardContent className="p-4">
                              {prize.image_url && (
                                <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                                  <Image
                                    src={prize.image_url}
                                    alt={prize.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white">{prize.name}</h4>
                                  <p className="text-xs text-slate-400 mb-1">
                                    {prize.category}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(prize)}
                                    className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(prize.id, prize.name)}
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-slate-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {prize.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

