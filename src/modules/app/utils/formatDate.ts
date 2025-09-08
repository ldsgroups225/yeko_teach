import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(
  date: Date | string,
  formatString: string = 'EEEE dd MMMM'
): string {
  return format(date, formatString, { locale: fr })
}

export function formatTime(date: Date, formatString: string = 'HH:mm'): string {
  return format(date, formatString, { locale: fr })
}
