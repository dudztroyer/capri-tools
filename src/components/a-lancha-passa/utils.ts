/**
 * Utility functions for date formatting in a-lancha-passa components
 */

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateStr = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  
  if (date.toDateString() === today.toDateString()) {
    return `Hoje às ${formatTime(date)}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Amanhã às ${formatTime(date)}`;
  } else {
    return `${dateStr} às ${formatTime(date)}`;
  }
}

export function formatDateOnly(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Hoje";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Amanhã";
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      weekday: "short",
    });
  }
}

