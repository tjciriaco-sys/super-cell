"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function AdminProductSearch() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const needle = normalize(query);
    document.querySelectorAll<HTMLTableRowElement>("[data-admin-product-row]").forEach((row) => {
      const haystack = row.dataset.search ?? "";
      row.hidden = Boolean(needle) && !haystack.includes(needle);
    });
  }, [query]);

  return (
    <div className="admin-search">
      <Search />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar produto, SKU ou variante"
        aria-label="Buscar produtos"
        autoComplete="off"
      />
    </div>
  );
}
