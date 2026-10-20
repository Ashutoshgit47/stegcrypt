import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModeProvider } from "@/contexts/ModeContext";
import { SEOProvider } from "@/components/SEOProvider";
import { Layout } from "@/components/layout/Layout";

// Core page - eager for instant homepage rendering
import Index from "./pages/Index";

// Lazy loaded - code-split across routes for smaller initial bundle and faster load
const Encode = lazy(() => import("./pages/Encode"));
const Decode = lazy(() => import("./pages/Decode"));
const Tools = lazy(() => import("./pages/Tools"));
const Security = lazy(() => import("./pages/Security"));
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Zero-layout-shift loading fallback for lazy routes
const PageLoader = () => (
  <div className="container py-12 flex items-center justify-center min-h-[40vh]" role="status" aria-label="Loading content">
    <div className="h-8 w-8 border-[3px] border-[#1040C0] border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <SEOProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/encode" element={<Encode />} />
                    <Route path="/decode" element={<Decode />} />
                    <Route path="/tools" element={<Tools />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </ModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </SEOProvider>
);

export default App;
