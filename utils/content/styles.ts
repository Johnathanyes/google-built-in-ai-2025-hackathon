// Inject CSS styles for content script

export function injectStyles(): void {
  const style = document.createElement("style");
  style.textContent = `
    /* Highlight capture animations */
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    /* Captured highlight styling */
    .captured-highlight {
      background-color: #ffeb3b !important;
      padding: 2px 0 !important;
      transition: background-color 0.3s ease !important;
    }

    .captured-highlight:hover {
      background-color: #fdd835 !important;
    }
  `;
  document.head.appendChild(style);
}

