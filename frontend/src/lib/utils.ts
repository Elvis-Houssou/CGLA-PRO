import { clsx, type ClassValue } from "clsx"
import { get } from "http"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function getToken() {
// localStorage.getItem('token');
// if (typeof window !== 'undefined') {
//   return localStorage.getItem('token');
// }
// return null;
// }
