export default function _logError(error: unknown, message: string): void {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorCode = (error as any)?.code || "Unknown";
  const errorStack = error instanceof Error ? error.stack : "No stack trace";
  console.error(`❌ ${message}:`, {
    message: errorMessage,
    code: errorCode,
    stack: errorStack,
    originalError: error,
  });
}
