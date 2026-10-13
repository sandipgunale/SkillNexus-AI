import { useEffect, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  streamCareerCoach,
} from "../../services/careerCoach/careerCoachService";

function CareerCoachPage() {
  const [conversationId] = useState(() =>
    crypto.randomUUID()
  );

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I’m your SkillNexus AI Career Coach. Ask me about your resume, skills, interview preparation, or what you should work on next.",
    },
  ]);

  const [question, setQuestion] = useState("");

  const [isStreaming, setIsStreaming] =
    useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isStreaming) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedQuestion,
    };

    const assistantMessageId =
      crypto.randomUUID();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      },
    ]);

    setQuestion("");
    setIsStreaming(true);

    try {
      await streamCareerCoach({
        question: trimmedQuestion,
        conversationId,

        onChunk: (chunk) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content:
                      message.content + chunk,
                  }
                : message
            )
          );
        },
      });
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                role: "error",
                content:
                  error?.message ||
                  "I couldn't process that request. Please try again.",
              }
            : message
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f6f3]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-white/[0.07]">
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="flex items-start justify-between gap-6">

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#95d600]">
                Career Intelligence
              </p>

              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#f4f6f3] sm:text-3xl">
                Career Coach
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Have a conversation with SkillNexus AI
                about your technical profile and
                preparation.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#95d600]" />

              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
                AI Coach
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          WORKSPACE
      ===================================================== */}

      <main className="mx-auto flex min-h-[calc(100vh-170px)] max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-7">

        <section className="flex min-h-[650px] flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#080a08]">

          {/* =================================================
              CONVERSATION HEADER
          ================================================= */}

          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                Conversation
              </p>

              <p className="mt-1 text-xs text-white/45">
                Career preparation session
              </p>
            </div>

            <span className="text-[10px] text-white/20">
              Context-aware
            </span>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">

            <div className="mx-auto max-w-4xl space-y-8">

              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                />
              ))}

              {isStreaming &&
                messages.at(-1)?.role ===
                  "assistant" &&
                !messages.at(-1)?.content && (
                  <TypingIndicator />
                )}

              <div ref={messagesEndRef} />

            </div>

          </div>

          {/* =================================================
              COMPOSER
          ================================================= */}

          <div className="border-t border-white/[0.06] p-4 sm:p-5">

            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-4xl"
            >

              <div className="rounded-xl border border-white/[0.09] bg-[#050605] transition-colors focus-within:border-[#95d600]/25">

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  rows={3}
                  placeholder="Ask SkillNexus about your skills, resume, or interview preparation..."
                  className="w-full resize-none bg-transparent px-4 pt-4 text-sm leading-6 text-white/75 outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="flex items-center justify-between px-3 pb-3 pt-2">

                  <span className="hidden text-[10px] text-white/20 sm:block">
                    Enter to send · Shift + Enter for a new line
                  </span>

                  <button
                    type="submit"
                    disabled={
                      !question.trim() ||
                      isStreaming
                    }
                    className="ml-auto rounded-md bg-[#95d600] px-4 py-2.5 text-[11px] font-semibold text-[#050605] transition-colors hover:bg-[#a6ed08] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isStreaming
                      ? "Generating..."
                      : "Send"}
                  </button>

                </div>

              </div>

            </form>

          </div>

        </section>

      </main>
    </div>
  );
}

/* =========================================================
   MESSAGE
   ========================================================= */

