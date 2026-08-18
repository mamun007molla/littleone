export {};

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      parameters?: Record<string, unknown>,
    ) => void;
  }
}
