/**
 * ChatLab - Isolated chat component for debugging
 * 
 * This page renders ONLY the PlannerChat component without:
 * - Map
 * - Panels (flights, hotels, activities)
 * - ResizablePanelGroup
 * - Onboarding
 * - Any overlays
 * 
 * Use this to isolate chat input issues from layout/overlay problems.
 * Access via /chat-lab
 */

import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import PlannerChat, { type PlannerChatRef } from "@/components/planner/PlannerChat";
import { TravelMemoryProvider } from "@/contexts/TravelMemoryContext";
import { PreferenceMemoryProvider } from "@/contexts/PreferenceMemoryContext";
import { FlightMemoryProvider } from "@/contexts/FlightMemoryContext";
import { AccommodationMemoryProvider } from "@/contexts/AccommodationMemoryContext";
import { ActivityMemoryProvider } from "@/contexts/ActivityMemoryContext";

export default function ChatLab() {
  const chatRef = useRef<PlannerChatRef>(null);

  return (
    <>
      <Helmet>
        <title>Chat Lab - Debug | Travliaq</title>
      </Helmet>
      
      <TravelMemoryProvider>
        <PreferenceMemoryProvider>
          <FlightMemoryProvider>
            <AccommodationMemoryProvider>
              <ActivityMemoryProvider>
                <div className="h-screen w-full flex flex-col bg-background">
                  {/* Header */}
                  <div className="flex-none h-12 bg-yellow-500 text-black px-4 flex items-center gap-2 font-mono text-sm">
                    <span className="font-bold">🧪 ChatLab</span>
                    <span className="text-yellow-800">— Isolated chat component (no overlays, no panels)</span>
                    <a 
                      href="/planner" 
                      className="ml-auto underline hover:no-underline"
                    >
                      ← Back to Planner
                    </a>
                  </div>
                  
                  {/* Chat takes full remaining height */}
                  <div className="flex-1 min-h-0">
                    <PlannerChat
                      ref={chatRef}
                      isCollapsed={false}
                    />
                  </div>
                </div>
              </ActivityMemoryProvider>
            </AccommodationMemoryProvider>
          </FlightMemoryProvider>
        </PreferenceMemoryProvider>
      </TravelMemoryProvider>
    </>
  );
}
