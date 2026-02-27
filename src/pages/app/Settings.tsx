import { useAuth } from "@/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const { email, role } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Profil va role ma&apos;lumotlari.</p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Email:</span> {email ?? "—"}</div>
          <div><span className="text-muted-foreground">Role:</span> {role ?? "—"}</div>
          <div className="text-xs text-muted-foreground">
            Eslatma: delete amallari Supabase RLS bilan admin-only qilingan.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
