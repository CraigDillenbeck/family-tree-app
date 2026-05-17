import { writable } from 'svelte/store'

export type Notification = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export const notifications = writable<Notification[]>([])
