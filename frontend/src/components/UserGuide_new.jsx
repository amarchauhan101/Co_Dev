import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import axios from "axios";

const UserGuide = ({ steps, onComplete, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("bottom");
  const tooltipRef = useRef(null);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (!steps || steps.length === 0) return;

    const positionTooltip = () => {
      // Remove existing highlights
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });

      const step = steps[currentStep];
      if (!step) return;

      const element = document.querySelector(step.selector);
      if (!element) {
        console.warn(`UserGuide: Element not found for selector: ${step.selector}`);
        return;
      }

      // Wait for any animations to complete
      const waitForElement = () => {
        return new Promise((resolve) => {
          const checkElement = () => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              resolve();
            } else {
              setTimeout(checkElement, 50);
            }
          };
          checkElement();
        });
      };

      waitForElement().then(() => {
        // Enhanced scroll element into view logic
        const scrollElement = () => {
          const rect = element.getBoundingClientRect();
          const headerHeight = 80;
          
          // Check if sidebar is open
          const sidebarElement = document.querySelector('[class*="menu-slide-in"]');
          const sidebarWidth = sidebarElement && window.innerWidth >= 1024 ? 320 : 0;
          
          // Check if element is properly visible
          const isVisible = rect.top >= headerHeight && 
                            rect.bottom <= window.innerHeight - 20 && 
                            rect.left >= sidebarWidth && 
                            rect.right <= window.innerWidth - 20;

          if (!isVisible) {
            // Smart scrolling to center element considering content flow
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = (window.innerHeight - headerHeight) / 2 + headerHeight;
            const scrollOffset = elementCenter - viewportCenter;
            
            // Smooth scroll with content-aware offset
            window.scrollBy({
              top: scrollOffset,
              behavior: 'smooth'
            });
            
            return new Promise((resolve) => setTimeout(resolve, 400));
          }
          return Promise.resolve();
        };

        // Scroll first, then position tooltip
        scrollElement().then(() => {
          setTimeout(() => {
            element.classList.add("tour-highlight");
            const rect = element.getBoundingClientRect();
            
            // Responsive tooltip dimensions
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            
            let tooltipWidth, tooltipHeight;
            if (isMobile) {
              tooltipWidth = Math.min(320, window.innerWidth - 20);
              tooltipHeight = 220;
            } else if (isTablet) {
              tooltipWidth = 360;
              tooltipHeight = 200;
            } else {
              tooltipWidth = 400;
              tooltipHeight = 200;
            }

            // Enhanced positioning calculation that follows content flow
            const headerHeight = 80;
            const sidebarElement = document.querySelector('[class*="menu-slide-in"]');
            const sidebarWidth = sidebarElement && window.innerWidth >= 1024 ? 320 : 0;
            const padding = isMobile ? 15 : 25;
            
            // Get preferred position from step definition
            const preferredPosition = step.position || "auto";
            
            const spaceBelow = window.innerHeight - rect.bottom - padding;
            const spaceAbove = rect.top - headerHeight - padding;
            const spaceLeft = rect.left - sidebarWidth - padding;
            const spaceRight = window.innerWidth - rect.right - padding;

            let top, left;
            let newPlacement = "bottom";

            // Position based on preferred direction with content awareness
            switch (preferredPosition) {
              case "top-center":
                if (spaceAbove >= tooltipHeight) {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                } else {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                }
                break;

              case "bottom-center":
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                }
                break;

              case "bottom-left":
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                }
                break;

              case "bottom-right":
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                }
                break;

              default: // "auto" - smart positioning that flows with content
                if (spaceBelow >= tooltipHeight) {
                  top = rect.bottom + 20;
                  newPlacement = "bottom";
                } else if (spaceAbove >= tooltipHeight) {
                  top = rect.top - tooltipHeight - 20;
                  newPlacement = "top";
                } else if (spaceRight >= tooltipWidth && !isMobile) {
                  top = Math.max(headerHeight + padding, rect.top + rect.height / 2 - tooltipHeight / 2);
                  top = Math.min(top, window.innerHeight - tooltipHeight - padding);
                  left = rect.right + 20;
                  newPlacement = "right";
                } else if (spaceLeft >= tooltipWidth && !isMobile) {
                  top = Math.max(headerHeight + padding, rect.top + rect.height / 2 - tooltipHeight / 2);
                  top = Math.min(top, window.innerHeight - tooltipHeight - padding);
                  left = rect.left - tooltipWidth - 20;
                  newPlacement = "left";
                } else {
                  top = rect.bottom + 20;
                  newPlacement = "bottom-constrained";
                  const maxHeight = Math.max(150, spaceBelow - 20);
                  tooltipHeight = Math.min(tooltipHeight, maxHeight);
                }
                break;
            }

            // Calculate horizontal position for top/bottom placements with content flow awareness
            if (newPlacement === "bottom" || newPlacement === "top" || newPlacement === "bottom-constrained") {
              const minLeft = sidebarWidth + padding;
              const maxLeft = window.innerWidth - tooltipWidth - padding;
              
              // Position based on preferred horizontal alignment
              if (preferredPosition === "bottom-left" || preferredPosition === "top-left") {
                left = Math.max(minLeft, rect.left - tooltipWidth / 4);
              } else if (preferredPosition === "bottom-right" || preferredPosition === "top-right") {
                left = Math.min(maxLeft, rect.right - (tooltipWidth * 3/4));
              } else {
                // Center on element (flows naturally with content)
                let preferredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
                left = Math.max(minLeft, Math.min(preferredLeft, maxLeft));
              }
              
              // Mobile adjustments
              if (isMobile) {
                left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
              }
            }

            // Final boundary checks to ensure tooltip stays within content area
            if (top < headerHeight + padding) {
              top = headerHeight + padding;
            }
            if (top + tooltipHeight > window.innerHeight - padding) {
              top = Math.max(headerHeight + padding, window.innerHeight - tooltipHeight - padding);
            }
            if (left < sidebarWidth + padding) {
              left = sidebarWidth + padding;
            }
            if (left + tooltipWidth > window.innerWidth - padding) {
              left = window.innerWidth - tooltipWidth - padding;
            }

            setTooltipPosition(newPlacement);
            
            // Apply tooltip positioning with smooth content-following animation
            if (tooltipRef.current) {
              Object.assign(tooltipRef.current.style, {
                top: `${top}px`,
                left: `${left}px`,
                width: `${tooltipWidth}px`,
                opacity: "1",
                transform: "translateY(0)",
                maxHeight: newPlacement === "bottom-constrained" ? `${tooltipHeight}px` : "none",
                overflow: newPlacement === "bottom-constrained" ? "auto" : "visible",
                position: "fixed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              });
            }
          }, isMobile ? 150 : 100);
        });
      });
    };

    // Smooth startup animation
    if (isFirstRender.current) {
      setIsVisible(true);
      setTimeout(positionTooltip, 300);
      isFirstRender.current = false;
    } else {
      const timer = setTimeout(positionTooltip, 200);
      return () => clearTimeout(timer);
    }

    // Enhanced event listeners for responsive repositioning
    let resizeTimer;
    let scrollTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(positionTooltip, 150);
    };

    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(positionTooltip, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
    };
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (isLoading) return;
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
    setShowSkipConfirm(false);
    onComplete();
  };

  if (!steps || steps.length === 0 || !isVisible) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm">
      {/* Skip Confirmation Dialog */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-3">
              Skip Tutorial?
            </h3>
            <p className="text-gray-300 mb-5">
              Are you sure you want to skip the onboarding guide? You can always
              access it later from your profile settings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSkip}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Skipping..." : "Skip Tutorial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Content-Following Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-gray-800/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-purple-500/30 p-6 z-[1000] opacity-0 transform translate-y-2 transition-all duration-300 ease-out"
        style={{
          minHeight: "180px",
          maxWidth: "400px",
        }}
      >
        {/* Dynamic Arrow that follows content */}
        <div
          className={`absolute w-0 h-0 transition-all duration-300 ${
            tooltipPosition === "top"
              ? "bottom-[-8px] left-1/2 transform -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-800/95"
              : tooltipPosition === "bottom" || tooltipPosition === "bottom-constrained"
              ? "top-[-8px] left-1/2 transform -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-800/95"
              : tooltipPosition === "left"
              ? "right-[-8px] top-1/2 transform -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-800/95"
              : tooltipPosition === "right"
              ? "left-[-8px] top-1/2 transform -translate-y-1/2 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-800/95"
              : "hidden"
          }`}
        />

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-purple-400 mb-2 leading-tight">
            {currentStepData.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-purple-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            disabled={isLoading}
          >
            Skip Tour
          </button>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm transition-all duration-300 hover:scale-105"
              disabled={isLoading}
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        .tour-highlight {
          outline: 3px solid rgba(168, 85, 247, 0.8) !important;
          outline-offset: 4px !important;
          border-radius: 8px !important;
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4) !important;
          position: relative !important;
          z-index: 999 !important;
          animation: pulse-highlight 2s infinite !important;
        }

        @keyframes pulse-highlight {
          0%, 100% {
            outline-color: rgba(168, 85, 247, 0.8);
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
          }
          50% {
            outline-color: rgba(236, 72, 153, 0.8);
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default UserGuide;
