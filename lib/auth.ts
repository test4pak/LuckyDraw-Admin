import { createClient } from "@/lib/supabase/client";

export interface AdminUser {
  id: string;
  username: string;
  status: "active" | "inactive" | "suspended";
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
  try {
    const supabase = createClient();

    // Query the admin table
    // Use maybeSingle() first to avoid errors, then check if data exists
    const { data, error } = await supabase
      .from("admin")
      .select("id, username, password, status")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      // Check if table doesn't exist
      if (error.message?.includes("relation") || error.message?.includes("does not exist") || error.code === "42P01") {
        return {
          success: false,
          error: "Admin table not found. Please run the migration first.",
        };
      }
      // Check for RLS/permission errors
      if (error.code === "42501" || error.message?.includes("permission denied") || error.message?.includes("row-level security")) {
        return {
          success: false,
          error: "Permission denied. Please check RLS policies on the admin table.",
        };
      }
      return {
        success: false,
        error: `Database error: ${error.message || error.code || "Unknown error"}`,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    // Check if admin is active
    if (data.status !== "active") {
      return {
        success: false,
        error: "Admin account is not active",
      };
    }

    // Simple password comparison (in production, use bcrypt)
    if (data.password !== password) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    // Return admin data (without password)
    return {
      success: true,
      admin: {
        id: data.id,
        username: data.username,
        status: data.status,
      },
    };
  } catch (error: any) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed. Please try again.",
    };
  }
}

export function setAdminSession(admin: AdminUser) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_user", JSON.stringify(admin));
  }
}

export function getAdminSession(): AdminUser | null {
  if (typeof window !== "undefined") {
    const adminStr = sessionStorage.getItem("admin_user");
    if (adminStr) {
      return JSON.parse(adminStr);
    }
  }
  return null;
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_user");
  }
}

