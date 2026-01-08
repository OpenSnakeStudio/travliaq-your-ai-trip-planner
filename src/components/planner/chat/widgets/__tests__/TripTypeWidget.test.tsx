/**
 * TripTypeWidget Tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TripTypeConfirmWidget } from "../TripTypeWidget";

describe("TripTypeConfirmWidget", () => {
  it("renders all three options", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    expect(screen.getByText(/Aller-retour/)).toBeInTheDocument();
    expect(screen.getByText(/Aller simple/)).toBeInTheDocument();
    expect(screen.getByText(/Multi-destinations/)).toBeInTheDocument();
  });

  it("calls onConfirm with roundtrip when roundtrip is clicked", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText(/Aller-retour/));

    expect(onConfirm).toHaveBeenCalledWith("roundtrip");
  });

  it("calls onConfirm with oneway when oneway is clicked", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText(/Aller simple/));

    expect(onConfirm).toHaveBeenCalledWith("oneway");
  });

  it("calls onConfirm with multi when multi is clicked", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText(/Multi-destinations/));

    expect(onConfirm).toHaveBeenCalledWith("multi");
  });

  it("shows confirmation state after selection", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText(/Aller-retour/));

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("Aller-retour")).toBeInTheDocument();
  });

  it("shows correct label for oneway confirmation", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText(/Aller simple/));

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("Aller simple")).toBeInTheDocument();
  });

  it("shows correct label for multi confirmation", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText(/Multi-destinations/));

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("Multi-destinations")).toBeInTheDocument();
  });

  it("respects currentType prop", () => {
    const onConfirm = vi.fn();
    render(<TripTypeConfirmWidget currentType="oneway" onConfirm={onConfirm} />);

    // All options should still be visible
    expect(screen.getByText(/Aller-retour/)).toBeInTheDocument();
    expect(screen.getByText(/Aller simple/)).toBeInTheDocument();
    expect(screen.getByText(/Multi-destinations/)).toBeInTheDocument();
  });
});
