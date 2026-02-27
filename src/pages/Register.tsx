import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const Register = () => {
  const nav = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Ro'yxatdan o'tish xatoligi", description: error.message, variant: "destructive" });
      return;
    }

    if (data.user) {
      // default role seller
      const { error: pe } = await supabase.from("profiles").insert({ id: data.user.id, full_name: name, role: "seller" });
      if (pe) {
        setLoading(false);
        toast({ title: "Xatolik", description: pe.message, variant: "destructive" });
        return;
      }
    }

    setLoading(false);
    toast({ title: "Tayyor", description: "Hisob yaratildi. Endi tizimga kiring." });
    nav("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Store className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Do'kon Boshqaruv</h1>
            <p className="text-muted-foreground">Ro'yxatdan o'tish</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ism</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Kamida 6 ta belgi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium"
                size="lg"
                disabled={loading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? "Kutilmoqda..." : "Ro'yxatdan o'tish"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Allaqachon hisobingiz bormi?{" "}
                <Link to="/" className="font-medium text-primary hover:underline">
                  Kirish
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
