import { createFileRoute } from "@tanstack/react-router";
import { PixelReveal } from "@/components/PixelReveal";
import hero from "@/assets/hero-desk.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE ONE DAY — Engineer, maker, beginner again" },
      { name: "description", content: "A full stack engineer's journal of systems built, sketches restarted, poses rebuilt and stories read — one day at a time." },
      { property: "og:title", content: "THE ONE DAY" },
      { property: "og:description", content: "You don't need the perfect moment. You just need to begin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const work = [
  {
    no: "01",
    name: "Sportsdunia",
    kind: "Football news & live scores",
    body: "Frontend architecture, backend systems and real-time match broadcasting for a sports platform — plus the unglamorous parts: SEO, infrastructure and performance work.",
    tags: ["Next.js", "Node.js", "Real-time", "Redis", "AWS", "Cloudflare", "SEO"],
  },
  {
    no: "02",
    name: "JoinJumbo",
    kind: "Identity & rewards backend",
    body: "Identity verification workflows, PostgreSQL data models, API design and a configurable campaign / reward system.",
    tags: ["PostgreSQL", "API design", "TypeScript", "Docker"],
  },
];

const journal = [
  { tag: "Sketching", note: "Picking up the pencil after ~10 years. The first lines are wobbly. That's the point.", state: "restarting" },
  { tag: "Paper & origami", note: "Folds, layers, cardboard. Hands remembering slowly.", state: "restarting" },
  { tag: "Yoga", note: "Some asanas still there. Rebuilding the rest gradually.", state: "rebuilding" },
  { tag: "Photography", note: "Mostly my native place, for now. More places as I go.", state: "ongoing" },
];

const shelf = [
  "Solo Leveling", "The Beginning After the End", "Nano Machine", "Legend of the Northern Blade",
  "Omniscient Reader's Viewpoint", "SSS-Class Suicide Hunter", "Magic Emperor", "Volcanic Age",
];
const favs = new Set(shelf.slice(0, 4));
const watched = ["Naruto", "Hunter x Hunter", "Fullmetal Alchemist", "Haikyuu", "Death Note", "Berserk", "Kingdom", "Samurai Champloo", "Code Geass", "Baby Steps"];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 font-mono text-xs uppercase tracking-widest">
        <span>The One Day</span>
        <nav className="flex gap-6">
          <a href="#engineering" className="hover:text-vermilion">Engineering</a>
          <a href="#journal" className="hover:text-vermilion">Journal</a>
          <a href="#archive" className="hover:text-vermilion">Archive</a>
          <a href="#contact" className="hover:text-vermilion">Contact</a>
        </nav>
      </header>

      {/* 01 Hero */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            maskImage:
              "radial-gradient(ellipse 95% 120% at 90% 65%, #000 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 95% 120% at 90% 65%, #000 60%, transparent 100%)",
          }}
        >
          <PixelReveal src={hero} alt="Desk with a sketchbook, origami crane, camera, manga and a laptop showing code" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-background via-background/70 to-transparent lg:w-3/5" />
        <div className="pointer-events-none mx-auto flex min-h-[100svh] max-w-7xl items-center px-6 py-24">
          <div className="max-w-xl">
            <Label>Day 001 · Full stack engineer</Label>
            <h1 className="relative mt-4 font-script text-[clamp(4.5rem,11vw,9rem)] leading-[0.85]">
              The One
              <br />
              Day
              <svg viewBox="0 0 300 30" className="absolute -bottom-4 left-0 w-3/4 text-vermilion" fill="none">
                <path className="draw-path" pathLength={1} d="M4 20 C 80 6, 160 28, 296 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </h1>
            <p className="mt-12 max-w-md font-serif text-3xl leading-tight">
              You don't need the perfect moment. <em className="text-vermilion">You just need to begin.</em>
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              I build software for a living. This is also where I document picking up the pencil, the paper, the mat and the camera again.
            </p>
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-8 right-6 font-mono text-[11px] text-muted-foreground">fig. 1 — 1,000 pixels, each on its own schedule · move your cursor</p>
      </section>

      {/* 02 Engineering */}
      <section id="engineering" className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-6xl md:text-7xl">Engineering<span className="text-vermilion">.</span></h2>
            <p className="font-mono text-xs uppercase tracking-widest opacity-60">~3 years · production systems</p>
          </div>
          <div className="mt-16 space-y-px">
            {work.map((w) => (
              <article key={w.name} className="group grid gap-6 border-t border-primary-foreground/15 py-10 md:grid-cols-12">
                <span className="font-mono text-sm opacity-50 md:col-span-1">{w.no}</span>
                <div className="md:col-span-4">
                  <h3 className="font-serif text-4xl transition-colors group-hover:text-vermilion">{w.name}</h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-widest opacity-60">{w.kind}</p>
                </div>
                <p className="leading-relaxed opacity-80 md:col-span-4">{w.body}</p>
                <ul className="flex flex-wrap content-start gap-2 md:col-span-3">
                  {w.tags.map((t) => (
                    <li key={t} className="border border-primary-foreground/25 px-2 py-1 font-mono text-[11px]">{t}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-10 font-mono text-xs opacity-60">
            stack → JavaScript · TypeScript · React · Next.js · Node.js · PostgreSQL · Redis · Docker · AWS · Cloudflare
          </p>
        </div>
      </section>

      {/* 03 Manifesto */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <p className="font-serif text-[clamp(2rem,5vw,4rem)] leading-tight">
          One line. One pose. One photograph.
          <br />
          <span className="italic text-muted-foreground">One problem solved.</span> One day at a time.
        </p>
      </section>

      {/* 04 Journal */}
      <section id="journal" className="grid-paper border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Label>The other 40% · honest progress</Label>
          <h2 className="mt-3 font-serif text-6xl">Beginning again</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {journal.map((j, i) => (
              <div
                key={j.tag}
                className="bg-card p-6 shadow-md"
                style={{ transform: `rotate(${[-1.5, 1, -0.5, 2][i]}deg) translateY(${[0, 24, 8, 32][i]}px)` }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-vermilion">{j.state}</p>
                <h3 className="mt-2 font-serif text-3xl">{j.tag}</h3>
                <p className="mt-3 font-script text-xl leading-snug text-muted-foreground">{j.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Reading archive */}
      <section id="archive" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label>Reading log · since Famous Five</Label>
            <h2 className="mt-3 font-serif text-6xl">The shelf</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Books in school, anime in college, manhwa after Solo Leveling. Kept like a library card, not a fan page.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ol className="divide-y divide-border border-y border-border">
              {shelf.map((t, i) => (
                <li key={t} className="flex items-baseline justify-between py-3">
                  <span className="flex gap-6">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(3, "0")}</span>
                    <span className="font-serif text-2xl">{t}</span>
                  </span>
                  {favs.has(t) && <span className="font-script text-lg text-vermilion">favourite</span>}
                </li>
              ))}
            </ol>
            <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
              watched → {watched.join(" · ")} …
            </p>
          </div>
        </div>
      </section>

      {/* 06 Contact */}
      <footer id="contact" className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-6 py-20">
          <h2 className="font-script text-7xl">Let's begin something.</h2>
          <a href="mailto:hello@example.com" className="font-mono text-sm underline decoration-vermilion underline-offset-4">
            hello@example.com
          </a>
        </div>
        <p className="pb-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          The One Day © 2026 · handcrafted with code & curiosity
        </p>
      </footer>
    </main>
  );
}
