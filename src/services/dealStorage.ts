import { seedDeals } from "@/data/mockData";
import type { AnalystNote, Deal, DealStatus } from "@/types/deal";

const STORAGE_KEY = "gokapital-deal-analyzer-deals-v1";

const read = (): Deal[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored) as Deal[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDeals));
  return seedDeals;
};

const write = (deals: Deal[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));

// Prototype browser storage. Replace with Supabase database queries and Supabase Authentication scoping.
export const dealStorage = {
  getAll: () => read().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getById: (id: string) => read().find((deal) => deal.id === id),
  create: (deal: Deal) => {
    write([deal, ...read()]);
    return deal;
  },
  update: (id: string, updates: Partial<Deal>) => {
    const deals = read();
    const updated = deals.map((deal) =>
      deal.id === id ? { ...deal, ...updates, updatedAt: new Date().toISOString() } : deal,
    );
    write(updated);
    return updated.find((deal) => deal.id === id);
  },
  updateStatus: (id: string, status: DealStatus) =>
    dealStorage.update(id, { status }),
  saveNote: (dealId: string, content: string) => {
    const note: AnalystNote = {
      id: `note-${dealId}`,
      dealId,
      content,
      updatedAt: new Date().toISOString(),
    };
    return dealStorage.update(dealId, { analystNote: note });
  },
};
