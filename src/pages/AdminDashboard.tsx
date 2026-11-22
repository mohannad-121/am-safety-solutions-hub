import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileQuestion,
  FileSearch,
  FileText,
  FolderOpen,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  ListFilter,
  Lock,
  LogOut,
  Menu,
  Package,
  PenLine,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { fetchGa4Report, type Ga4Report } from "@/lib/ga4Reports";
import { Input } from "@/components/ui/input";
import { AdminSeo } from "@/components/admin/AdminSeo";
import { SeoCenter } from "@/components/admin/SeoCenter";
import {
  canEditAlt,
  canEditContent,
  canEditSeo,
  canManageMedia,
  canManageUsers,
  canPublish,
  exportCurrentViewToPdf,
  exportToCsv,
  fetchAuditLogs,
  fetchContent,
  fetchImageSlots,
  getCmsAdminUser,
  imageLiveStatus,
  publishImage,
  roleLabels,
  rollbackImage,
  saveContentRecord,
  saveImageDraft,
  remoteCmsEnabled,
  uploadCmsAsset,
  type AuditEntry,
  type CmsAdminUser,
  type CmsContentRecord,
  type CmsRole,
  type ImageSlot,
} from "@/lib/cms";

const client = supabase as unknown as SupabaseClient;

const modules = [
  "Dashboard",
  "Website Pages",
  "Products & Solutions",
  "Projects / Case Studies",
  "Training Center",
  "Resources",
  "Documents Center",
  "Articles",
  "FAQs",
  "Media Library",
  "Image Locator",
  "SEO Center",
  "Leads / Quote Requests",
  "Website Statistics",
  "Users & Roles",
  "Audit Logs",
  "Settings",
] as const;
type ModuleName = (typeof modules)[number];

const moduleIcons: Record<ModuleName, ElementType> = {
  Dashboard: LayoutDashboard,
  "Website Pages": FileText,
  "Products & Solutions": Package,
  "Projects / Case Studies": ClipboardList,
  "Training Center": BookOpen,
  Resources: FolderOpen,
  "Documents Center": FileSearch,
  Articles: PenLine,
  FAQs: FileQuestion,
  "Media Library": ImageIcon,
  "Image Locator": Camera,
  "SEO Center": Gauge,
  "Leads / Quote Requests": Users,
  "Website Statistics": BarChart3,
  "Users & Roles": UserCog,
  "Audit Logs": ShieldCheck,
  Settings,
};

type Lead = {
  id: string;
  created_at: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  email: string;
  products?: string[];
  project_location?: string | null;
  message?: string | null;
  source_path?: string | null;
  status: string;
  lead_type: string;
};

const contentTypeForModule: Partial<
  Record<ModuleName, CmsContentRecord["contentType"]>
> = {
  "Website Pages": "page",
  "Products & Solutions": "product",
  "Projects / Case Studies": "project",
  "Training Center": "training",
  Resources: "resource",
  "Documents Center": "document",
  Articles: "article",
  FAQs: "faq",
};

const modulePaths: Record<ModuleName, string> = {
  Dashboard: "/admin/dashboard",
  "Website Pages": "/admin/pages",
  "Products & Solutions": "/admin/products",
  "Projects / Case Studies": "/admin/projects",
  "Training Center": "/admin/training",
  Resources: "/admin/resources",
  "Documents Center": "/admin/documents",
  Articles: "/admin/articles",
  FAQs: "/admin/faqs",
  "Media Library": "/admin/media",
  "Image Locator": "/admin/images",
  "SEO Center": "/admin/seo",
  "Leads / Quote Requests": "/admin/leads",
  "Website Statistics": "/admin/statistics",
  "Users & Roles": "/admin/users",
  "Audit Logs": "/admin/audit",
  Settings: "/admin/settings",
};

function moduleFromLocation(pathname: string, search: string): ModuleName {
  const requested = new URLSearchParams(search).get("module");
  if (requested && modules.includes(requested as ModuleName))
    return requested as ModuleName;
  return (
    (Object.entries(modulePaths).find(
      ([, path]) => pathname === path || pathname.startsWith(`${path}/`),
    )?.[0] as ModuleName) || "Dashboard"
  );
}

