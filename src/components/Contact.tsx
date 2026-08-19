import { useState } from "react";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const AUTHOR_URL = "https://arpon-kapuria.github.io";
const GITHUB_URL = "https://github.com/arpon-kapuria/ai-space";

export function Contact() {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    function closeModal() {
        setFeedbackOpen(false);
        setMessage("");
        setStatus("idle");
    }

    async function handleSend() {
        if (!message.trim()) return;
        setStatus("sending");
        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    subject: "AI-Space Feedback",
                    message,
                    botcheck: "",
                }),
            });
            if (!res.ok) throw new Error("Request failed");
            setStatus("sent");
            setTimeout(closeModal, 1600);
        } catch {
            setStatus("error");
        }
    }

    const sendLabel =
        status === "sent" ? "Sent" :
        status === "sending" ? "Sending..." :
        status === "error" ? "Retry" :
        "Send";

    return (
        <>
            <a href= { AUTHOR_URL } target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-1 font-mono text-[11px] text-ink transition hover:border-ink hover:text-ink">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                </svg>
                Author
            </a>

            <a href={ GITHUB_URL } target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-1 font-mono text-[10px] text-ink transition hover:border-ink hover:text-ink">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58l-.01-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z" />
                </svg>
                Github
            </a>

            <button
                onClick={() => setFeedbackOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-hairline px-4 py-1 font-mono text-[10px] text-ink transition hover:border-ink hover:text-ink"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Feedback
            </button>

            {feedbackOpen && (
                <div
                onClick={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg rounded-md border border-hairline bg-panel p-6"
                    >
                        {status !== "sent" ? (
                            <>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    placeholder="Your feedback..."
                                    autoFocus
                                    className="mt-4 w-full resize-none rounded-md border border-hairline bg-panel-raised p-3 font-body text-sm font-normal leading-relaxed text-ink placeholder:text-ink-faint outline-none transition"
                                />

                                <p className="mt-4 font-display text-sm md:text-base font-normal leading-relaxed tracking-tight text-ink">
                                    Feedback are sent anonymously. No reply possible unless you leave contact info.
                                </p>

                                {status === "error" && (
                                    <p className="mt-2 font-body text-xs font-normal text-warm-red">
                                        Couldn't send — please try again.
                                    </p>
                                )}

                                <div className="mt-4 flex justify-end gap-2.5">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-md border border-warm-red-dim px-4.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-warm-red transition hover:opacity-85"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={status === "sending" || !message.trim()}
                                        className="rounded-md border border-starlight bg-starlight px-4.5 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-void-deep transition hover:opacity-85 disabled:opacity-40"
                                    >
                                        {sendLabel}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center py-6 text-center">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-starlight">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 12.5l2.5 2.5 5-5" />
                                </svg>
                                <p className="mt-4 font-display text-base font-semibold text-ink">
                                    Thanks for the feedback
                                </p>
                                <p className="mt-1 font-body text-xs text-ink-muted">
                                    Your message was sent anonymously.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}