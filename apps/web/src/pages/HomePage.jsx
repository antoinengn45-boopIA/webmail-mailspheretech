import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Zap, Shield, Users, Inbox, Send, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

const HERO_IMG =
  "https://images.hostinger.com/a2b56786-ed49-4d22-ae6e-5ed4817f52c2.png";

const Nav = () => {
  const { isAuthed } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-lg">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Mail size={18} />
          </span>
          MailSphere
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/app" className="hidden sm:inline text-muted-foreground hover:text-foreground">
            {isAuthed ? "Ma boîte" : "Se connecter"}
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition active:scale-95 hover:brightness-110"
          >
            {isAuthed ? "Ouvrir" : "Créer mon adresse"} <ArrowRight size={15} />
          </Link>
        </nav>
      </div>
    </header>
  );
};

const Feature = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
    <div className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
      <Icon size={20} />
    </div>
    <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle,hsl(var(--primary)),transparent 70%)" }}
        />
        <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap size={13} className="text-[hsl(var(--accent-warm))]" /> Gratuit · Instantané · Ouvert à tous
            </span>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl font-extrabold leading-[1.02] tracking-tight">
              Crée ton adresse mail en{" "}
              <span className="text-primary">10 secondes.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Envoie et reçois des messages directement depuis le site. Une vraie
              communauté où ton adresse{" "}
              <span className="font-mono text-foreground">@mail-sphere.fr</span> est
              à toi, pour toujours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/app")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition active:scale-95 hover:brightness-110"
              >
                Créer mon adresse <ArrowRight size={17} />
              </button>
              <button
                onClick={() => navigate("/app")}
                className="rounded-full border border-border bg-card px-6 py-3 font-semibold transition hover:bg-secondary"
              >
                J'ai déjà un compte
              </button>
            </div>
          </div>
          <div className="relative flex justify-center">
            <img
              src={HERO_IMG}
              alt="Sphère de messagerie MailSphere"
              className="w-full max-w-md animate-floaty select-none"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-bold text-center">Comment ça marche</h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { i: Mail, t: "1. Choisis ton identifiant", d: "antoine, léa, dev-julie… ton adresse devient identifiant@mail-sphere.fr." },
              { i: Inbox, t: "2. Reçois tes messages", d: "Une boîte de réception claire pour lire, trier, archiver et retrouver." },
              { i: Send, t: "3. Écris à la communauté", d: "Envoie un mail à n'importe quel membre en tapant son adresse." },
            ].map((s) => (
              <Feature key={s.t} icon={s.i} title={s.t}>
                {s.d}
              </Feature>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-bold">Tout ce qu'il faut, rien de superflu</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon={Inbox} title="Boîte de réception">Lue / non lue, favoris, archive et corbeille en un clic.</Feature>
          <Feature icon={Users} title="Contacts & groupes">Ajoute des amis, organise-les par groupes pour écrire plus vite.</Feature>
          <Feature icon={Shield} title="Sécurisé">Chaque compte protégé par mot de passe, messages privés.</Feature>
          <Feature icon={Zap} title="Instantané">Les messages arrivent en temps réel, sans installation.</Feature>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 sm:p-14 text-center relative overflow-hidden">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">Ton adresse t'attend.</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto">
            Rejoins MailSphere et commence à écrire à la communauté dès maintenant.
          </p>
          <button
            onClick={() => navigate("/app")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-7 py-3 font-semibold transition active:scale-95 hover:bg-secondary"
          >
            Créer mon adresse gratuite <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-display font-bold text-foreground">MailSphere</span>
          <span>Webmail communautaire · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
