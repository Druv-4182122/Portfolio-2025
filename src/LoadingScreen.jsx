import React, { useEffect, useState } from "react"
import gsap from "gsap"

export default function LoadingScreen({ progress, onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Initializing...")
  const [showEnterButton, setShowEnterButton] = useState(false)

  useEffect(() => {
    // Update loading message based on progress
    if (progress < 20) {
      setLoadingMessage("Loading 3D models...")
    } else if (progress < 50) {
      setLoadingMessage("Loading textures...")
    } else if (progress < 80) {
      setLoadingMessage("Setting up materials...")
    } else if (progress < 100) {
      setLoadingMessage("Finalizing scene...")
    } else {
      setLoadingMessage("Ready!")
    }
  }, [progress])

  useEffect(() => {
    if (progress >= 100) {
      // Show the enter button when loading is complete
      setTimeout(() => {
        setShowEnterButton(true)
      }, 500)
    }
  }, [progress])

  const handleEnterWithAudio = () => {
    // Start fade out animation when button is clicked
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false)
        onComplete(true) // Pass true to indicate user interaction WITH audio
      }
    })
    
    tl.to(".loading-progress", {
      width: "100%",
      duration: 0.3,
      ease: "power2.out"
    })
    .to(".loading-screen", {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "+=0.2")
  }

  const handleEnterWithoutAudio = () => {
    // Start fade out animation when button is clicked
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false)
        onComplete(false) // Pass false to indicate user interaction WITHOUT audio
      }
    })
    
    tl.to(".loading-progress", {
      width: "100%",
      duration: 0.3,
      ease: "power2.out"
    })
    .to(".loading-screen", {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "+=0.2")
  }

  if (!isVisible) return null

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0px); }
          }
          
          button:hover {
            transform: translateY(-2px) !important;
          }
          
          button[style*="linear-gradient"]:hover {
            box-shadow: 0 12px 35px rgba(74, 158, 255, 0.6) !important;
          }
          
          button[style*="transparent"]:hover {
            background-color: #4a9eff !important;
            color: #ffffff !important;
          }
        `}
      </style>
      <div className="loading-screen" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      fontFamily: "'Inter', 'Arial', sans-serif",
      color: "#ffffff"
    }}>
      <div style={{
        textAlign: "center",
        marginBottom: "40px"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          marginBottom: "10px",
          fontWeight: "300",
          letterSpacing: "2px",
          background: "linear-gradient(135deg, #4a9eff, #00d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Portfolio Loading
        </h1>
        <p style={{
          fontSize: "1rem",
          opacity: 0.7,
          margin: 0,
          letterSpacing: "1px"
        }}>
          {loadingMessage}
        </p>
      </div>
      
      <div className="progress-container" style={{
        width: "300px",
        height: "4px",
        backgroundColor: "#333333",
        borderRadius: "2px",
        overflow: "hidden",
        marginBottom: "20px",
        position: "relative"
      }}>
        <div 
          className="loading-progress"
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #4a9eff, #00d4ff)",
            borderRadius: "2px",
            transition: "width 0.3s ease",
            boxShadow: "0 0 15px rgba(74, 158, 255, 0.6)"
          }}
        />
      </div>
      
      <div style={{
        fontSize: "0.9rem",
        opacity: 0.6,
        fontWeight: "500",
        letterSpacing: "1px"
      }}>
        {Math.round(progress)}%
      </div>
      
      {/* Enter Buttons */}
      {showEnterButton && (
        <div style={{
          marginTop: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          alignItems: "center"
        }}>
          <button
            onClick={handleEnterWithAudio}
            style={{
              padding: "15px 40px",
              background: "linear-gradient(135deg, #4a9eff, #00d4ff)",
              border: "none",
              borderRadius: "30px",
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: "600",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
              boxShadow: "0 8px 25px rgba(74, 158, 255, 0.4)",
              animation: "fadeInUp 0.6s ease-out",
              minWidth: "220px",
              outline: "none",
              willChange: "transform, box-shadow"
            }}
          >
            🎵 Enter with Audio
          </button>
          
          <button
            onClick={handleEnterWithoutAudio}
            style={{
              padding: "12px 35px",
              background: "transparent",
              border: "2px solid #4a9eff",
              borderRadius: "30px",
              color: "#4a9eff",
              fontSize: "1rem",
              fontWeight: "500",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "background-color 0.1s ease, color 0.1s ease, transform 0.1s ease",
              animation: "fadeInUp 0.8s ease-out",
              minWidth: "220px",
              outline: "none",
              willChange: "background-color, color, transform"
            }}
          >
            🔇 Enter without Audio
          </button>
        </div>
      )}
      
      {/* Animated dots */}
      {!showEnterButton && (
        <div style={{
          marginTop: "20px",
          display: "flex",
          gap: "8px"
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                background: "linear-gradient(135deg, #4a9eff, #00d4ff)",
                borderRadius: "50%",
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Loading tips */}
      <div style={{
        position: "absolute",
        bottom: "40px",
        textAlign: "center",
        opacity: 0.5,
        fontSize: "0.8rem",
        maxWidth: "400px",
        padding: "0 20px"
      }}>
        <p>💡 Tip: Use mouse to orbit around the 3D scene once loaded</p>
        <p>⚡ View on Desktop for the better experience</p>
      </div>
    </div>
    </>
  )
}