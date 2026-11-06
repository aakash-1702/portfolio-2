// Single source of truth for every word on the site.
// Components only render this data, so updating the portfolio means editing this file.

export const site = {
  name: "Akash Dwivedi",
  shortName: "Akash",
  role: "Backend & Applied AI Engineer",
  url: "https://akashdwivedi.me",
  email: "dwivediakash1702@gmail.com",
  location: "Kanpur, India",
  resume: "/AkashResume.pdf",
  description:
    "Backend-first engineer building agent infrastructure: LLM tool calling, MCP servers, event-driven systems, queues and the databases underneath them.",
  handles: { github: "aakash-1702", leetcode: "AshenCold" },
  links: {
    github: "https://github.com/aakash-1702",
    linkedin: "https://www.linkedin.com/in/aakash49/",
    leetcode: "https://leetcode.com/u/AshenCold/",
    x: "https://x.com/im_aakash49",
    codechef: "https://www.codechef.com/users/im_aakash49",
    tuf: "https://takeuforward.org/profile/Aakash49",
  },
} as const;

export const nav = [
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "stack", label: "Stack" },
  { id: "about", label: "About" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

/** Node ids in the ChatFin architecture diagram. */
export type ArchNode =
  | "slack" | "mail" | "web" | "mcpc"
  | "bus" | "mcps"
  | "wf" | "agent"
  | "plugins"
  | "netsuite" | "sap" | "mysql";

export type Contribution = {
  id: string;
  title: string;
  body: string;
  tag: "agents" | "events" | "data" | "reliability";
  nodes: ArchNode[];
};

export const chatfin = {
  company: "ChatFin.ai",
  url: "https://chatfin.ai",
  role: "Software Developer Intern",
  period: "Sep 2026 — Present",
  blurb:
    "ChatFin is an agentic AI platform for finance teams. Its agents run real workflows such as dunning, cash application and vendor bills against ERPs, from Slack, email and chat. I work on the backend those agents run on.",
  stack: ["TypeScript", "Node.js", "Express", "MySQL", "MCP", "LLM tool calling", "Slack Bolt", "REST"],
  metrics: [
    { value: 16, suffix: "", label: "PRs merged to main, Oct–Nov 2026" },
    { value: 4, suffix: "", label: "mail providers behind one service" },
    { value: 87, suffix: "", label: "backend files made lint-clean" },
  ],
  contributions: [
    {
      id: "lazy-auth",
      title: "Lazy auth for agent tool calls",
      body: "A plugin call that needs a user login suspends in place, sends a login link, and resumes once the user signs in. Users log in only when a plugin first needs it.",
      tag: "agents",
      nodes: ["agent", "plugins", "slack"],
    },
    {
      id: "slack-events",
      title: "Event-driven Slack",
      body: "Channel and DM messages, with files, are raised on an event bus. Subscribed workflows and apps respond, and the AI agent is the fallback. Upgraded the Slack Bolt / Express layer.",
      tag: "events",
      nodes: ["slack", "bus", "wf", "agent"],
    },
    {
      id: "mcp-tools",
      title: "Tools for agents & MCP clients",
      body: "Plugins that agents call as tools and MCP clients like Claude discover through our MCP server, including a NetSuite plugin that posts vendor bills from chat by mapping a JSON-schema tool onto SuiteTalk REST.",
      tag: "agents",
      nodes: ["mcpc", "mcps", "plugins", "netsuite"],
    },
    {
      id: "mail",
      title: "Multi-provider mail service",
      body: "Re-architected the agents' email layer into one service over Gmail, Outlook, SMTP and IMAP, with named mailboxes the LLM picks as tool arguments, so one deployment serves many clients. Built the IMAP reader and mailbox routing.",
      tag: "agents",
      nodes: ["mail", "bus", "agent", "plugins"],
    },
    {
      id: "finance",
      title: "Live finance workflows",
      body: "Features and fixes in client workflows such as AR dunning on SAP Business One and cash application, including a production MySQL failure I traced to array bind parameters and fixed in the shared DB layer for every query.",
      tag: "data",
      nodes: ["wf", "plugins", "sap", "mysql"],
    },
    {
      id: "hardening",
      title: "Workflow engine hardening",
      body: "Workflow inputs now survive failed runs, and every app or workflow failure is logged with its instance and raw error. Fixed dependency vulnerabilities across the backend, MCP server and UI.",
      tag: "reliability",
      nodes: ["wf", "mcps", "plugins", "mysql"],
    },
  ] satisfies Contribution[],
};

export const freelance = {
  company: "Shiksha",
  subtitle: "Digital log management tool · freelance, remote",
  role: "Freelance Software Developer",
  period: "Nov — Dec 2025",
  stack: ["Next.js", "Node.js", "PostgreSQL", "Redis", "JWT"],
  points: [
    "Delivered a transaction & inventory platform with 12+ modular REST endpoints across sales, purchases, ledger and reporting.",
    "Automated three reporting frequencies with running-balance algorithms, cutting reconciliation effort by 70%.",
    "PostgreSQL-backed transaction and credit tracking with Redis caching and JWT auth; resolved 15+ critical bugs before delivery.",
  ],
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  period: string;
  status?: "live" | "building";
  summary: string;
  points: string[];
  stack: string[];
  metrics?: { value: string; label: string }[];
  links: { github?: string; live?: string; caseStudy?: string };
};

export const featured: Project[] = [
  {
    slug: "basecase",
    name: "BaseCase",
    tagline: "AI-powered DSA & interview prep platform",
    period: "Jan 2026 — ongoing",
    status: "live",
    summary:
      "Structured DSA practice, an in-browser IDE on a self-hosted judge, and an AI voice interviewer that listens, reasons and asks follow-ups like a real interviewer.",
    points: [
      "AI voice interviewer with RAG grounding over Qdrant embeddings and a strict 4-state FSM (idle → listening → processing → speaking) over the Web Speech API.",
      "GitHub interview mode: an LLM reads a candidate's repository and generates codebase-grounded questions.",
      "Quiz generation with the OpenAI SDK, SM-2 spaced repetition, and self-hosted Judge0 for sandboxed code execution.",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Qdrant", "OpenAI Agents SDK", "Judge0"],
    metrics: [
      { value: "1,000+", label: "users" },
      { value: "100+", label: "AI mock interviews" },
      { value: "200+", label: "problems on SM-2" },
    ],
    links: {
      github: "https://github.com/aakash-1702/basecase",
      live: "https://basecase-xi.vercel.app",
      caseStudy: "/projects/basecase",
    },
  },
  {
    slug: "queuectl",
    name: "QueueCTL",
    tagline: "A distributed job queue with no broker",
    period: "2026",
    summary:
      "A CLI job queue where Postgres is the broker. Workers claim jobs with FOR UPDATE SKIP LOCKED, so there is no Redis or RabbitMQ to run and no job is ever executed twice.",
    points: [
      "Lock-free concurrent claiming across workers with FOR UPDATE SKIP LOCKED.",
      "Workers are forked OS processes with exponential-backoff retries and a dead-letter queue for exhausted jobs.",
      "Cross-platform graceful shutdown over three channels (DB signal, IPC, SIGTERM), proven by a 5-scenario end-to-end suite including a SIGKILL crash.",
    ],
    stack: ["Node.js", "TypeScript", "PostgreSQL", "Prisma", "child_process"],
    metrics: [
      { value: "0", label: "brokers" },
      { value: "5", label: "states per job" },
      { value: "5", label: "E2E crash scenarios" },
    ],
    links: { github: "https://github.com/aakash-1702/queuectl", caseStudy: "/projects/queuectl" },
  },
  {
    slug: "pareeksha",
    name: "Pareeksha",
    tagline: "Hiring platform & candidate CRM for small teams",
    period: "2026 — building",
    status: "building",
    summary:
      "Assessments, rubric-scored subjective rounds, coding rounds and AI-assisted interviews across tech, finance and management hiring, with a lightweight candidate pipeline. A human always makes the final call.",
    points: [
      "Fully static Next.js 16 landing page with no runtime dependencies beyond React; tabs, filters and FAQ work without JavaScript.",
      "Express 5 + PostgreSQL API with a typed auth layer and DB health checks.",
    ],
    stack: ["Next.js 16", "TypeScript", "Express 5", "PostgreSQL"],
    links: { github: "https://github.com/aakash-1702/pareeksha" },
  },
];

export type MiniProject = {
  name: string;
  what: string;
  body: string;
  stack: string[];
  github: string;
  routes?: { method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; path: string; role?: string }[];
};

export const backends: MiniProject[] = [
  {
    name: "MedBackend",
    what: "Doctor appointment booking API",
    body: "Role-based backend for admins, doctors and patients: JWT auth with per-role middleware, Zod validation, per-doctor slot maps and Cloudinary uploads. Team project; I owned the backend.",
    stack: ["Express 5", "MongoDB", "Zod", "JWT"],
    github: "https://github.com/aakash-1702/medBackend",
    routes: [
      { method: "POST", path: "/patient/bookAppointment/:id", role: "patient" },
      { method: "PATCH", path: "/doctor/updateAvailability/:id", role: "doctor" },
      { method: "GET", path: "/admin/dashboardData", role: "admin" },
    ],
  },
  {
    name: "CourseTube",
    what: "Video platform backend",
    body: "YouTube-style data model for videos, comments, likes, playlists, posts and subscriptions, with JWT auth, Multer + Cloudinary uploads and paginated aggregation pipelines.",
    stack: ["Express", "MongoDB", "Mongoose", "Cloudinary"],
    github: "https://github.com/aakash-1702/CourseTube",
  },
  {
    name: "CourSera",
    what: "Course-selling API",
    body: "User and admin auth with bcrypt and cookie sessions, Zod-validated sign-up, admin-only course CRUD and per-user purchases.",
    stack: ["Express", "MongoDB", "Zod", "bcrypt"],
    github: "https://github.com/aakash-1702/CourSera",
    routes: [
      { method: "POST", path: "/api/addCourse", role: "admin" },
      { method: "PUT", path: "/api/myCourses", role: "user" },
    ],
  },
  {
    name: "eCommerce API",
    what: "Layered commerce backend",
    body: "Routes → controllers → services on Neon serverless Postgres, with express-validator input checks and JWT auth middleware.",
    stack: ["Express", "Neon Postgres", "JWT"],
    github: "https://github.com/aakash-1702/eCommerceBackend",
  },
  {
    name: "Bookstore API",
    what: "IBM backend certification project",
    body: "Modular service layers separating business logic from routing, REST conventions, consistent error handling and MongoDB schemas for books, users and orders.",
    stack: ["Node.js", "Express", "MongoDB"],
    github: "https://github.com/aakash-1702/BOOKSTORE",
  },
];

/* ------------------------------------------------------------------ */
/* Stack                                                               */
/* ------------------------------------------------------------------ */

export const stack = [
  {
    id: "ai",
    title: "Agentic & applied AI",
    note: "Giving LLMs tools they can call safely",
    accent: "ai" as const,
    items: [
      "LLM tool calling", "MCP servers & clients", "RAG", "Qdrant", "Embeddings",
      "OpenAI Agents SDK", "Google GenAI / ADK", "Voice agents (STT → LLM → TTS)", "Context engineering",
    ],
  },
  {
    id: "backend",
    title: "Backend & distributed systems",
    note: "Queues, events, auth and APIs that hold up",
    accent: "ok" as const,
    items: [
      "Node.js", "Express", "Spring Boot", "Spring Data JPA", "REST API design", "Event-driven architecture",
      "Job queues", "BullMQ", "Apache Kafka", "Slack Bolt", "JWT / OAuth2",
    ],
  },
  {
    id: "data",
    title: "Data",
    note: "Schemas first, transactions always",
    accent: "ok" as const,
    items: ["PostgreSQL", "MySQL", "Redis", "MongoDB", "Qdrant", "Prisma", "Row-level locking", "Indexing"],
  },
  {
    id: "cs",
    title: "CS fundamentals",
    note: "The part that doesn't go out of date",
    accent: "warn" as const,
    items: ["Data structures & algorithms", "System design", "Operating systems", "DBMS", "Computer networks", "OOP", "Concurrency"],
  },
  {
    id: "lang",
    title: "Languages",
    note: "",
    accent: "fg" as const,
    items: ["TypeScript", "Java", "Python", "C++", "SQL", "JavaScript", "Go (learning)"],
  },
  {
    id: "tools",
    title: "Tooling",
    note: "",
    accent: "fg" as const,
    items: ["Git", "Docker", "Vercel", "DigitalOcean", "Neon", "JUnit", "Mockito"],
  },
];

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export const timeline = [
  { when: "2023", title: "Started B.Tech CSE at PSIT, Kanpur", body: "Fell for data structures and relational databases early." },
  { when: "Oct 2025", title: "First backends", body: "CourSera, CourseTube, Bookstore: auth, data modeling and REST, built from scratch." },
  { when: "Nov 2025", title: "First client project", body: "Shipped Shiksha's transaction & inventory backend as a freelancer." },
  { when: "Jan 2026", title: "Started BaseCase", body: "Self-hosted judge, spaced repetition, then an AI voice interviewer." },
  { when: "Mar 2026", title: "Started writing", body: "Long-form posts on building a code judge and a real-time voice agent." },
  { when: "Jul 2026", title: "QueueCTL", body: "A broker-less job queue on Postgres row locks." },
  { when: "Sep 2026", title: "Joined ChatFin.ai", body: "Agent infrastructure for finance: tools, MCP, events, mail." },
  { when: "Now", title: "Learning Go by building a Redis clone", body: "Channels, shared maps, and a protocol parser, one piece at a time." },
];

export const principles = [
  { title: "Start with the data model", body: "The UI follows naturally from well-structured data." },
  { title: "Transactions aren't optional", body: "Anything touching more than one table needs atomicity." },
  { title: "Make it idempotent", body: "Seeds, retries and webhooks should be safe to run twice." },
  { title: "Deploy early", body: "Pooling, cold starts and OS quirks only show up in production." },
];

export const education = {
  school: "Pranveer Singh Institute of Technology",
  degree: "B.Tech, Computer Science & Engineering",
  period: "2023 — 2027",
  score: "79.16%",
  place: "Kanpur, India",
};

export const certifications = [
  { name: "Agentic AI Certified Foundations Associate", issuer: "Oracle" },
  { name: "Advanced RAG with Vector Databases and Retrievers", issuer: "Coursera" },
  { name: "Developing Back-End Apps with Node.js and Express", issuer: "Coursera" },
  { name: "SQL & Data Engineering Foundations", issuer: "takeUforward" },
];

export const achievements = [
  { title: "LeetCode Knight", body: "Top ~6% in contests, 900+ problems solved", href: site.links.leetcode },
  { title: "CodeChef 3★", body: "Rated competitive programmer", href: site.links.codechef },
  { title: "22nd of 500+", body: "College-level hackathon", href: undefined },
  {
    title: "HackerRank Orchestrate",
    body: "Oct 2026 AI-agent challenge: audit whether a user's data was really deleted across DBs, replicas, logs and backups",
    href: "https://github.com/aakash-1702/hackerrank-orchestrate-october26",
  },
];

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  tag: string;
  readingTime: number;
};

export const posts: Post[] = [
  {
    slug: "system-design-leetcode",
    title: "How to Build a LeetCode-Style Platform: The Real System Design Nobody Talks About",
    description:
      "A ground-up walkthrough of the judge behind BaseCase: Judge0, sandboxing, test-case design and the deployment tradeoffs.",
    date: "2026-03-22",
    tag: "system design",
    readingTime: 15,
  },
  {
    slug: "building-realtime-ai-voice-agent",
    title: "Building a Real-Time AI Voice Agent From Scratch",
    description:
      "Voice pipelines, browser speech APIs, latency budgets and the architecture behind BaseCase's AI mock interviewer.",
    date: "2026-03-09",
    tag: "ai",
    readingTime: 13,
  },
  {
    slug: "building-basecase",
    title: "Building BaseCase: A DSA Tracking Platform",
    description:
      "Designing a relational model for DSA progress, handling nested transactions, and deploying to production.",
    date: "2026-02-15",
    tag: "architecture",
    readingTime: 3,
  },
];

export const caseStudies = [
  {
    slug: "basecase",
    title: "BaseCase",
    description: "Case study: structured DSA practice, a self-hosted judge, SM-2 and a real-time AI voice interviewer.",
  },
  {
    slug: "queuectl",
    title: "QueueCTL",
    description: "Case study: a distributed job queue where Postgres row locks replace the message broker.",
  },
] as const;
