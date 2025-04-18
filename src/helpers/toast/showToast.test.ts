// src/helpers/toast/showToast.test.ts

import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { toastActions } from '@providers/Toast'
import { showToast } from './showToast'

jest.mock('@providers/Toast')

describe('showToast', () => {
  it('should call toastActions.open with the provided message', () => {
    const msg = 'Test message'

    showToast(msg)

    expect(toastActions.open).toHaveBeenCalledWith({ msg })
  })

  it('should call toastActions.open with the provided message, type, and duration', () => {
    const msg = 'Test message'
    const type = ToastColorEnum.Success
    const duration = 3000

    showToast(msg, type, duration)

    expect(toastActions.open).toHaveBeenCalledWith({ msg, type, duration })
  })
})
