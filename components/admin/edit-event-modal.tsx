"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Link as LinkIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditEventModalProps {
  isOpen: boolean;
  event: {
    id: string;
    title: string;
    description: string;
    status: "running" | "upcoming" | "completed";
    start_date: string;
    end_date: string;
    image_url?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEventModal({ isOpen, event, onClose, onSuccess }: EditEventModalProps) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [status, setStatus] = useState<"running" | "upcoming" | "completed">(event?.status || "upcoming");
  const [startDate, setStartDate] = useState(event?.start_date ? event.start_date.split("T")[0] : "");
  const [endDate, setEndDate] = useState(event?.end_date ? event.end_date.split("T")[0] : "");
  const [imageUrl, setImageUrl] = useState(event?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image_url || null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("url");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prizesCount, setPrizesCount] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      // Clean up preview URL
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStatus(event.status);
      setStartDate(event.start_date.split("T")[0]);
      setEndDate(event.end_date.split("T")[0]);
      setImageUrl(event.image_url || "");
      setImagePreview(event.image_url || null);
      setImageFile(null);
      setUploadMethod("url");
      setPrizesCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [event]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageUrl(""); // Clear URL input
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
    try {
      // Check if the URL is from Supabase Storage
      // URL format: https://[project].supabase.co/storage/v1/object/public/events/events/filename.jpg
      if (!imageUrl.includes("/storage/v1/object/public/")) {
        // Not a Supabase Storage URL, skip deletion
        return;
      }

      // Extract the file path from the URL
      const urlParts = imageUrl.split("/storage/v1/object/public/");
      if (urlParts.length < 2) return;

      const pathParts = urlParts[1].split("/");
      if (pathParts.length < 2) return;

      const bucketName = pathParts[0];
      const filePath = pathParts.slice(1).join("/");

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (deleteError) {
        console.error("Error deleting old image:", deleteError);
        // Don't throw error, just log it (old image deletion is not critical)
      } else {
        console.log("Successfully deleted old image:", filePath);
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
      // Don't throw error, just log it
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from("events").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!endDate) {
      newErrors.endDate = "End date is required";
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const oldImageUrl = event?.image_url;
      let finalImageUrl = imageUrl.trim();

      // Upload image file if selected
      if (imageFile && uploadMethod === "upload") {
        // Delete old image before uploading new one
        if (oldImageUrl) {
          await deleteImageFromStorage(oldImageUrl);
        }
        
        const uploadedUrl = await uploadImageToStorage(imageFile);
        if (!uploadedUrl) {
          setLoading(false);
          return; // Error already shown in uploadImageToStorage
        }
        finalImageUrl = uploadedUrl;
      } else if (uploadMethod === "url" && imageUrl.trim() !== oldImageUrl) {
        // Image URL changed, delete old image if it was from storage
        if (oldImageUrl && oldImageUrl !== imageUrl.trim()) {
          await deleteImageFromStorage(oldImageUrl);
        }
      } else if (!imageUrl.trim() && !imageFile && oldImageUrl) {
        // Image was removed, delete old image
        await deleteImageFromStorage(oldImageUrl);
      }

      const { error: updateError } = await supabase
        .from("events")
        .update({
          title: title.trim(),
          description: description.trim(),
          status,
          start_date: startDate,
          end_date: endDate,
          image_url: finalImageUrl || null,
        })
        .eq("id", event.id);

      if (updateError) throw updateError;

      // Create additional prizes if count > 0
      if (prizesCount > 0) {
        // Get current prize count to determine starting number
        const { data: existingPrizes } = await supabase
          .from("prizes")
          .select("id")
          .eq("event_id", event.id);

        const currentPrizeCount = existingPrizes?.length || 0;

        const prizesToInsert = Array.from({ length: prizesCount }, (_, index) => ({
          event_id: event.id,
          name: `Prize ${currentPrizeCount + index + 1}`,
          description: `Description for Prize ${currentPrizeCount + index + 1}`,
          category: "General",
          image_url: null,
        }));

        const { error: prizesError } = await supabase
          .from("prizes")
          .insert(prizesToInsert);

        if (prizesError) {
          console.error("Error creating prizes:", prizesError);
          toast({
            title: "Warning",
            description: `Event updated but failed to create prizes: ${prizesError.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Event updated successfully! Added ${prizesCount} prize(s).`,
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Event updated successfully!",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              className="w-full max-w-2xl bg-slate-800 rounded-lg shadow-2xl overflow-hidden pointer-events-auto border border-slate-700 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-700 p-4 sm:p-6 flex justify-between items-center bg-slate-900/50">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Event</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Event Title *
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({ ...errors, title: "" });
                    }}
                    className={`bg-slate-900 text-white placeholder:text-slate-500 border-slate-600 ${errors.title ? "border-red-500" : ""}`}
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-destructive">{errors.title}</p>
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
                    className={`w-full min-h-[100px] px-3 py-2 rounded-md border bg-slate-900 text-white placeholder:text-slate-500 ${
                      errors.description ? "border-red-500" : "border-slate-600"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    placeholder="Enter event description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "running" | "upcoming" | "completed")}
                    className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (errors.startDate) setErrors({ ...errors, startDate: "" });
                      }}
                      className={`bg-slate-900 text-white border-slate-600 ${errors.startDate ? "border-red-500" : ""}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-destructive">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (errors.endDate) setErrors({ ...errors, endDate: "" });
                      }}
                      className={`bg-slate-900 text-white border-slate-600 ${errors.endDate ? "border-red-500" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-destructive">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Prizes Count Section */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Add More Prizes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={prizesCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPrizesCount(Math.max(0, Math.min(100, value)));
                    }}
                    className="bg-slate-900 text-white placeholder:text-slate-500 border-slate-600"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Enter the number of additional prizes to add to this event. You can edit them later.
                  </p>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Event Image
                  </label>
                  
                  {/* Upload Method Toggle */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant={uploadMethod === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUploadMethod("url");
                        setImageFile(null);
                        if (imagePreview && imagePreview.startsWith("blob:")) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setImagePreview(event.image_url || null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUploadMethod("upload");
                        setImageUrl("");
                      }}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>

                  {uploadMethod === "url" ? (
                    <div>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImagePreview(e.target.value || event?.image_url || null);
                          }}
                          className="bg-slate-900 text-white placeholder:text-slate-500 border-slate-600"
                          placeholder="https://example.com/image.jpg"
                        />
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setImageUrl("");
                              setImagePreview(null);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="mt-3 relative w-full h-48 rounded-md overflow-hidden border border-slate-600">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => {
                              toast({
                                title: "Image Error",
                                description: "Could not load image from URL.",
                                variant: "destructive",
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="image-upload-edit"
                        />
                        <label
                          htmlFor="image-upload-edit"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-600 rounded-md hover:border-slate-500 transition-colors bg-slate-900/50">
                            <Upload className="h-5 w-5 text-slate-400" />
                            <span className="text-sm text-slate-300">
                              {imageFile ? imageFile.name : "Choose image file (max 5MB)"}
                            </span>
                          </div>
                        </label>
                        {imageFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeImage}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="mt-3 relative w-full h-48 rounded-md overflow-hidden border border-slate-600">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {loading || uploadingImage ? "Updating..." : "Update Event"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

