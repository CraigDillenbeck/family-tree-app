import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([]);

  function add(type: ToastType, message: string): string {
    const id = Math.random().toString(36).slice(2);
    update(list => [...list, { id, type, message }]);
    // errors stay until manually dismissed; success + info auto-dismiss after 4s
    if (type !== 'error') {
      setTimeout(() => dismiss(id), 4000);
    }
    return id;
  }

  function dismiss(id: string): void {
    update(list => list.filter(t => t.id !== id));
  }

  return {
    subscribe,
    success: (message: string) => add('success', message),
    error:   (message: string) => add('error', message),
    info:    (message: string) => add('info', message),
    dismiss,
  };
}

export const toast = createToastStore();
