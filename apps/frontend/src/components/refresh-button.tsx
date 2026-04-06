"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  function handleRefresh() {
    setIsPending(true);
    startTransition(() => {
      router.refresh();
      setIsPending(false);
    });
  }

  return (
    <button
      type="button"
      className="action-button"
      onClick={handleRefresh}
      aria-live="polite"
      aria-label="Atualizar dados do painel"
    >
      {isPending ? "Atualizando..." : "Atualizar dados"}
    </button>
  );
}
