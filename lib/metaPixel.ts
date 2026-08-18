export type MetaPixelData = {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  order_id?: string;
};

export function trackMetaEvent(eventName: string, data?: MetaPixelData) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return false;
  }

  window.fbq("track", eventName, data || {});

  console.log(`Meta Pixel ${eventName} fired`, data);

  return true;
}
