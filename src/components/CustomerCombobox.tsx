import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function money(n: number) {
  return Number(n || 0).toLocaleString("uz-UZ");
}

export type CustomerOption = {
  id: string;
  name: string;
  phone?: string | null;
  debt: number;
};

export default function CustomerCombobox({
  customers,
  value,
  onChange,
  placeholder = "Mijozni tanlang...",
}: {
  customers: CustomerOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => customers.find((c) => c.id === value), [customers, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selected ? (
            <span className="truncate">
              {selected.name}
              <span className="ml-2 text-muted-foreground">({selected.id.slice(0, 8)}…)</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Mijoz qidirish..." />
          <CommandList>
            <CommandEmpty>Mijoz topilmadi.</CommandEmpty>
            <CommandGroup>
              {customers.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.id} ${c.phone ?? ""}`}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.phone ?? "—"}</div>
                    </div>
                    {c.debt > 0 ? (
                      <Badge variant="secondary" className="shrink-0">
                        Qarz: {money(c.debt)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Toza
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
