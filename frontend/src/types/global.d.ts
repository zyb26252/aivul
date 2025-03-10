import showdown from 'showdown'

declare global {
  interface Window {
    showdown: typeof showdown
  }
}

export {} 