function statusClass(status: string) {
  if (["published", "Live", "won", "closed"].includes(status))
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["draft", "Draft", "reviewing"].includes(status))
    return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function StatusBadge({ children }: { children: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(children)}`}
    >
      {children}
    </span>
  );
}

function Notice({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "green" | "red";
}) {
  const styles =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "red"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <div className={`rounded-md border p-3 text-sm ${styles}`}>{children}</div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<CmsAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleName>(() =>
    moduleFromLocation(location.pathname, location.search),
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [content, setContent] = useState<CmsContentRecord[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [ga4Report, setGa4Report] = useState<Ga4Report | null>(null);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [ga4Error, setGa4Error] = useState("");

  useEffect(() => {
    if (!user?.id || (activeModule !== "Dashboard" && activeModule !== "Website Statistics")) return;
    let active = true;
    setGa4Loading(true);
    void fetchGa4Report().then((report) => {
      if (active) { setGa4Report(report); setGa4Error(""); }
    }).catch((error: unknown) => {
      if (active) { setGa4Report(null); setGa4Error(error instanceof Error ? error.message : "GA4 report could not be loaded."); }
    }).finally(() => { if (active) setGa4Loading(false); });
    return () => { active = false; };
  }, [user?.id, activeModule]);

  useEffect(() => {
    let active = true;
    (async () => {
      const admin = await getCmsAdminUser();
      if (!admin) {
        navigate(
          `/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`,
          { replace: true },
        );
        return;
      }
      const [imageItems, contentItems, auditItems] = await Promise.all([
        fetchImageSlots(),
        fetchContent(),
        fetchAuditLogs(),
      ]);
      let leadItems: Lead[] = [];
      if (remoteCmsEnabled)
        try {
          const response = await client
            .from("website_leads")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(250);
          if (!response.error) leadItems = (response.data || []) as Lead[];
        } catch {
          /* Setup notice is shown when unavailable. */
        }
      if (active) {
        setUser(admin);
        setImages(imageItems);
        setContent(contentItems);
        setAudit(auditItems);
        setLeads(leadItems);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    setActiveModule(moduleFromLocation(location.pathname, location.search));
  }, [location.pathname, location.search]);

  const openModule = (name: ModuleName) => {
    setActiveModule(name);
    setMobileNavOpen(false);
    navigate(modulePaths[name]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  if (loading || !user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151a1f] text-white">
        <AdminSeo />
        <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> Loading secure
        admin...
      </div>
    );

  const Icon = moduleIcons[activeModule];
  return (
    <div className="admin-surface min-h-screen bg-[#f3f4f6] text-slate-900">
      <AdminSeo title={`AMBS Admin | ${activeModule}`} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 bg-[#151a1f] text-white transition-transform lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link to="/" className="rounded bg-white px-2 py-1">
            <img
              src="/assets/brand/ambs-logo.svg"
              alt="AM Building Solutions"
              className="h-11 w-auto"
            />
          </Link>
          <button
            className="p-2 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close admin navigation"
          >
            <X />
          </button>
        </div>
        <nav
          className="h-[calc(100vh-80px)] overflow-y-auto px-3 py-4"
          aria-label="Admin navigation"
        >
          {modules.map((name) => {
            const NavIcon = moduleIcons[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => openModule(name)}
                className={`mb-1 flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition ${activeModule === name ? "bg-[#ed1c24] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <NavIcon className="h-4 w-4 shrink-0" />
                {name}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center gap-4 px-4 md:px-6">
            <button
              type="button"
              className="rounded-md border p-2 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin navigation"
            >
              <Menu />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-[#ed1c24]">
                AMBS Content Management
              </p>
              <h1 className="truncate text-xl font-semibold md:text-2xl">
                {activeModule}
              </h1>
            </div>
            <button
              className="rounded-md border p-2 text-slate-500"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="border-t px-4 py-2 lg:hidden">
            <label className="sr-only" htmlFor="admin-module">
              Admin section
            </label>
            <select
              id="admin-module"
              value={activeModule}
              onChange={(event) => openModule(event.target.value as ModuleName)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {modules.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
            <Icon className="h-4 w-4" />
            Admin <ChevronRight className="h-3 w-3" /> {activeModule}
          </div>
          {activeModule === "Dashboard" && (
            <Dashboard
              images={images}
              content={content}
              leads={leads}
              ga4={ga4Report}
              ga4Loading={ga4Loading}
              ga4Error={ga4Error}
              setModule={openModule}
            />
          )}
          {contentTypeForModule[activeModule] && (
            <ContentCenter
              title={activeModule}
              type={contentTypeForModule[activeModule]!}
              records={content}
              setRecords={setContent}
              user={user}
              onImages={() => openModule("Image Locator")}
            />
          )}
          {activeModule === "Media Library" && (
            <MediaLibrary images={images} setModule={openModule} />
          )}
          {activeModule === "Image Locator" && (
            <ImageCenter images={images} setImages={setImages} user={user} />
          )}
          {activeModule === "SEO Center" && <SeoCenter user={user} />}
          {activeModule === "Leads / Quote Requests" && (
            <LeadsCenter leads={leads} setLeads={setLeads} />
          )}
          {activeModule === "Website Statistics" && (
            <StatisticsCenter leads={leads} ga4={ga4Report} ga4Loading={ga4Loading} ga4Error={ga4Error} />
          )}
          {activeModule === "Users & Roles" && <UsersCenter user={user} />}
          {activeModule === "Audit Logs" && <AuditCenter entries={audit} />}
          {activeModule === "Settings" && <SettingsCenter user={user} />}
        </main>
      </div>
      {mobileNavOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </div>
  );
}

function Dashboard({
  images,
  content,
  leads,
  ga4,
  ga4Loading,
  ga4Error,
  setModule,
}: {
  images: ImageSlot[];
  content: CmsContentRecord[];
  leads: Lead[];
  ga4: Ga4Report | null;
  ga4Loading: boolean;
  ga4Error: string;
  setModule: (module: ModuleName) => void;
}) {
  const ga4Value = (value?: number) => ga4 ? Number(value || 0).toLocaleString() : ga4Loading ? "Loading…" : ga4Error ? "Unavailable" : "Connect GA4";
  const stats = [
    ["Sessions today", ga4Value(ga4?.summary.sessionsToday), Activity],
    ["Active users (30 min)", ga4Value(ga4?.summary.activeUsers30m), Gauge],
    ["Quote leads", String(leads.length), Users],
    ["WhatsApp clicks (30 days)", ga4Value(ga4?.summary.whatsappClicks30d), Activity],
    [
      "Missing alt text",
      String(images.filter((image) => !image.altText.trim()).length),
      Camera,
    ],
    [
      "Pending drafts",
      String(
        content.filter((item) => item.status !== "published").length +
          images.filter((image) => image.draftImageUrl).length,
      ),
      FileText,
    ],
  ] as const;
  const actions: Array<[string, ModuleName, ElementType]> = [
    ["Add Product", "Products & Solutions", Plus],
    ["Replace Website Image", "Image Locator", Camera],
    ["Upload Resource PDF", "Resources", Upload],
    ["Add Article", "Articles", PenLine],
    ["Add FAQ", "FAQs", FileQuestion],
    ["Add Project", "Projects / Case Studies", ClipboardList],
    ["Export PDF", "Website Statistics", Printer],
    ["View Leads", "Leads / Quote Requests", Users],
  ];
  return (
    <div className="space-y-6">
      {ga4 ? <Notice tone="green">Google Analytics 4 connected. Figures were refreshed {new Date(ga4.checkedAt).toLocaleString()}.</Notice> : <Notice tone={ga4Error ? "red" : "amber"}>{ga4Loading ? "Loading live Google Analytics 4 data…" : ga4Error || "GA4 reporting is not configured yet. Website visits are still being collected in Google Analytics."}</Notice>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map(([label, value, StatIcon]) => (
          <div
            key={label}
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
          >
            <StatIcon className="h-5 w-5 text-[#ed1c24]" />
            <p className="mt-3 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map(([label, module, ActionIcon]) => (
            <button
              key={label}
              onClick={() => setModule(module)}
              className="flex items-center gap-3 rounded-md border border-slate-200 p-4 text-left text-sm font-medium hover:border-[#ed1c24] hover:bg-red-50"
            >
              <ActionIcon className="h-5 w-5 text-[#ed1c24]" />
              {label}
            </button>
          ))}
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border bg-white p-5">
          <h2 className="text-lg font-semibold">SEO health</h2>
          <div className="mt-4 grid gap-2 text-sm">
            {[
              "Public metadata and schema preserved",
              `${images.filter((item) => !item.altText).length} missing image alt text`,
              "Admin routes protected from indexing",
              "Broken-link scan available in QA commands",
            ].map((item) => (
              <p key={item} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </section>
        <section className="rounded-md border bg-white p-5">
          <h2 className="text-lg font-semibold">Recently edited content</h2>
          <div className="mt-3 divide-y">
            {content.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span>{item.title}</span>
                <StatusBadge>{item.status}</StatusBadge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ContentCenter({
  title,
  type,
  records,
  setRecords,
  user,
  onImages,
}: {
  title: string;
  type: CmsContentRecord["contentType"];
  records: CmsContentRecord[];
  setRecords: (records: CmsContentRecord[]) => void;
  user: CmsAdminUser;
  onImages: () => void;
}) {
  const [editing, setEditing] = useState<CmsContentRecord | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const items = records.filter((item) => item.contentType === type);
  const create = () =>
    setEditing({
      id: `new-${crypto.randomUUID()}`,
      contentKey: `${type}.${Date.now()}`,
      contentType: type,
      title: `New ${type}`,
      slug: "",
      status: "draft",
      draftData: { summary: "" },
      publishedData: {},
      seoData: { protected: true },
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    });
  const save = async (publish: boolean) => {
    if (!editing) return;
    try {
      let prepared = editing;
      if (type === "document" && documentFile) {
        if (!canManageMedia(user.role))
          throw new Error("Your role cannot upload documents.");
        const fileUrl = await uploadCmsAsset(documentFile, editing.contentKey);
        prepared = {
          ...editing,
          draftData: {
            ...editing.draftData,
            fileUrl,
            fileName: documentFile.name,
            fileSize: documentFile.size,
            fileType: documentFile.type,
          },
        };
      }
      if (publish && type === "document" && !prepared.draftData.fileUrl)
        throw new Error("Upload a document before publishing.");
      const next = await saveContentRecord(records, prepared, user, publish);
      setRecords(next);
      setEditing(null);
      setDocumentFile(null);
      setNotice(
        publish ? "Published successfully." : "Draft saved successfully.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    }
  };
  return (
    <section className="space-y-5">
      {notice && (
        <Notice tone={notice.includes("success") ? "green" : "amber"}>
          {notice}
        </Notice>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">{title} Manager</h2>
          <p className="text-sm text-slate-500">
            Create, duplicate, reorder, archive, preview and publish {type}{" "}
            records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onImages}>
            <Camera className="mr-2 h-4 w-4" />
            Manage images
          </Button>
          <Button
            onClick={create}
            disabled={!canEditContent(user.role)}
            className="bg-[#ed1c24] text-white hover:bg-[#c9151d]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {type}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4 font-medium">{item.title}</td>
                <td>/{item.slug}</td>
                <td>
                  <StatusBadge>{item.status}</StatusBadge>
                </td>
                <td>{item.updatedAt.slice(0, 10)}</td>
                <td className="p-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(item)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <p className="p-8 text-center text-sm text-slate-500">
            No records yet. Add the first {type}.
          </p>
        )}
      </div>
      {editing && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/65 p-3 md:p-8">
          <div className="mx-auto min-h-[80vh] max-w-6xl rounded-md bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-[#ed1c24]">
                  {type} editor
                </p>
                <h2 className="text-xl font-semibold">{editing.title}</h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="rounded border p-2"
                aria-label="Close editor"
              >
                <X />
              </button>
            </header>
            <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr_300px]">
              <aside className="space-y-2 text-sm">
                {["Content", "Images", "Documents", "SEO", "Settings"].map(
                  (tab, index) => (
                    <button
                      key={tab}
                      onClick={index === 1 ? onImages : undefined}
                      className="flex w-full items-center justify-between rounded border p-3 text-left"
                    >
                      {tab}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ),
                )}
              </aside>
              <div className="space-y-5">
                <label className="block text-sm font-medium">
                  Title
                  <Input
                    className="mt-2"
                    value={editing.title}
                    onChange={(event) =>
                      setEditing({ ...editing, title: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm font-medium">
                  Slug
                  <Input
                    className="mt-2"
                    value={editing.slug}
                    onChange={(event) =>
                      setEditing({ ...editing, slug: event.target.value })
                    }
                  />
                </label>
                <label className="block text-sm font-medium">
                  Summary
                  <textarea
                    className="mt-2 min-h-40 w-full rounded-md border p-3"
                    value={String(editing.draftData.summary || "")}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        draftData: {
                          ...editing.draftData,
                          summary: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                {type === "document" && (
                  <div className="rounded-md border border-dashed p-5">
                    <label className="block text-sm font-medium">
                      Document file
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="mt-2 block w-full text-sm"
                        onChange={(event) =>
                          setDocumentFile(event.target.files?.[0] || null)
                        }
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">
                      PDF only, maximum 12 MB. The published file remains unchanged until this draft is published.
                    </p>
                    {editing.draftData.fileName && (
                      <p className="mt-2 text-xs font-medium">
                        Current: {String(editing.draftData.fileName)}
                      </p>
                    )}
                  </div>
                )}
                <div className="rounded-md border border-dashed p-8 text-center">
                  <ImageIcon className="mx-auto text-slate-400" />
                  <p className="mt-2 text-sm">
                    Section images are managed through connected Image Slots.
                  </p>
                  <Button variant="outline" className="mt-3" onClick={onImages}>
                    Open Image Locator
                  </Button>
                </div>
              </div>
              <aside className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-semibold">Publishing</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Current status: {editing.status}
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <h3 className="font-semibold">SEO protection</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Metadata, canonical, schema and robots fields remain locked
                    unless your role permits SEO edits.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Canonical is automatically generated from the approved public URL. Wrong-domain, relative, uppercase and trailing-slash variants are rejected by the SEO audit.
                  </p>
                  <p className="mt-2 text-xs font-medium">
                    {canEditSeo(user.role)
                      ? "SEO editing permitted with audit logging."
                      : "Locked for this role."}
                  </p>
                </div>
              </aside>
            </div>
            <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t bg-white p-4">
              <Button variant="outline" onClick={() => save(false)}>
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing({ ...editing, status: "review" })}
              >
                Submit for Review
              </Button>
              <Button
                onClick={() => save(true)}
                disabled={!canPublish(user.role)}
                className="bg-[#ed1c24] text-white hover:bg-[#c9151d]"
              >
                Publish
              </Button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

function MediaLibrary({
  images,
  setModule,
}: {
  images: ImageSlot[];
  setModule: (module: ModuleName) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3 rounded-md border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Media Library</h2>
          <p className="text-sm text-slate-500">
            Approved website images, brand assets and current usage.
          </p>
        </div>
        <Button
          onClick={() => setModule("Image Locator")}
          className="bg-[#ed1c24] text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload or replace
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {images.map((slot) => (
          <article
            key={slot.id}
            className="overflow-hidden rounded-md border bg-white"
          >
            <div className="aspect-[4/3] bg-slate-100">
              <img
                src={slot.publishedImageUrl}
                alt={slot.altText}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <p className="font-medium">{slot.sectionName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {slot.pageName} / {slot.imageRole}
              </p>
              <div className="mt-3">
                <StatusBadge>{imageLiveStatus(slot)}</StatusBadge>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImageCenter({
  images,
  setImages,
  user,
}: {
  images: ImageSlot[];
  setImages: (images: ImageSlot[]) => void;
  user: CmsAdminUser;
}) {
  const [selectedId, setSelectedId] = useState(images[0]?.id || "");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState("All pages");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All usage");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = images.find((item) => item.id === selectedId) || images[0];
  const pages = [
    "All pages",
    ...Array.from(new Set(images.map((item) => item.pageName))),
  ];
  const categories = [
    "All categories",
    ...Array.from(new Set(images.map((item) => item.category))),
  ];
  const filtered = images.filter((item) => {
    const text =
      `${item.id} ${item.pageName} ${item.sectionName} ${item.imageRole} ${item.altText} ${item.sourceFile}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (page === "All pages" || item.pageName === page) &&
      (category === "All categories" || item.category === category) &&
      (status === "All usage" ||
        imageLiveStatus(item) === status ||
        (status === "Missing Alt Text" && !item.altText))
    );
  });
  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const chooseFile = (nextFile: File) => {
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setError("");
    setNotice(
      "Review desktop, tablet and mobile previews, confirm alt text, then save draft.",
    );
  };
  const updateSelected = (updates: Partial<ImageSlot>) => {
    if (!selected) return;
    setImages(
      images.map((item) =>
        item.id === selected.id ? { ...item, ...updates } : item,
      ),
    );
  };
  const saveDraft = async () => {
    if (!selected || !file) {
      setError("Choose a replacement image first.");
      return;
    }
    try {
      const next = await saveImageDraft(
        images,
        selected.id,
        file,
        user,
        selected,
      );
      setImages(next);
      setNotice("Draft image saved. The public website has not changed.");
      setError("");
      setFile(null);
      setPreview("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    }
  };
  const applyLive = async () => {
    if (!selected) return;
    try {
      const next = await publishImage(images, selected.id, user);
      setImages(next);
      setNotice(
        "Image applied successfully. Public components now use the new cache-safe URL.",
      );
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Publish failed.");
    }
  };
  const rollback = async () => {
    if (!selected) return;
    try {
      const next = await rollbackImage(images, selected.id, user);
      setImages(next);
      setNotice("Previous image restored and cache-safe URL applied.");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rollback failed.");
    }
  };
  if (!selected)
    return (
      <Notice>
        No image slots were found. Apply the CMS migration and reload.
      </Notice>
    );
  return (
    <section className="grid gap-6 2xl:grid-cols-[1fr_520px]">
      <div className="space-y-5">
        <div className="rounded-md border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Image Locator</h2>
              <p className="text-sm text-slate-500">
                Find images by page, section, role, filename, alt text or usage.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                <ListFilter className="mr-2 h-4 w-4" />
                List
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="relative md:col-span-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pictures"
                className="pl-9"
              />
            </label>
            <select
              value={page}
              onChange={(event) => setPage(event.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              {pages.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
            >
              {["All usage", "Live", "Draft", "Missing Alt Text", "Broken"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </div>
        </div>
        <div
          className={
            view === "grid"
              ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              : "space-y-2"
          }
        >
          {filtered.map((slot) => (
            <button
              key={slot.id}
              data-slot-id={slot.id}
              onClick={() => setSelectedId(slot.id)}
              className={`overflow-hidden rounded-md border bg-white text-left transition hover:border-[#ed1c24] ${selected.id === slot.id ? "ring-2 ring-[#ed1c24]" : ""} ${view === "list" ? "flex items-center gap-4 p-3" : ""}`}
            >
              <div
                className={
                  view === "list"
                    ? "h-20 w-28 shrink-0 bg-slate-100"
                    : "aspect-[4/3] bg-slate-100"
                }
              >
                <img
                  src={slot.publishedImageUrl}
                  alt={slot.altText || slot.sectionName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  style={{
                    objectPosition: `${slot.focalPointX}% ${slot.focalPointY}%`,
                  }}
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{slot.sectionName}</p>
                  <StatusBadge>{imageLiveStatus(slot)}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {slot.pageName} / {slot.imageRole}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {slot.originalImageUrl}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-md border bg-white p-5 2xl:sticky 2xl:top-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-[#ed1c24]">
              Selected Image Slot
            </p>
            <h2 className="mt-1 text-lg font-semibold">{selected.id}</h2>
          </div>
          <StatusBadge>{imageLiveStatus(selected)}</StatusBadge>
        </div>
        {notice && (
          <div className="mt-4">
            <Notice tone="green">{notice}</Notice>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <Notice tone="red">{error}</Notice>
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Preview
            label="Current live"
            src={selected.publishedImageUrl}
            slot={selected}
          />
          <Preview
            label={
              preview
                ? "New upload"
                : selected.draftImageUrl
                  ? "Saved draft"
                  : "New preview"
            }
            src={preview || selected.draftImageUrl}
            slot={selected}
          />
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif"
          className="hidden"
          onChange={(event) =>
            event.target.files?.[0] && chooseFile(event.target.files[0])
          }
        />
        <button
          onClick={() => fileInput.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const dropped = event.dataTransfer.files[0];
            if (dropped) chooseFile(dropped);
          }}
          className="mt-4 flex min-h-24 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 p-4 text-sm hover:border-[#ed1c24]"
        >
          <Upload className="mb-2 h-5 w-5" />
          Drag and drop or browse an image
          <span className="mt-1 text-xs text-slate-500">
            JPG, PNG, WebP or GIF / maximum 12 MB
          </span>
        </button>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Crop mode
            <select
              value={selected.cropMode}
              onChange={(event) =>
                updateSelected({
                  cropMode: event.target.value as ImageSlot["cropMode"],
                })
              }
              className="mt-2 w-full rounded-md border p-2"
            >
              <option value="cover">Auto Fit / Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
              <option value="original">Original</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Aspect ratio
            <select
              value={selected.requiredAspectRatio}
              onChange={(event) =>
                updateSelected({ requiredAspectRatio: event.target.value })
              }
              className="mt-2 w-full rounded-md border p-2"
            >
              <option>4:3</option>
              <option>16:9</option>
              <option>1:1</option>
              <option>3:2</option>
              <option>8:3</option>
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Focal point X: {selected.focalPointX}%
            <input
              type="range"
              min="0"
              max="100"
              value={selected.focalPointX}
              onChange={(event) =>
                updateSelected({ focalPointX: Number(event.target.value) })
              }
              className="mt-2 w-full"
            />
          </label>
          <label className="text-sm">
            Focal point Y: {selected.focalPointY}%
            <input
              type="range"
              min="0"
              max="100"
              value={selected.focalPointY}
              onChange={(event) =>
                updateSelected({ focalPointY: Number(event.target.value) })
              }
              className="mt-2 w-full"
            />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium">
          Alt text
          <Input
            className="mt-2"
            value={selected.altText}
            disabled={!canEditAlt(user.role)}
            onChange={(event) =>
              updateSelected({ altText: event.target.value })
            }
          />
          {!selected.altText && (
            <span className="mt-1 block text-xs text-red-600">
              Alt text is required before publishing.
            </span>
          )}
        </label>
        <label className="mt-4 block text-sm font-medium">
          Caption
          <Input
            className="mt-2"
            value={selected.caption}
            onChange={(event) =>
              updateSelected({ caption: event.target.value })
            }
          />
        </label>
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          <p>
            <strong>Where used:</strong> {selected.usedOn.join(", ")}
          </p>
          <p className="mt-1">
            <strong>Recommended:</strong> {selected.recommendedWidth} x{" "}
            {selected.recommendedHeight}px / {selected.requiredAspectRatio}
          </p>
          <p className="mt-1">
            <strong>Source:</strong> {selected.sourceFile}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Desktop", "16/9"],
            ["Tablet", "4/3"],
            ["Mobile", "3/2"],
          ].map(([label, ratio]) => (
            <div key={label} className="text-center text-xs">
              <div
                className="overflow-hidden rounded border bg-slate-100"
                style={{ aspectRatio: ratio }}
              >
                <img
                  src={
                    preview ||
                    selected.draftImageUrl ||
                    selected.publishedImageUrl
                  }
                  alt=""
                  className={`h-full w-full ${selected.cropMode === "contain" || selected.cropMode === "original" ? "object-contain" : "object-cover"}`}
                  style={{
                    objectPosition: `${selected.focalPointX}% ${selected.focalPointY}%`,
                  }}
                />
              </div>
              <span className="mt-1 block">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Preview only. Google evaluates the real responsive mobile page; run Production Mobile QA before publishing layout-sensitive changes.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={saveDraft}
            disabled={!file || !canManageMedia(user.role)}
          >
            Save Draft Image
          </Button>
          <Button
            onClick={applyLive}
            disabled={!selected.draftImageUrl || !canPublish(user.role)}
            className="bg-[#ed1c24] text-white hover:bg-[#c9151d]"
          >
            Apply to Website
          </Button>
          <Button
            variant="outline"
            onClick={rollback}
            disabled={selected.versions.length < 2 || !canPublish(user.role)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Rollback
          </Button>
          <Button variant="outline" asChild>
            <a
              href={selected.usedOn[0] || "/"}
              target="_blank"
              rel="noreferrer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Check live
            </a>
          </Button>
        </div>
        <div className="mt-5">
          <h3 className="text-sm font-semibold">Version history</h3>
          <div className="mt-2 max-h-40 overflow-y-auto divide-y text-xs">
            {[...selected.versions].reverse().map((version) => (
              <div key={version.id} className="flex justify-between py-2">
                <span>
                  v{version.versionNumber} / {version.status}
                </span>
                <span className="text-slate-500">
                  {version.createdAt.slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function Preview({
  label,
  src,
  slot,
}: {
  label: string;
  src?: string;
  slot: ImageSlot;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>
      <div className="aspect-[4/3] overflow-hidden rounded border bg-slate-100">
        {src ? (
          <img
            src={src}
            alt=""
            className={`h-full w-full ${slot.cropMode === "contain" || slot.cropMode === "original" ? "object-contain" : "object-cover"}`}
            style={{
              objectPosition: `${slot.focalPointX}% ${slot.focalPointY}%`,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No draft
          </div>
        )}
      </div>
    </div>
  );
}

function LeadsCenter({
  leads,
  setLeads,
}: {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
}) {
  const update = async (lead: Lead, status: string) => {
    const next = leads.map((item) =>
      item.id === lead.id ? { ...item, status } : item,
    );
    setLeads(next);
    try {
      await client.from("website_leads").update({ status }).eq("id", lead.id);
    } catch {
      /* setup required */
    }
  };
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3 rounded-md border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Leads / Quote Requests</h2>
          <p className="text-sm text-slate-500">
            Customer enquiries, assignments, statuses and export.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              exportToCsv(
                "ambs-leads.csv",
                leads as unknown as Record<string, unknown>[],
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportCurrentViewToPdf("Lead Report")}
          >
            <Printer className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
      {!leads.length && (
        <Notice>
          No live leads were returned. Apply database setup and submit a website
          form to populate this center.
        </Notice>
      )}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Customer</th>
              <th>Contact</th>
              <th>Interest</th>
              <th>Location</th>
              <th>Source</th>
              <th>Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t">
                <td className="p-4">
                  <strong>{lead.name}</strong>
                  <span className="block text-xs text-slate-500">
                    {lead.company || "-"}
                  </span>
                </td>
                <td>
                  <a href={`mailto:${lead.email}`} className="text-[#b10b08]">
                    {lead.email}
                  </a>
                  <span className="block text-xs">{lead.phone}</span>
                </td>
                <td>{lead.products?.join(", ") || lead.lead_type}</td>
                <td>{lead.project_location || "-"}</td>
                <td>{lead.source_path || "-"}</td>
                <td>
                  <select
                    value={lead.status}
                    onChange={(event) => update(lead, event.target.value)}
                    className="rounded border p-2"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${lead.email}`}>Email</a>
                    </Button>
                    {lead.phone && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatisticsCenter({ leads, ga4, ga4Loading, ga4Error }: { leads: Lead[]; ga4: Ga4Report | null; ga4Loading: boolean; ga4Error: string }) {
  const cards = [
    ["Active users (30 min)", ga4?.summary.activeUsers30m],
    ["Users last 7 days", ga4?.summary.users7d],
    ["Users last 30 days", ga4?.summary.users30d],
    ["Page views last 30 days", ga4?.summary.pageViews30d],
    ["Sessions today", ga4?.summary.sessionsToday],
    ["WhatsApp clicks last 30 days", ga4?.summary.whatsappClicks30d],
    ["Engagement rate last 30 days", ga4 ? `${Math.round(ga4.summary.engagementRate30d * 100)}%` : undefined],
  ] as const;
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3 rounded-md border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Website Statistics</h2>
          <p className="text-sm text-slate-500">
            Traffic, engagement, conversions and SEO health.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportCurrentViewToPdf("Website Statistics")}
        >
          <Printer className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      {ga4 ? <Notice tone="green">Google Analytics 4 connected. Report refreshed {new Date(ga4.checkedAt).toLocaleString()}. Realtime covers the last 30 minutes; other figures use the GA4 property timezone.</Notice> : <Notice tone={ga4Error ? "red" : "amber"}>{ga4Loading ? "Loading live Google Analytics 4 data…" : ga4Error || "GA4 reporting is not configured yet. Add the service account to this GA4 property to show real figures here."}</Notice>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-md border bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${ga4 ? "text-slate-900" : "text-amber-700"}`}>{ga4 ? typeof value === "number" ? value.toLocaleString() : value : ga4Loading ? "Loading…" : ga4Error ? "Unavailable" : "Connect GA4"}</p>
          </div>
        ))}
      </div>
      {ga4 && <div className="grid gap-5 xl:grid-cols-2">
        {([ ["Top pages", ga4.topPages], ["Traffic channels", ga4.channels], ["Countries", ga4.countries], ["Devices", ga4.devices] ] as const).map(([title, rows]) => <section key={title} className="rounded-md border bg-white p-5"><h3 className="font-semibold">{title} <span className="text-xs font-normal text-slate-500">· last 30 days</span></h3><div className="mt-3 divide-y text-sm">{rows.length ? rows.map((row) => <div key={row.name} className="flex justify-between gap-4 py-2"><span className="min-w-0 break-all">{row.name}</span><strong>{row.value.toLocaleString()}</strong></div>) : <p className="py-3 text-slate-500">No data in this period.</p>}</div></section>)}
      </div>}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border bg-white p-5">
          <h3 className="font-semibold">Lead Conversion</h3>
          <p className="mt-4 text-3xl font-semibold">{leads.length}</p>
          <p className="text-sm text-slate-500">
            Stored form submissions available to this account
          </p>
        </section>
        <section className="rounded-md border bg-white p-5">
          <h3 className="font-semibold">SEO Health</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p>Admin routes: noindex/nofollow</p>
            <p>Public sitemap: unchanged</p>
            <p>Public metadata and schema: preserved</p>
            <p>
              Broken links: run <code>npm run qa:site</code>
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

function UsersCenter({ user }: { user: CmsAdminUser }) {
  const roles: CmsRole[] = [
    "super_admin",
    "admin",
    "seo_reviewer",
    "content_editor",
    "media_manager",
    "sales_marketing_draft",
  ];
  return (
    <section className="space-y-5">
      <div className="rounded-md border bg-white p-5">
        <h2 className="text-lg font-semibold">Users & Roles</h2>
        <p className="text-sm text-slate-500">
          Server-enforced role definitions for authenticated administrators.
        </p>
      </div>
      {!canManageUsers(user.role) && (
        <Notice>
          You can view role definitions, but only Super Admin can create users
          or change roles.
        </Notice>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <article key={role} className="rounded-md border bg-white p-5">
            <Lock className="h-5 w-5 text-[#ed1c24]" />
            <h3 className="mt-3 font-semibold">{roleLabels[role]}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {role === "super_admin"
                ? "Full access, users, settings and hard delete."
                : role === "admin"
                  ? "Content, media, publishing and leads."
                  : role === "seo_reviewer"
                    ? "Protected SEO fields and review."
                    : role === "content_editor"
                      ? "Create and edit drafts; cannot publish."
                      : role === "media_manager"
                        ? "Upload and draft media; cannot apply live."
                        : "Draft projects/articles and sales notes."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AuditCenter({ entries }: { entries: AuditEntry[] }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3 rounded-md border bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold">Audit Logs</h2>
          <p className="text-sm text-slate-500">
            Logins, content, media, SEO, leads and exports.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportToCsv(
              "ambs-audit-log.csv",
              entries as unknown as Record<string, unknown>[],
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      {!entries.length && (
        <Notice>
          Audit records will appear after CMS actions. Apply the migration to
          share logs across administrators.
        </Notice>
      )}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-4">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td>{entry.userEmail}</td>
                <td>{entry.action}</td>
                <td>
                  {entry.resourceType} / {entry.resourceId}
                </td>
                <td>
                  <StatusBadge>{entry.result}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SettingsCenter({ user }: { user: CmsAdminUser }) {
  return (
    <section className="space-y-5">
      <div className="rounded-md border bg-white p-5">
        <h2 className="text-lg font-semibold">Settings & Integrations</h2>
        <p className="text-sm text-slate-500">
          Storage, analytics, PDF, Microsoft and security configuration.
        </p>
      </div>
      {!canManageUsers(user.role) && (
        <Notice>
          Only Super Admin can change production integration settings.
        </Notice>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          [
            "Google Analytics 4",
            "Set GA4 property and service-account variables. Dashboard remains clearly unconnected until credentials exist.",
          ],
          [
            "Microsoft Graph",
            "Optional OneDrive/SharePoint storage and Office-to-PDF conversion. No keys are hardcoded.",
          ],
          [
            "PDF Export",
            "Browser print-to-PDF is available now. Server PDF or LibreOffice conversion is deployment dependent.",
          ],
          [
            "Media Storage",
            "Supabase cms-media bucket validates MIME, file size and role policies. Original versions remain retained.",
          ],
          [
            "Authentication & MFA",
            "Supabase password/magic link is active. Enable authenticator MFA and session policies in Supabase.",
          ],
          [
            "SEO Protection",
            "Admin noindex headers, robots exclusion and sitemap exclusion are configured independently of public SEO.",
          ],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-md border bg-white p-5">
            <Settings className="h-5 w-5 text-[#ed1c24]" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
            <StatusBadge>
              {title === "PDF Export" || title === "SEO Protection"
                ? "Live"
                : "Setup required"}
            </StatusBadge>
          </article>
        ))}
      </div>
    </section>
  );
}
