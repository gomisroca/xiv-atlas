import processItem from "@/utils/image-optimize";
import { getActions, preloadNextPage } from "@/utils/queries/actions";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { job } = params;
    const cursor = url.searchParams.get("cursor");

    if (!job) {
      return new Response(
        JSON.stringify({ error: "Job parameter is required" }),
        {
          status: 400,
        },
      );
    }

    const data = await getActions(job, cursor || undefined);
    // Process all images in parallel
    const optimizedResults = await Promise.all(data.results.map(processItem));
    // Create the response with optimized data
    const optimizedData = {
      ...data,
      results: optimizedResults,
    };

    // If we got data and there's a next cursor, preload the next page
    if (data.next) {
      preloadNextPage(job, data.next).catch(console.error);
    }

    return new Response(JSON.stringify(optimizedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
};
