import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { resume } from "@/data/resume";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const { personal, experience, education, internships, projects } = resume;
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m your AI assistant for Jack. Ask about roles, impact, projects, and experiences."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const nextMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await res.json();
      if (data?.content) {
        setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      } else if (data?.error) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Sorry, error: ${data.error}` }
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, something went wrong.` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendQuick(text) {
    if (!text?.trim() || loading) return;
    const nextMessages = [...messages, { role: "user", content: text.trim() }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await res.json();
      if (data?.content) {
        setMessages((m) => [...m, { role: "assistant", content: data.content }]);
      } else if (data?.error) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Sorry, error: ${data.error}` }
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry, something went wrong.` }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{`${personal.name} — ${personal.title}`}</title>
        <meta
          name="description"
          content={`${personal.summary}`}
        />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.name}>{personal.name}</h1>
            <p className={styles.title}>{personal.title}</p>
            <p className={styles.meta}>
              <a href={`mailto:${personal.email}`}>{personal.email}</a> · {personal.phone}
            </p>
            <p className={styles.links}>
              {personal.links.website && (
                <a href={personal.links.website} target="_blank" rel="noreferrer">Website</a>
              )}
              {personal.links.github && (
                <a href={personal.links.github} target="_blank" rel="noreferrer">GitHub</a>
              )}
              {personal.links.linkedin && (
                <a href={personal.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              )}
              {personal.links.resumePdf && (
                <a href={personal.links.resumePdf} target="_blank" rel="noreferrer">PDF Resume</a>
              )}
            </p>
          </div>
        </header>

        <main className={styles.mainGrid}>
          <section className={styles.leftCol}>
            {experience?.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Experience</h2>
                {experience.map((job) => (
                  <div key={`${job.company}-${job.start}`} className={styles.entryCompact}>
                    <div className={styles.entryHeader}>
                      <h3 className={styles.entryTitle}>
                        {job.role} · {job.link ? (
                          <a href={job.link} target="_blank" rel="noreferrer">{job.company}</a>
                        ) : (
                          job.company
                        )}
                      </h3>
                      <div className={styles.entryMeta}>
                        <span>{job.location}</span>
                        <span>·</span>
                        <span>{job.start} — {job.end}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {personal.skills?.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Skills</h2>
                <ul className={styles.tagList}>
                  {personal.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className={styles.centerCol}>
            <div className={`${styles.card} ${styles.chat}` }>
              <h2 className={styles.sectionTitle}>AI Jack Bot</h2>
              {!hasUserMessage && !loading && (
                <div className={styles.quickActions}>
                  <button
                    type="button"
                    className={styles.quickButton}
                    onClick={() => {
                      const company = typeof window !== "undefined" ? window.prompt("Enter a company name") : "";
                      const q = company && company.trim()
                        ? `How would Jack fit into ${company.trim()}?`
                        : "How would Jack fit into our company?";
                      sendQuick(q);
                    }}
                  >
                    How would Jack fit into (company)?
                  </button>
                  <button
                    type="button"
                    className={styles.quickButton}
                    onClick={() => sendQuick("What did Jack do at StarStock?")}
                  >
                    What did Jack do at StarStock?
                  </button>
                  <button
                    type="button"
                    className={styles.quickButton}
                    onClick={() => sendQuick("Tell me about Jack.")}
                  >
                    Tell me about Jack
                  </button>
                </div>
              )}
              <div ref={chatRef} className={styles.chatMessages}>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? styles.userMsg : styles.assistantMsg}>
                    {m.role === "assistant" ? (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>
                ))}
                {loading && <div className={styles.assistantMsg}>Thinking…</div>}
              </div>
              <form onSubmit={sendMessage} className={styles.chatInputRow}>
                <input
                  className={styles.chatInput}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about roles, projects, impact…"
                />
                <button className={styles.chatSend} disabled={loading || !input.trim()}>
                  Send
                </button>
              </form>
            </div>
          </section>

          <section className={styles.rightCol}>
            <div className={styles.cardRow}>
            {projects?.length > 0 && (
                <div className={`${styles.card} ${styles.compact}`}>
                <h2 className={styles.sectionTitle}>Projects</h2>
                {projects.map((p) => (
                  <div key={p.name} className={styles.entryCompact}>
                      <h3 className={`${styles.entryTitle} ${styles.singleLine}`}>
                      {p.link ? (
                        <a href={p.link} target="_blank" rel="noreferrer">{p.name}</a>
                      ) : (
                        p.name
                      )}
                    </h3>
                    {p.description && (
                      <div className={styles.entryMeta}>{p.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {internships?.length > 0 && (
                <div className={`${styles.card} ${styles.compact}`}>
                <h2 className={styles.sectionTitle}>Internships</h2>
                {internships.map((it) => (
                  <div key={it.company} className={styles.entryCompact}>
                    <h3 className={styles.entryTitle}>
                        {it.role ? (
                          <>
                            {it.role}
                            <span> · </span>
                          </>
                        ) : null}
                        {it.link ? (
                        <a href={it.link} target="_blank" rel="noreferrer">{it.company}</a>
                      ) : (
                        it.company
                      )}
                    </h3>
                    <div className={styles.entryMeta}>
                      <span>{it.location}</span>
                      <span>·</span>
                      <span>{it.start}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

              {education?.length > 0 && (
                <div className={`${styles.card} ${styles.compact}`}>
                  <h2 className={styles.sectionTitle}>Education</h2>
                  {education.map((ed) => (
                    <div key={ed.school} className={styles.entryCompact}>
                      <h3 className={styles.entryTitle}>
                        {ed.link ? (
                          <a href={ed.link} target="_blank" rel="noreferrer">{ed.school}</a>
                        ) : (
                          ed.school
                        )}
                      </h3>
                      <div className={styles.entryMeta}>
                        <span>{ed.degree}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} {personal.name}</span>
        </footer>
      </div>
    </>
  );
}
