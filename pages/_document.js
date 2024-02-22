import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head></Head>
        <body className="bg-gradient-to-br from-pink-500 via-red-500 to-blue-500 p-2 sm:p-4 md:py-6 h-screen">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
