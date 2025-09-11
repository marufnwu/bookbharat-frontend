// This file is only here to prevent Next.js 15.5.2 from throwing ENOENT errors
// The actual application uses the app directory structure
// This file should not be used and can be safely ignored

import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument