import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import Home from "@/pages/Home";
import BrowseBooks from "@/pages/BrowseBooks";
import NewReleases from "@/pages/NewReleases";
import BestSellers from "@/pages/BestSellers";
import BookDetails from "@/pages/BookDetails";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { CartProvider } from "@/hooks/useCart";
import { FiltersProvider } from "@/hooks/useFilters";
import ShoppingCart from "@/components/ShoppingCart";
import MobileNav from "@/components/mobile/MobileNav";
import { useState } from "react";

function Router() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <>
      <NavBar
        onCartOpen={() => setIsCartOpen(true)}
        onMenuOpen={() => setIsNavOpen(true)}
      />

      <MobileNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/browse" component={BrowseBooks} />
          <Route path="/book/:id" component={BookDetails} />
          <Route path="/new-releases" component={NewReleases} />
          <Route path="/best-sellers" component={BestSellers} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <FiltersProvider>
          <Router />
          <Toaster />
        </FiltersProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
