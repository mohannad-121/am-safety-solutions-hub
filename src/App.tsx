import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { edgeTopics } from "./data/ambs";
import { StickyConversionBar } from "@/components/StickyConversionBar";
import { CmsImageBridge } from "@/components/CmsImageBridge";
import { CmsContentBridge } from "@/components/CmsContentBridge";
import { UrlNormalizer } from "@/components/UrlNormalizer";
import { AccessibilityEnhancements } from "@/components/AccessibilityEnhancements";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const Contact = lazy(() => import("./pages/Contact"));
const Quote = lazy(() => import("./pages/Quote"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EdgeProtection = lazy(() => import("./pages/EdgeProtection"));
const Training = lazy(() => import("./pages/Training"));
const Downloads = lazy(() => import("./pages/Downloads"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const StandardEN13374 = lazy(() => import("./pages/StandardEN13374"));
const CapabilityPage = lazy(() => import("./pages/CapabilityPage"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Faq = lazy(() => import("./pages/Faq"));
const EdgeProtectionTypes = lazy(() => import("./pages/EdgeProtectionTypes"));
const TechnicalSeoLanding = lazy(() => import("./pages/TechnicalSeoLanding"));
const RamsResources = lazy(() => import("./pages/RamsResources"));
const AuthorityResource = lazy(() => import("./pages/AuthorityResource"));
const EditorialPolicy = lazy(() => import("./pages/EditorialPolicy"));
const Industries = lazy(() => import("./pages/Industries"));
const Offers = lazy(() => import("./pages/Offers"));
const TechnicalLibrary = lazy(() => import("./pages/TechnicalLibrary"));

const App = () => (
  <>
      <Toaster />
      <BrowserRouter>
        <CmsImageBridge />
        <CmsContentBridge />
        <ScrollToTop />
        <UrlNormalizer />
        <AccessibilityEnhancements />
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center bg-[#20262b] text-sm font-bold uppercase text-white">Loading AM Building Solutions...</div>}><Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/engineering-solutions" element={<CapabilityPage />} />
          <Route path="/high-risk-products" element={<CapabilityPage />} />
          <Route path="/steel-fabrication" element={<CapabilityPage />} />
          <Route path="/edge-protection-systems-uae" element={<EdgeProtection />} />
          <Route path="/edge-protection-systems/types-of-edge-protection-systems" element={<EdgeProtectionTypes />} />
          <Route path="/safety-net-uae" element={<TechnicalSeoLanding />} />
          <Route path="/safety-catch-net-dubai" element={<TechnicalSeoLanding />} />
          <Route path="/temporary-edge-protection-dubai" element={<TechnicalSeoLanding />} />
          <Route path="/vertical-safety-net" element={<TechnicalSeoLanding />} />
          <Route path="/loading-platforms-uae" element={<TechnicalSeoLanding />} />
          <Route path="/work-at-height-safety-uae" element={<TechnicalSeoLanding />} />
          <Route path="/temporary-works-safety-solutions-uae" element={<TechnicalSeoLanding />} />
          <Route path="/what-is-en-1263-safety-net" element={<TechnicalSeoLanding />} />
          <Route path="/what-is-en-13374-edge-protection" element={<TechnicalSeoLanding />} />
          <Route path="/resources/risk-assessment-method-statement" element={<RamsResources />} />
          <Route path="/resources/safety-net-risk-assessment-method-statement" element={<RamsResources />} />
          <Route path="/resources/edge-protection-risk-assessment-method-statement" element={<RamsResources />} />
          <Route path="/resources/loading-platform-risk-assessment-method-statement" element={<RamsResources />} />
          <Route path="/resources/how-to-make-method-statement" element={<RamsResources />} />
          <Route path="/resources/technical-library" element={<TechnicalLibrary />} />
          <Route path="/resources/:slug" element={<AuthorityResource />} />
          <Route path="/standards" element={<Navigate to="/standards/en-13374-edge-protection" replace />} />
          <Route path="/standards/en-13374-edge-protection" element={<StandardEN13374 />} />
          <Route path="/en-13374-edge-protection" element={<Navigate to="/standards/en-13374-edge-protection" replace />} />
          <Route path="/bs-en-13374-2025-edge-protection" element={<Navigate to="/standards/en-13374-edge-protection" replace />} />
          <Route path="/certifications" element={<Navigate to="/standards/en-13374-edge-protection" replace />} />
          {edgeTopics.filter(topic => !topic.slug.includes("13374")).map(topic => <Route key={topic.slug} path={`/${topic.slug}`} element={<EdgeProtection />} />)}
          <Route path="/edge-protection-training" element={<Training />} />
          <Route path="/edge-protection-downloads" element={<Downloads />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/editorial-policy" element={<EditorialPolicy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/edge-protection-faqs" element={<Navigate to="/faq" replace />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/offers" element={<Offers />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
        <PublicStickyConversionBar />
      </BrowserRouter>
  </>
);

export default App;

function PublicStickyConversionBar() {
  const location = useLocation();
  return location.pathname.startsWith("/admin") ? null : <StickyConversionBar />;
}
