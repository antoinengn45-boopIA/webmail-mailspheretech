import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Inbox, Send, Star, Archive, Trash2, Users, PenSquare, LogOut,
  Search, X, ArrowLeft, UserPlus, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import pb from "@/lib/pocketbaseClient";
import { useAuth, addressOf, MAIL_DOMAIN } from "@/lib/useAuth";

/* ---------------- Auth screen ---------------- */
function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("signup");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await signup({ handle: handle.trim().toLowerCase(), displayName, password });
        toast.success("Bienvenue sur MailSphere !");
      } else {
        const id = identity.includes("@") ? identity.trim() : `${identity.trim().toLowerCase()}@${MAIL_DOMAIN}`;
        await login(id, password);
      }
    } catch (err) {
      const d = err?.response?.data;
      if (d?.handle) toast.error("Identifiant invalide ou déjà pris (3-30 car., a-z 0-9 . _ -).");
      else if (err?.status === 400) toast.error("Identifiants incorrects.");
      else toast.error(err?.message || "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary-foreground/20"><Mail size={18} /></span>
          MailSphere
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight">Ta boîte mail,<br />ouverte à tous.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-sm">Crée ton adresse @mail-sphere.fr et échange avec toute la communauté en temps réel.</p>
        </div>
        <span className="text-sm text-primary-foreground/60">Gratuit · Instantané · Sécurisé</span>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm animate-rise">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-display font-extrabold text-lg mb-8">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground"><Mail size={16} /></span>
            MailSphere
          </Link>
          <h1 className="font-display text-2xl font-bold">{mode === "signup" ? "Crée ton adresse" : "Content de te revoir"}</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {mode === "signup" ? "En 10 secondes, sans engagement." : "Connecte-toi à ta boîte mail."}
          </p>

          {mode === "signup" ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ton adresse</label>
                <div className="flex items-stretch mt-1">
                  <input className={field + " rounded-r-none"} placeholder="antoine" value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase())} required />
                  <span className="inline-flex items-center rounded-r-xl border border-l-0 border-border bg-secondary px-3 text-sm text-muted-foreground">@{MAIL_DOMAIN}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nom affiché (optionnel)</label>
                <input className={field + " mt-1"} placeholder="Antoine D." value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
                <input type="password" className={field + " mt-1"} placeholder="8 caractères min." minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Adresse ou identifiant</label>
                <input className={field + " mt-1"} placeholder="antoine" value={identity} onChange={(e) => setIdentity(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
                <input type="password" className={field + " mt-1"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
          )}

          <button disabled={busy} className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition active:scale-[0.98] hover:brightness-110 disabled:opacity-60">
            {busy ? "..." : mode === "signup" ? "Créer ma boîte mail" : "Se connecter"}
          </button>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            {mode === "signup" ? "Déjà un compte ? " : "Pas encore de compte ? "}
            <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-primary hover:underline">
              {mode === "signup" ? "Se connecter" : "Créer une adresse"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Compose ---------------- */
function Compose({ onClose, onSent, initialTo = "" }) {
  const { user } = useAuth();
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const handle = to.trim().toLowerCase().replace(`@${MAIL_DOMAIN}`, "");
      const recipient = await pb.collection("users").getFirstListItem(pb.filter("handle = {:h}", { h: handle }));
      await pb.collection("messages").create({
        sender: user.id, recipient: recipient.id, subject, body,
        isRead: false, isStarred: false, isArchived: false, isTrashed: false,
      });
      toast.success("Message envoyé !");
      onSent?.();
      onClose();
    } catch (err) {
      if (err?.status === 404) toast.error("Aucun membre avec cette adresse.");
      else toast.error("Envoi impossible.");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full bg-transparent px-4 py-3 outline-none border-b border-border";
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/40 p-0 sm:p-6" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={send}
        className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl animate-rise flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-bold">Nouveau message</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <input className={field} placeholder="À (identifiant ou adresse)" value={to} onChange={(e) => setTo(e.target.value)} required />
        <input className={field} placeholder="Objet" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="w-full bg-transparent px-4 py-3 outline-none flex-1 resize-none min-h-40" placeholder="Écris ton message…" value={body} onChange={(e) => setBody(e.target.value)} required />
        <div className="p-3 border-t border-border">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition active:scale-95 hover:brightness-110 disabled:opacity-60">
            <Send size={16} /> {busy ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Contacts panel ---------------- */
function Contacts({ user, onWrite }) {
  const [list, setList] = useState([]);
  const [handle, setHandle] = useState("");
  const [group, setGroup] = useState("");

  const load = useCallback(() => {
    pb.collection("contacts").getFullList({ sort: "groupName,created", expand: "person" }).then(setList).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    try {
      const h = handle.trim().toLowerCase().replace(`@${MAIL_DOMAIN}`, "");
      const person = await pb.collection("users").getFirstListItem(pb.filter("handle = {:h}", { h }));
      if (person.id === user.id) return toast.error("C'est toi !");
      await pb.collection("contacts").create({ owner: user.id, person: person.id, groupName: group.trim() });
      setHandle(""); setGroup("");
      toast.success("Contact ajouté");
      load();
    } catch (err) {
      if (err?.status === 404) toast.error("Membre introuvable.");
      else toast.error("Impossible d'ajouter (peut-être déjà présent).");
    }
  };

  const remove = async (id) => { await pb.collection("contacts").delete(id); load(); };

  const groups = useMemo(() => {
    const g = {};
    for (const c of list) { const k = c.groupName || "Sans groupe"; (g[k] ||= []).push(c); }
    return g;
  }, [list]);

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h2 className="font-display text-2xl font-bold mb-4">Mes contacts</h2>
      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input className="flex-1 rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40" placeholder="Identifiant de l'ami" value={handle} onChange={(e) => setHandle(e.target.value)} required />
        <input className="sm:w-40 rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40" placeholder="Groupe (optionnel)" value={group} onChange={(e) => setGroup(e.target.value)} />
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground active:scale-95"><UserPlus size={16} /> Ajouter</button>
      </form>

      {list.length === 0 && <p className="text-muted-foreground text-sm">Aucun contact pour l'instant. Ajoute tes amis par leur identifiant.</p>}
      {Object.entries(groups).map(([name, items]) => (
        <div key={name} className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{name}</h3>
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div>
                  <p className="font-medium">{c.expand?.person?.displayName || c.expand?.person?.handle}</p>
                  <p className="text-sm text-muted-foreground font-mono">{addressOf(c.expand?.person)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onWrite(addressOf(c.expand?.person))} className="text-primary hover:underline text-sm font-medium">Écrire</button>
                  <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Mailbox ---------------- */
const FOLDERS = [
  { key: "inbox", label: "Réception", icon: Inbox },
  { key: "sent", label: "Envoyés", icon: Send },
  { key: "starred", label: "Favoris", icon: Star },
  { key: "archive", label: "Archives", icon: Archive },
  { key: "trash", label: "Corbeille", icon: Trash2 },
];

function fmt(d) {
  const date = new Date(d);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function MailApp() {
  const { isAuthed, user, logout } = useAuth();
  const [folder, setFolder] = useState("inbox");
  const [view, setView] = useState("mail"); // mail | contacts
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    pb.collection("messages").getFullList({ sort: "-created", expand: "sender,recipient" })
      .then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!isAuthed) return;
    load();
    pb.collection("messages").subscribe("*", () => load());
    return () => { pb.collection("messages").unsubscribe("*"); };
  }, [isAuthed, load]);

  const filtered = useMemo(() => {
    if (!user) return [];
    let list = messages.filter((m) => {
      const mine = m.recipient === user.id;
      const sent = m.sender === user.id;
      if (folder === "trash") return m.isTrashed && (mine || sent);
      if (m.isTrashed) return false;
      if (folder === "sent") return sent;
      if (folder === "archive") return mine && m.isArchived;
      if (m.isArchived && mine) return false;
      if (folder === "starred") return m.isStarred && (mine || sent);
      if (folder === "inbox") return mine;
      return false;
    });
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((m) => (m.subject || "").toLowerCase().includes(s) || (m.body || "").toLowerCase().includes(s));
    }
    return list;
  }, [messages, folder, user, q]);

  const unread = useMemo(() => messages.filter((m) => user && m.recipient === user.id && !m.isRead && !m.isTrashed && !m.isArchived).length, [messages, user]);

  const open = async (m) => {
    setSelected(m);
    if (user && m.recipient === user.id && !m.isRead) {
      try { await pb.collection("messages").update(m.id, { isRead: true }); } catch (_) {}
    }
  };

  const patch = async (m, data) => {
    try { await pb.collection("messages").update(m.id, data); toast.success("Mis à jour"); }
    catch (_) { toast.error("Action impossible"); }
  };

  const hardDelete = async (m) => {
    try { await pb.collection("messages").delete(m.id); setSelected(null); }
    catch (_) { toast.error("Suppression impossible"); }
  };

  if (!isAuthed) return <AuthScreen />;

  const writeTo = (addr) => { setComposeTo(addr); setComposeOpen(true); };
  const isMine = (m) => user && m.recipient === user.id;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* topbar */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <Link to="/" className="flex items-center gap-2 font-display font-extrabold">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-primary text-primary-foreground"><Mail size={16} /></span>
          <span className="hidden sm:inline">MailSphere</span>
        </Link>
        <div className="flex-1 max-w-md ml-2 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="w-full rounded-full border border-border bg-secondary/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <button onClick={load} className="text-muted-foreground hover:text-foreground p-2" title="Rafraîchir"><RefreshCw size={17} /></button>
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium">{user.displayName || user.handle}</span>
          <span className="text-xs text-muted-foreground font-mono">{addressOf(user)}</span>
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-destructive p-2" title="Déconnexion"><LogOut size={17} /></button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* sidebar */}
        <aside className="w-16 sm:w-56 border-r border-border p-2 sm:p-4 flex flex-col gap-1 shrink-0">
          <button onClick={() => { setComposeTo(""); setComposeOpen(true); }} className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 sm:py-3 font-semibold text-primary-foreground transition active:scale-95 hover:brightness-110">
            <PenSquare size={17} /> <span className="hidden sm:inline">Écrire</span>
          </button>
          {FOLDERS.map((f) => {
            const active = view === "mail" && folder === f.key;
            return (
              <button key={f.key} onClick={() => { setView("mail"); setFolder(f.key); setSelected(null); }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                <f.icon size={18} /> <span className="hidden sm:inline">{f.label}</span>
                {f.key === "inbox" && unread > 0 && <span className="ml-auto rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 hidden sm:inline">{unread}</span>}
              </button>
            );
          })}
          <button onClick={() => { setView("contacts"); setSelected(null); }}
            className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${view === "contacts" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
            <Users size={18} /> <span className="hidden sm:inline">Contacts</span>
          </button>
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {view === "contacts" ? (
            <Contacts user={user} onWrite={writeTo} />
          ) : selected ? (
            <MessageView m={selected} isMine={isMine(selected)} onBack={() => setSelected(null)}
              onReply={() => writeTo(addressOf(selected.expand?.sender))} patch={patch} hardDelete={hardDelete} folder={folder} />
          ) : (
            <MessageList list={filtered} loading={loading} folder={folder} user={user} onOpen={open} patch={patch} />
          )}
        </main>
      </div>

      {composeOpen && <Compose onClose={() => setComposeOpen(false)} onSent={load} initialTo={composeTo} />}
    </div>
  );
}

function MessageList({ list, loading, folder, user, onOpen, patch }) {
  if (loading) return <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/60 animate-pulse" />)}</div>;
  if (list.length === 0) return (
    <div className="h-full grid place-items-center text-center p-10">
      <div>
        <Inbox size={40} className="mx-auto text-muted-foreground/50" />
        <p className="mt-3 font-medium">Rien ici</p>
        <p className="text-sm text-muted-foreground">Ce dossier est vide.</p>
      </div>
    </div>
  );
  return (
    <ul className="divide-y divide-border">
      {list.map((m) => {
        const mine = m.recipient === user.id;
        const person = mine ? m.expand?.sender : m.expand?.recipient;
        const unread = mine && !m.isRead && folder !== "trash";
        return (
          <li key={m.id} onClick={() => onOpen(m)}
            className={`flex items-center gap-3 px-4 sm:px-6 py-3.5 cursor-pointer transition hover:bg-secondary/50 ${unread ? "bg-primary/[0.04]" : ""}`}>
            <button onClick={(e) => { e.stopPropagation(); patch(m, { isStarred: !m.isStarred }); }} className={m.isStarred ? "text-[hsl(var(--accent-warm))]" : "text-muted-foreground/40 hover:text-muted-foreground"}>
              <Star size={17} fill={m.isStarred ? "currentColor" : "none"} />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold text-sm shrink-0">
              {(person?.displayName || person?.handle || "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`truncate ${unread ? "font-bold" : "font-medium"}`}>{folder === "sent" ? "À " : ""}{person?.displayName || person?.handle || "Inconnu"}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">{fmt(m.created)}</span>
              </div>
              <p className={`truncate text-sm ${unread ? "text-foreground" : "text-muted-foreground"}`}>
                <span className={unread ? "font-semibold" : ""}>{m.subject || "(sans objet)"}</span> — {m.body}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MessageView({ m, isMine, onBack, onReply, patch, hardDelete, folder }) {
  const person = m.expand?.sender;
  const rcpt = m.expand?.recipient;
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={16} /> Retour</button>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <h1 className="font-display text-xl sm:text-2xl font-bold mb-4">{m.subject || "(sans objet)"}</h1>
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
            {(person?.displayName || person?.handle || "?")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{person?.displayName || person?.handle}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{addressOf(person)} → {addressOf(rcpt)}</p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground shrink-0">{new Date(m.created).toLocaleString("fr-FR")}</span>
        </div>
        <p className="mt-5 whitespace-pre-wrap leading-relaxed">{m.body}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {isMine && <button onClick={() => { onReply(); }} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground active:scale-95"><Send size={15} /> Répondre</button>}
        <button onClick={() => patch(m, { isStarred: !m.isStarred })} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-medium hover:bg-secondary"><Star size={15} /> {m.isStarred ? "Retirer" : "Favori"}</button>
        {isMine && folder !== "archive" && <button onClick={() => { patch(m, { isArchived: true }); onBack(); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-medium hover:bg-secondary"><Archive size={15} /> Archiver</button>}
        {!m.isTrashed ? (
          <button onClick={() => { patch(m, { isTrashed: true }); onBack(); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-medium text-destructive hover:bg-destructive/10"><Trash2 size={15} /> Corbeille</button>
        ) : (
          <button onClick={() => hardDelete(m)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-medium text-destructive hover:bg-destructive/10"><Trash2 size={15} /> Supprimer définitivement</button>
        )}
      </div>
    </div>
  );
}
