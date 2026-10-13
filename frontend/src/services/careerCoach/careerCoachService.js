const TOKEN_KEY = "careermetric_access_token";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api";

/**
 * Get the currently authenticated user's JWT.
 */
function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Stream Career Coach response using Server-Sent Events.
 *
 * Important:
 * Native fetch() does not automatically use the
 * Authorization interceptor configured on Axios.
 *
 * Therefore the JWT must be attached manually.
 */
export async function streamCareerCoach({
  question,
  conversationId,
  onChunk,
}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/ai/career-coach/stream`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        question,
        conversationId,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to use Career Coach."
      );
    }

    let message =
      "Unable to stream Career Coach response.";

    try {
      const errorText = await response.text();

      if (errorText) {
        message = errorText;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error(
      "Streaming is not supported by this browser."
    );
  }

  const reader = response.body.getReader();

  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  try {
    while (true) {
      const { value, done } =
        await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      /*
       * SSE events are separated by:
       *
       * \n\n
       *
       * Example:
       *
       * data: Hello
       *
       * data: world
       */
      const events =
        buffer.split("\n\n");

      buffer =
        events.pop() || "";

      for (const event of events) {
        processSseEvent(
          event,
          onChunk
        );
      }
    }

    /*
     * Process any remaining event.
     */
    if (buffer.trim()) {
      processSseEvent(
        buffer,
        onChunk
      );
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Process one SSE event.
 */
function processSseEvent(
  event,
  onChunk
) {
  const lines =
    event.split(/\r?\n/);

  const dataLines =
    lines
      .filter((line) =>
        line.startsWith("data:")
      )
      .map((line) =>
        line
          .slice(5)
          .replace(/^ /, "")
      );

  if (!dataLines.length) {
    return;
  }

  const data =
    dataLines.join("\n");

  if (
    !data ||
    data === "[DONE]"
  ) {
    return;
  }

  onChunk(data);
}