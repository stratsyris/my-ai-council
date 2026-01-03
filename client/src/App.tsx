import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { Toaster } from "@/components/ui/sonner";

// 1. IMPORT ONLY THE COUNCIL
import CouncilPage from "@/pages/Council"; 

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Switch>
          {/* 2. FORCE THE HOME URL TO LOAD THE COUNCIL */}
          <Route path="/" component={CouncilPage} />
          
          <Route>
            <div className="flex items-center justify-center h-screen text-slate-500">
              404: Page Not Found
            </div>
          </Route>
        </Switch>
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
}