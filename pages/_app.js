import "@/styles/globals.css";
import { Space_Grotesk } from "next/font/google";
import dynamic from "next/dynamic";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

// Lazy-load on client only to avoid SSR canvas warnings
const CursorTail = dynamic(() => import("@/components/CursorTail"), { ssr: false });

export default function App({ Component, pageProps }) {
  return (
    <div className={spaceGrotesk.className}>
      <CursorTail />
      <Component {...pageProps} />
    </div>
  );
}
