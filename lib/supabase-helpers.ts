import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetches all rows from a Supabase query by automatically paginating through results
 * This ensures we get all rows regardless of the 1000 row default limit
 */
export async function fetchAllRows<T = any>(
  query: ReturnType<SupabaseClient["from"]>["select"]
): Promise<T[]> {
  const allRows: T[] = [];
  const pageSize = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await query.range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      allRows.push(...data);
      from += pageSize;
      // If we got less than pageSize rows, we've reached the end
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  return allRows;
}

/**
 * Gets the accurate count of rows matching a query
 * This ensures we get the correct count regardless of any limits
 */
export async function getAccurateCount(
  query: ReturnType<SupabaseClient["from"]>["select"]
): Promise<number> {
  try {
    // Try the count query first (this should work and is more efficient)
    const { count, error } = await query.select("*", { count: "exact", head: true });
    
    if (!error && count !== null && count !== undefined) {
      return count;
    }
    
    // Fallback: fetch all rows and count them if count query fails
    const allRows = await fetchAllRows(query);
    return allRows.length;
  } catch (error) {
    // Fallback: fetch all rows and count them
    const allRows = await fetchAllRows(query);
    return allRows.length;
  }
}

