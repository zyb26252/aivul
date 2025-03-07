interface Window {
  showdown: {
    Converter: new () => {
      makeHtml: (markdown: string) => string
    }
  }
} 