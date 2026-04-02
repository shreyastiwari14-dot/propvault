"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/* ── Types ── */
export interface PropListItem {
  id: string;
  item_code: string;
  name: string;
  category: string;
  thumbnail: string | null;
}

interface PropListContextType {
  items: PropListItem[];
  count: number;
  isOpen: boolean;
  add: (item: PropListItem) => void;
  remove: (item_code: string) => void;
  toggle: (item: PropListItem) => void;
  has: (item_code: string) => boolean;
  clear: () => void;
  open: () => void;
  close: () => void;
  whatsappLink: () => string;
}

const PropListContext = createContext<PropListContextType | null>(null);

export function usePropList() {
  const ctx = useContext(PropListContext);
  if (!ctx) throw new Error("usePropList must be used within PropListProvider");
  return ctx;
}

const WA_NUMBER = "919999999999";

export function PropListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PropListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((item: PropListItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.item_code === item.item_code)) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((item_code: string) => {
    setItems((prev) => prev.filter((p) => p.item_code !== item_code));
  }, []);

  const toggle = useCallback((item: PropListItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.item_code === item.item_code)) {
        return prev.filter((p) => p.item_code !== item.item_code);
      }
      return [...prev, item];
    });
  }, []);

  const has = useCallback(
    (item_code: string) => items.some((p) => p.item_code === item_code),
    [items]
  );

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const whatsappLink = useCallback(() => {
    if (items.length === 0) {
      return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
        "Hi, I'd like to know more about your prop collection."
      )}`;
    }

    // Group items by category
    const grouped: Record<string, string[]> = {};
    items.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(`${item.item_code} — ${item.name}`);
    });

    let msg = `Hi, I'm interested in booking ${items.length} props from your catalog:\n\n`;
    Object.entries(grouped).forEach(([cat, codes]) => {
      msg += `*${cat}*\n`;
      codes.forEach((c) => (msg += `  • ${c}\n`));
      msg += "\n";
    });
    msg += "Please let me know availability and pricing. Thanks!";

    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [items]);

  return (
    <PropListContext.Provider
      value={{
        items,
        count: items.length,
        isOpen,
        add,
        remove,
        toggle,
        has,
        clear,
        open,
        close,
        whatsappLink,
      }}
    >
      {children}
    </PropListContext.Provider>
  );
}
