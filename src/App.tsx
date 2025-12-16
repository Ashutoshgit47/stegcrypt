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

// Eagerly loaded - core functionality
import Index from "./pages/Index";
import Encode from "./pages/Encode";
import Decode from "./pages/Decode";
import NotFound from "./pages/NotFound";

// Lazy loaded - secondary pages for code splitting
const Security = lazy(() => import("./pages/Security"));
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));

const queryClient = new QueryClient();

// Loading fallback for lazy routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
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
