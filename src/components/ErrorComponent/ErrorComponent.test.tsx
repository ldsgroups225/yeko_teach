// src/components/ErrorComponent/ErrorComponent.test.tsx

import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ErrorComponent from './index'

const mockStore = configureStore()
const States = {
  AppReducer: {
    userColorScheme: 'light',
  },
}
const Store = mockStore(States)

describe('errorComponent', () => {
  it('renders error message correctly', () => {
    const errorMessage = 'Something went wrong'
    const { getByText } = render(
      <Provider store={Store}>
        <ErrorComponent errorMessage={errorMessage} />
      </Provider>,
    )
    const messageElement = getByText(errorMessage)
    expect(messageElement).toBeTruthy()
  })

  it('calls onRetry function when retry button is pressed', () => {
    const onRetryMock = jest.fn()
    const { getByText } = render(<ErrorComponent onRetry={onRetryMock} />)
    const retryButton = getByText('Retry')
    fireEvent.press(retryButton)
    expect(onRetryMock).toHaveBeenCalled()
  })
})
