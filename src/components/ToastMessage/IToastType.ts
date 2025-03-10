// src/components/ToastMessage/IToastType.ts

import type { ToastColorEnum } from './ToastColorEnum'

export interface IToastType {
  msg: string
  duration?: number
  type?: ToastColorEnum
}