function Message({ message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="flex justify-start">
        <div className="max-w-2xl rounded-lg border border-red-400/15 bg-red-400/[0.035] px-4 py-3">
          <p className="text-sm leading-6 text-red-300/70">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     USER
  ======================================================= */

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl rounded-xl bg-[#95d600] px-4 py-3 text-sm leading-6 text-[#050605]">
          <p className="whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     AI
  ======================================================= */

  return (
    <div className="flex justify-start">

      <div className="w-full max-w-3xl">

        {/* AI Identity */}

        <div className="mb-3 flex items-center gap-2">

          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#95d600]/15 bg-[#95d600]/[0.04] text-[9px] font-semibold text-[#95d600]">
            AI
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/25">
            SkillNexus
          </span>

        </div>

        {/* Markdown */}

        <div className="text-sm leading-7 text-white/60">

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{

              /* ---------------------------------------------
                 HEADINGS
              --------------------------------------------- */

              h1: ({ children }) => (
                <h1 className="mb-4 mt-6 text-xl font-semibold tracking-tight text-white first:mt-0">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="mb-3 mt-6 text-lg font-semibold tracking-tight text-white first:mt-0">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="mb-2 mt-5 text-base font-semibold text-white">
                  {children}
                </h3>
              ),

              h4: ({ children }) => (
                <h4 className="mb-2 mt-4 text-sm font-semibold text-white">
                  {children}
                </h4>
              ),

              /* ---------------------------------------------
                 PARAGRAPHS
              --------------------------------------------- */

              p: ({ children }) => (
                <p className="mb-4 leading-7 text-white/60 last:mb-0">
                  {children}
                </p>
              ),

              /* ---------------------------------------------
                 STRONG
              --------------------------------------------- */

              strong: ({ children }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),

              /* ---------------------------------------------
                 EMPHASIS
              --------------------------------------------- */

              em: ({ children }) => (
                <em className="italic text-white/75">
                  {children}
                </em>
              ),

              /* ---------------------------------------------
                 UNORDERED LIST
              --------------------------------------------- */

              ul: ({ children }) => (
                <ul className="mb-4 ml-1 list-disc space-y-1.5 pl-5 text-white/60">
                  {children}
                </ul>
              ),

              /* ---------------------------------------------
                 ORDERED LIST
              --------------------------------------------- */

              ol: ({ children }) => (
                <ol className="mb-4 ml-1 list-decimal space-y-1.5 pl-5 text-white/60">
                  {children}
                </ol>
              ),

              /* ---------------------------------------------
                 LIST ITEM
              --------------------------------------------- */

              li: ({ children }) => (
                <li className="pl-1 leading-7">
                  {children}
                </li>
              ),

              /* ---------------------------------------------
                 LINK
              --------------------------------------------- */

              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#95d600] underline decoration-[#95d600]/30 underline-offset-2 transition-colors hover:text-[#a6ed08]"
                >
                  {children}
                </a>
              ),

              /* ---------------------------------------------
                 BLOCKQUOTE
              --------------------------------------------- */

              blockquote: ({ children }) => (
                <blockquote className="my-4 border-l-2 border-[#95d600]/40 pl-4 text-white/45">
                  {children}
                </blockquote>
              ),

              /* ---------------------------------------------
                 HORIZONTAL RULE
              --------------------------------------------- */

              hr: () => (
                <hr className="my-6 border-white/[0.08]" />
              ),

              /* ---------------------------------------------
                 INLINE CODE
              --------------------------------------------- */

              code: ({ children }) => (
                <code className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[0.85em] text-[#b7ed4c]">
                  {children}
                </code>
              ),

              /* ---------------------------------------------
                 CODE BLOCK
              --------------------------------------------- */

              pre: ({ children }) => (
                <pre className="my-5 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#050605] p-4 font-mono text-xs leading-6 text-white/70">
                  {children}
                </pre>
              ),

              /* ---------------------------------------------
                 TABLE
              --------------------------------------------- */

              table: ({ children }) => (
                <div className="my-5 overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full min-w-[600px] border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),

              thead: ({ children }) => (
                <thead className="bg-white/[0.035]">
                  {children}
                </thead>
              ),

              tbody: ({ children }) => (
                <tbody>{children}</tbody>
              ),

              tr: ({ children }) => (
                <tr className="border-b border-white/[0.05] last:border-b-0">
                  {children}
                </tr>
              ),

              th: ({ children }) => (
                <th className="border-b border-white/[0.08] px-4 py-3 text-left text-xs font-semibold text-white">
                  {children}
                </th>
              ),

              td: ({ children }) => (
                <td className="border-r border-white/[0.04] px-4 py-3 align-top text-sm leading-6 text-white/55 last:border-r-0">
                  {children}
                </td>
              ),

              del: ({ children }) => (
                <del className="text-white/30">
                  {children}
                </del>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   TYPING INDICATOR
   ========================================================= */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">

      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#95d600]/15 bg-[#95d600]/[0.04] text-[9px] font-semibold text-[#95d600]">
        AI
      </span>

      <div className="flex items-center gap-1.5">

        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />

        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30 [animation-delay:150ms]" />

        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30 [animation-delay:300ms]" />

      </div>

      <span className="text-[10px] text-white/20">
        SkillNexus is thinking
      </span>

    </div>
  );
}

export default CareerCoachPage;