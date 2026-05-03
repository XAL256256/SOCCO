import { toast } from "sonner";

const DEMO_TOAST_ID = "demo-mode";

/**
 * POST helper that recognises our `demoReadOnly` envelope and
 * surfaces a single, consistent investor-friendly toast.
 *
 * Returns `true` when the call should be considered "successful enough"
 * for the UI to optimistically close a modal/dialog, even though no
 * mutation actually persisted.
 */
export async function demoMutate(
  url: string,
  init: RequestInit & { successLabel?: string }
): Promise<boolean> {
  try {
    const { successLabel = "Saved", ...rest } = init;
    const res = await fetch(url, rest);
    const data = await res.json().catch(() => ({}) as { demo?: boolean; error?: string });

    if (!res.ok) {
      toast.error(data?.error ?? "Request failed");
      return false;
    }

    if (data?.demo) {
      toast(`Demo mode · ${successLabel.toLowerCase()} (not persisted)`, {
        id: DEMO_TOAST_ID,
        description: "Connect a database to enable writes.",
      });
    } else {
      toast.success(successLabel);
    }
    return true;
  } catch {
    toast.error("Network error");
    return false;
  }
}
