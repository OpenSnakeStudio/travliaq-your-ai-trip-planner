/**
 * ChatDebugHUD - Temporary debug overlay for diagnosing input blocking issues
 * 
 * Displays real-time diagnostics:
 * - Current activeElement
 * - Element at center of chat input (via elementFromPoint)
 * - Relevant CSS properties
 * 
 * Enable via ?debugChat=1 query param
 */

import { useEffect, useState, useCallback } from "react";
import { X, Copy, Check } from "lucide-react";

interface DiagnosticsData {
  activeElement: string;
  activeElementTag: string;
  topElementAtInput: string | null;
  topElementPointerEvents: string | null;
  topElementZIndex: string | null;
  topElementPosition: string | null;
  bodyPointerEvents: string;
  htmlPointerEvents: string;
  inputRect: { x: number; y: number; width: number; height: number } | null;
  overlaysDetected: string[];
  timestamp: number;
}

function getElementDescriptor(el: Element | null): string {
  if (!el) return "null";
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const classes = el.className && typeof el.className === "string" 
    ? `.${el.className.split(" ").filter(Boolean).slice(0, 3).join(".")}` 
    : "";
  return `${tag}${id}${classes}`;
}

function detectOverlays(): string[] {
  const overlays: string[] = [];
  
  // Check for common overlay patterns
  const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
  const dialogBackdrops = document.querySelectorAll('[data-radix-dialog-overlay], [data-radix-alert-dialog-overlay], [role="dialog"]');
  const driverOverlays = document.querySelectorAll('.driver-overlay, .driver-popover, .driver-active');
  const sheetBackdrops = document.querySelectorAll('[data-vaul-overlay], [data-vaul-drawer]');
  
  // Check fixed elements that might block
  fixedElements.forEach((el) => {
    const cs = window.getComputedStyle(el);
    if (cs.pointerEvents !== "none" && cs.zIndex !== "auto" && parseInt(cs.zIndex) > 10) {
      overlays.push(`fixed:${getElementDescriptor(el)}(z:${cs.zIndex})`);
    }
  });
  
  dialogBackdrops.forEach((el) => overlays.push(`dialog:${getElementDescriptor(el)}`));
  driverOverlays.forEach((el) => overlays.push(`driver:${getElementDescriptor(el)}`));
  sheetBackdrops.forEach((el) => overlays.push(`sheet:${getElementDescriptor(el)}`));
  
  return overlays.slice(0, 10); // Limit to 10
}

