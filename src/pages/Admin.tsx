import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, DollarSign, Shield, Search, MoreVertical, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/auth/AuthProvider';

const DAILY_USERS = [
  { day: 'Mon', users: 1240 }, { day: 'Tue', users: 1580 }, { day: 'Wed', users: 1820 },
  { day: 'Thu', users: 1650 }, { day: 'Fri', users: 2100 }, { day: 'Sat', users: 1900 }, { day: 'Sun', users: 1440 },
];
const REVENUE = [
  { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5100 }, { month: 'Mar', revenue: 6800 },
  { month: 'Apr', revenue: 7200 }, { month: 'May', revenue: 8900 }, { month: 'Jun', revenue: 9400 },
];
const LESSON_TYPES = [
  { name: 'Grammar', value: 35, color: '#7c3aed' },
  { name: 'Vocabulary', value: 28, color: '#2563eb' },
  { name: 'Speaking', value: 20, color: '#10b981' },
  { name: 'IELTS', value: 17, color: '#f59e0b' },
];

const MOCK_USERS = [
  { id: '1', name: 'Jasur Toshmatov', email: 'jasur@gmail.com', level: 'C1', plan: 'pro',     joined: '2024-01-15', last_active: '2 hours ago' },
  { id: '2', name: 'Malika Yusupova', email: 'malika@gmail.com', level: 'B2', plan: 'premium', joined: '2024-02-20', last_active: '1 day ago' },
  { id: '3', name: 'Bobur Rahimov',   email: 'bobur@gmail.com',  level: 'B2', plan: 'free',    joined: '2024-03-10', last_active: '3 days ago' },
  { id: '4', name: 'Nilufar Hasanova',email: 'nilufar@gmail.com',level: 'B1', plan: 'pro',     joined: '2024-04-05', last_active: '5 hours ago' },
  { id: '5', name: 'Sardor Mirzaev',  email: 'sardor@gmail.com', level: 'C1', plan: 'premium', joined: '2024-01-28', last_active: 'Just now' },
];

const planColor = { free: 'secondary', pro: 'default', premium: 'outline' } as const;

export default function Admin() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Simple admin check
  if (user && !user.email?.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground opacity-40" />
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground">This area is for administrators only.</p>
        </motion.div>
      </div>
    );
  }

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </span>
          Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform overview and management</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,     label: 'Total Users',    value: '12,847', trend: '+8.2%',  color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-950/50' },
          { icon: Users,     label: 'Active Today',   value: '2,341',  trend: '+12.4%', color: 'text-emerald-500',bg: 'bg-emerald-100 dark:bg-emerald-950/50' },
          { icon: DollarSign,label: 'Pro Subscribers',value: '3,218',  trend: '+5.1%',  color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-950/50' },
          { icon: TrendingUp, label: 'Revenue (MRR)', value: '$9,414', trend: '+18.7%', color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-950/50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">{stat.trend} this week</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-3 w-full sm:w-80">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Add User
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-semibold text-muted-foreground">User</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden sm:table-cell">Level</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden md:table-cell">Plan</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground hidden lg:table-cell">Last Active</th>
                    <th className="text-right p-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-muted/20">
                      <td className="p-3">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{u.level}</Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant={planColor[u.plan as keyof typeof planColor]} className="capitalize text-xs">{u.plan}</Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">{u.last_active}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Analytics tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Daily Active Users</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={DAILY_USERS}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Monthly Revenue ($)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={REVENUE}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Lesson Completions by Type</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={LESSON_TYPES} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                    {LESSON_TYPES.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {LESSON_TYPES.map(t => (
                  <div key={t.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="text-muted-foreground">{t.name}</span>
                    <span className="font-semibold ml-auto">{t.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content tab */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Lessons</h3>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" /> New Lesson
            </Button>
          </div>
          <Card>
            <div className="divide-y divide-border">
              {[
                { title: 'Present Perfect vs Simple Past', type: 'grammar', level: 'B1', xp: 80, students: 1234 },
                { title: 'Academic Vocabulary: Cause & Effect', type: 'vocabulary', level: 'B2', xp: 60, students: 892 },
                { title: 'IELTS Writing Task 2 Strategies', type: 'ielts', level: 'B2', xp: 100, students: 2341 },
                { title: 'Phrasal Verbs in Business English', type: 'vocabulary', level: 'C1', xp: 90, students: 543 },
                { title: 'Conditional Sentences (All Types)', type: 'grammar', level: 'B2', xp: 80, students: 1102 },
              ].map((lesson, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{lesson.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0 capitalize">{lesson.type}</Badge>
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{lesson.level}</Badge>
                      <span className="text-xs text-muted-foreground">{lesson.students.toLocaleString()} students</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
