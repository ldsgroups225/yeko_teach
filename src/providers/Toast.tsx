// src/providers/Toast.tsx

import type { IToastType } from '@components/ToastMessage/IToastType'
import { ToastMessage } from '@src/components'

let useToastRef: unknown

/**
 * Sets the reference to the `useToastRef` property.
 * @param useToastRefProp - The reference to the `useToastRef` property.
 */
function setUseBackDropRef(useToastRefProp: unknown) {
  useToastRef = useToastRefProp
}

/**
 * Utility function for displaying toast messages.
 * @returns A JSX element representing the toast message.
 */
function ToastUtils() {
  return <ToastMessage ref={setUseBackDropRef} />
}

/**
 * Object containing actions related to toast notifications.
 */
export const toastActions = {
  /**
   * Opens a toast notification with the specified parameters.
   * @param param - The parameters for the toast notification.
   */
  open(param: IToastType) {
    ;(useToastRef as { open: (param: IToastType) => void })?.open(param)
  }
}

export default ToastUtils
