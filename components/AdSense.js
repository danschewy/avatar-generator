import { useEffect, useState } from "react";

const AdSense = ({ adSlot }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (window) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }, []);

  return mounted ? (
    <ins
      suppressHydrationWarning
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-3998650725257627" // Replace with your publisher ID
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  ) : (
    ""
  );
};

export default AdSense;
