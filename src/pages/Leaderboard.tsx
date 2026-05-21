import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Search, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const MOCK_USERS = [
  { rank: 1,  name: 'Jasur Toshmatov',  country: '🇺🇿', level: 'C1', xp: 12450, streak: 47 },
  { rank: 2,  name: 'Malika Yusupova',  country: '🇺🇿', level: 'B2', xp: 10320, streak: 35 },
  { rank: 3,  name: 'Bobur Rahimov',    country: '🇺🇿', level: 'B2', xp: 9870,  streak: 28 },
  { rank: 4,  name: 'Nilufar Hasanova', country: '🇺🇿', level: 'B1', xp: 8540,  streak: 21 },
  { rank: 5,  name: 'Sardor Mirzaev',   country: '🇺🇿', level: 'C1', xp: 7890,  streak: 18 },
  { rank: 6,  name: 'Zulfiya Karimova', country: '🇺🇿', level: 'B1', xp: 7200,  streak: 15 },
  { rank: 7,  name: 'Otabek Normatov',  country: '🇺🇿', level: 'A2', xp: 6540,  streak: 12 },
  { rank: 8,  name: 'Kamola Ergasheva', country: '🇺🇿', level: 'B2', xp: 5980,  streak: 9  },
  { rank: 9,  name: 'Temur Abdullayev', country: '🇺🇿', level: 'B1', xp: 5430,  streak: 7  },
  { rank: 10, name: 'Dildora Tursunova',country: '🇺🇿', level: 'A2', xp: 4870,  streak: 5  },
];

const PODIUM_CONFIG = {
  1: { gradient: 'from-amber-400 to-yellow-500', medal: '🥇', avatarSize: 'w-20 h-20', order: 'order-2', barH: 'h-24' },
  2: { gradient: 'from-slate-300 to-gray-400',   medal: '🥈', avatarSize: 'w-16 h-16', order: 'order-1', barH: 'h-16' },
  3: { gradient: 'from-amber-600 to-orange-600', medal: '🥉', avatarSize: 'w-16 h-16', order: 'order-3', barH: 'h-16' },
} as const;

function PodiumCard({ user, position }: { user: typeof MOCK_USERS[0]; position: 1|2|3 }) {
  const c = PODIUM_CONFIG[position];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: position * 0.1 }}
      className={`flex flex-col items-center gap-2 ${c.order}`}>
      <div className="text-2xl">{c.medal}</div>
      <Avatar className={`${c.avatarSize} border-4 border-white shadow-lg`}>
        <AvatarFallback className={`bg-gradient-to-br ${c.gradient} text-white text-lg font-bold`}>
          {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <div className="font-semibold text-sm truncate max-w-[90px]">{user.name.split(' ')[0]}</div>
        <Badge variant="outline" className="text-xs mt-0.5">{user.level}</Badge>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{user.xp.toLocaleString()} XP</div>
      </div>
      <div className={`w-16 ${c.barH} rounded-t-lg bg-gradient-to-t ${c.gradient} opacity-70`} />
    </motion.div>
  );
}

export default function Leaderboard() {
  const [search, setSearch] = useState('');

  const rest = MOCK_USERS.slice(3).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500" />
            </span>
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Top learners this week</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="w-3.5 h-3.5" /> Uzbekistan
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Learners', value: '12,847' },
          { label: 'XP Earned Today', value: '2.4M' },
          { label: 'Your Rank', value: '#47' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="grid grid-cols-3 w-full sm:w-64">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          {/* Podium */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex items-end justify-center gap-6">
                <PodiumCard user={MOCK_USERS[1]} position={2} />
                <PodiumCard user={MOCK_USERS[0]} position={1} />
                <PodiumCard user={MOCK_USERS[2]} position={3} />
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search learners..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* List */}
          <Card>
            <CardContent className="pt-2 pb-2 divide-y divide-border">
              {rest.map((user, i) => (
                <motion.div key={user.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3">
                  <span className="w-7 text-center text-sm font-mono text-muted-foreground font-semibold">#{user.rank}</span>
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white text-xs font-bold">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name} {user.country}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{user.level}</Badge>
                      <span className="text-xs text-orange-500 flex items-center gap-0.5"><Flame className="w-3 h-3" />{user.streak}</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-violet-600">{user.xp.toLocaleString()}</div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Your position */}
          <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/10">
            <CardContent className="pt-3 pb-3 flex items-center gap-3">
              <span className="w-7 text-center text-sm font-mono font-bold text-violet-600">#47</span>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white text-xs font-bold">YOU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-sm">You</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />7 day streak</div>
              </div>
              <div className="text-sm font-semibold text-violet-600">1,240 XP</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="text-center py-16 text-muted-foreground"><Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Monthly rankings reset on the 1st</p></div>
        </TabsContent>
        <TabsContent value="alltime" className="mt-4">
          <div className="text-center py-16 text-muted-foreground"><Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>All-time rankings coming soon</p></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
