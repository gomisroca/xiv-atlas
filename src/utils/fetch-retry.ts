import pRetry, { AbortError } from "p-retry";

export default async function fetchRetry(url: string, options?: RequestInit) {
  const retryOptions = {
    retries: 3,
    onFailedAttempt: (error: unknown) => {
      if (error instanceof AbortError) {
        console.log("Aborted");
        return;
      }
      console.error(error);
    },
  };

  try {
    return await pRetry(() => fetch(url, options), retryOptions);
  } catch (error) {
    console.error("Error fetching:", error);
    throw error;
  }
}
