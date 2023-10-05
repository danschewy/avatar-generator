import "../styles/globals.css";
import { GoogleAdSense } from "nextjs-google-adsense";

export default function App({ Component, pageProps }) {
  return (
    <>
      <GoogleAdSense publisherId="pub-3998650725257627" />
      <Component {...pageProps} />
    </>
  );
}