export function ChatDebugHUD({ inputRef }: { inputRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [copied, setCopied] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const updateDiagnostics = useCallback(() => {
    const input = inputRef.current;
    const inputRect = input?.getBoundingClientRect();
    
    // Get element at center of input
    let topElement: Element | null = null;
    let topElementCs: CSSStyleDeclaration | null = null;
    
    if (inputRect) {
      const centerX = inputRect.left + inputRect.width / 2;
      const centerY = inputRect.top + inputRect.height / 2;
      topElement = document.elementFromPoint(centerX, centerY);
      topElementCs = topElement ? window.getComputedStyle(topElement) : null;
    }
    
    const bodyCs = window.getComputedStyle(document.body);
    const htmlCs = window.getComputedStyle(document.documentElement);
    
    setDiagnostics({
      activeElement: getElementDescriptor(document.activeElement),
      activeElementTag: document.activeElement?.tagName || "null",
      topElementAtInput: topElement ? getElementDescriptor(topElement) : null,
      topElementPointerEvents: topElementCs?.pointerEvents ?? null,
      topElementZIndex: topElementCs?.zIndex ?? null,
      topElementPosition: topElementCs?.position ?? null,
      bodyPointerEvents: bodyCs.pointerEvents,
      htmlPointerEvents: htmlCs.pointerEvents,
      inputRect: inputRect ? {
        x: Math.round(inputRect.x),
        y: Math.round(inputRect.y),
        width: Math.round(inputRect.width),
        height: Math.round(inputRect.height),
      } : null,
      overlaysDetected: detectOverlays(),
      timestamp: Date.now(),
    });
  }, [inputRef]);

  // Update diagnostics on interval and on focus/click events
  useEffect(() => {
    updateDiagnostics();
    
    const interval = setInterval(updateDiagnostics, 500);
    
    // Capture phase listeners for deep diagnostics
    const logEvent = (type: string) => (e: Event) => {
      const target = e.target as Element | null;
      // eslint-disable-next-line no-console
      console.log(`[ChatDebug:${type}]`, {
        target: getElementDescriptor(target),
        activeElement: getElementDescriptor(document.activeElement),
        defaultPrevented: e.defaultPrevented,
        composedPath: e.composedPath().slice(0, 5).map((el) => getElementDescriptor(el as Element)),
      });
    };
    
    document.addEventListener("pointerdown", logEvent("pointerdown"), true);
    document.addEventListener("mousedown", logEvent("mousedown"), true);
    document.addEventListener("focusin", logEvent("focusin"), true);
    document.addEventListener("keydown", (e) => {
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        // eslint-disable-next-line no-console
        console.log(`[ChatDebug:keydown]`, {
          key: e.key,
          target: getElementDescriptor(e.target as Element),
          defaultPrevented: e.defaultPrevented,
        });
      }
    }, true);
    
    return () => {
      clearInterval(interval);
      // Note: We don't remove the event listeners here to keep logging active
    };
  }, [updateDiagnostics]);

  const handleCopy = async () => {
    if (!diagnostics) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // eslint-disable-next-line no-console
      console.error("Failed to copy diagnostics");
    }
  };

  if (!diagnostics) return null;

  // Check if input is blocked
  const isInputBlocked = diagnostics.topElementAtInput && 
    !diagnostics.topElementAtInput.includes("textarea") &&
    diagnostics.topElementPointerEvents !== "none";

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className={`fixed bottom-4 right-4 z-[9999] px-3 py-2 rounded-lg text-xs font-mono shadow-lg ${
          isInputBlocked ? "bg-red-500 text-white animate-pulse" : "bg-yellow-500 text-black"
        }`}
      >
        🔧 Debug {isInputBlocked ? "⚠️ BLOCKED" : "OK"}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 max-h-96 overflow-auto bg-black/90 text-white text-xs font-mono rounded-lg shadow-2xl border border-yellow-500">
      <div className="sticky top-0 bg-yellow-500 text-black px-3 py-2 flex items-center justify-between">
        <span className="font-bold">🔧 Chat Debug HUD</span>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="hover:bg-yellow-600 p-1 rounded">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
          <button onClick={() => setMinimized(true)} className="hover:bg-yellow-600 p-1 rounded">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        {isInputBlocked && (
          <div className="bg-red-500/30 border border-red-500 rounded p-2 text-red-200">
            ⚠️ INPUT BLOCKED by: {diagnostics.topElementAtInput}
          </div>
        )}
        
        <div className="space-y-1">
          <div><span className="text-yellow-400">activeElement:</span> {diagnostics.activeElement}</div>
          <div><span className="text-yellow-400">topAtInput:</span> {diagnostics.topElementAtInput ?? "N/A"}</div>
          <div><span className="text-yellow-400">topPointerEvents:</span> {diagnostics.topElementPointerEvents}</div>
          <div><span className="text-yellow-400">topZIndex:</span> {diagnostics.topElementZIndex}</div>
          <div><span className="text-yellow-400">topPosition:</span> {diagnostics.topElementPosition}</div>
          <div><span className="text-yellow-400">body.pointerEvents:</span> {diagnostics.bodyPointerEvents}</div>
          <div><span className="text-yellow-400">html.pointerEvents:</span> {diagnostics.htmlPointerEvents}</div>
        </div>
        
        {diagnostics.overlaysDetected.length > 0 && (
          <div className="border-t border-yellow-500/30 pt-2 mt-2">
            <div className="text-yellow-400 mb-1">Overlays detected:</div>
            {diagnostics.overlaysDetected.map((o, i) => (
              <div key={i} className="text-orange-300 truncate">{o}</div>
            ))}
          </div>
        )}
        
        <div className="text-gray-500 text-[10px]">
          Updated: {new Date(diagnostics.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export function useChatDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debugChat");
}
