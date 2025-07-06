import { useState, useEffect } from "react";
import logo from "../assets/original.png";

const message = `
Dear Prime Academy Family,

It is with a heavy heart that I, your admin, must inform you that our beloved app will be offline for a short while due to unforeseen building challenges. This decision was not easy, as each of you—our students, our community—means the world to us. Your dedication and passion fuel our mission, and it pains us to pause this journey, even temporarily.

Please know that our team is working tirelessly to resolve these issues and bring the app back to you stronger than ever. Your patience and understanding during this time are deeply appreciated. We will return soon, and we promise to make it worth the wait.

With gratitude and love,  
Prime Academy.
`;

const ShutdownScreen = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + message.charAt(index));
        setIndex(index + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
          width: "90%",
          maxWidth: "800px",
          whiteSpace: "pre-wrap",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#e63946",
            marginBottom: "20px",
            textTransform: "uppercase",
          }}
        >
          App Temporarily Closed
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#2a2a2a",
            marginBottom: "20px",
            minHeight: "280px",
            textAlign: "left",
          }}
        >
          {displayedText}
        </p>
        {index >= message.length && (
          <p
            style={{
              fontSize: "16px",
              color: "#6b7280",
              opacity: 0,
              animation: "fadeInText 1.5s ease-in-out forwards",
              animationDelay: "0.3s",
            }}
          >
            Thank you for your unwavering support. Check back soon for updates.
          </p>
        )}
      </div>
      <img
        src={logo}
        alt="Prime Academy Logo"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "130px",
          height: "110px",
          animation: "fadeInSlideUp 3s ease-in-out forwards",
          opacity: 0,
        }}
      />

      <style>
        {`
    @keyframes fadeInSlideUp {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes fadeInText {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}
      </style>
    </div>
  );
};

export default ShutdownScreen;
