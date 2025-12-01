import React from "react";

// Uses the lottie-player web component injected in public/index.html
// Accepts `src` prop (URL to lottie JSON) and optional className
const LottieIllustration = ({ src = "https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json", className = "w-full h-48" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <lottie-player
        src={src}
        background="transparent"
        speed="1"
        loop
        autoplay
        style={{ width: "100%", height: "100%" }}
      ></lottie-player>
    </div>
  );
};

export default LottieIllustration;
