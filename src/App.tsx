import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

import { AuthProvider } from "@/auth/AuthProvider";
import ProtectedRoute from "@/auth/ProtectedRoute";

import AppShell from "@/pages/app/AppShell";
import Dashboard from "@/pages/app/Dashboard";
import Sales from "@/pages/app/Sales";
import Customers from "@/pages/app/Customers";
import CustomerDetails from "@/pages/app/CustomerDetails";
import Products from "@/pages/app/Products";
import Settings from "@/pages/app/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="products" element={<Products />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
