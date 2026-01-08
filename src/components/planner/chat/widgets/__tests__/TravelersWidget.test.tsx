/**
 * TravelersWidget Tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TravelersWidget, TravelersConfirmBeforeSearchWidget } from "../TravelersWidget";

describe("TravelersWidget", () => {
  it("renders with default values", () => {
    const onConfirm = vi.fn();
    render(<TravelersWidget onConfirm={onConfirm} />);

    expect(screen.getByText("Adultes")).toBeInTheDocument();
    expect(screen.getByText("Enfants")).toBeInTheDocument();
    expect(screen.getByText("Bébés")).toBeInTheDocument();
    expect(screen.getByText("Confirmer (1 voyageur)")).toBeInTheDocument();
  });

  it("renders with custom initial values", () => {
    const onConfirm = vi.fn();
    render(
      <TravelersWidget
        initialValues={{ adults: 2, children: 1, infants: 0 }}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText("Confirmer (3 voyageurs)")).toBeInTheDocument();
  });

  it("prevents adults from going below 1", () => {
    const onConfirm = vi.fn();
    render(<TravelersWidget onConfirm={onConfirm} />);

    // The minus button for adults should be disabled when adults = 1
    const buttons = screen.getAllByRole("button");
    const adultMinusButton = buttons[0]; // First minus button is for adults

    expect(adultMinusButton).toBeDisabled();
  });

  it("increments adults correctly", () => {
    const onConfirm = vi.fn();
    render(<TravelersWidget onConfirm={onConfirm} />);

    const buttons = screen.getAllByRole("button");
    const adultPlusButton = buttons[1]; // Second button is plus for adults

    fireEvent.click(adultPlusButton);

    expect(screen.getByText("Confirmer (2 voyageurs)")).toBeInTheDocument();
  });

  it("increments children correctly", () => {
    const onConfirm = vi.fn();
    render(<TravelersWidget onConfirm={onConfirm} />);

    const buttons = screen.getAllByRole("button");
    const childrenPlusButton = buttons[3]; // Plus button for children

    fireEvent.click(childrenPlusButton);

    expect(screen.getByText("Confirmer (2 voyageurs)")).toBeInTheDocument();
  });

  it("calls onConfirm with correct values", () => {
    const onConfirm = vi.fn();
    render(
      <TravelersWidget
        initialValues={{ adults: 2, children: 1, infants: 1 }}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByText("Confirmer (4 voyageurs)");
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith({
      adults: 2,
      children: 1,
      infants: 1,
    });
  });

  it("shows confirmation state after confirm", () => {
    const onConfirm = vi.fn();
    render(
      <TravelersWidget
        initialValues={{ adults: 2, children: 1, infants: 0 }}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByText("Confirmer (3 voyageurs)");
    fireEvent.click(confirmButton);

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("2 adultes, 1 enfant")).toBeInTheDocument();
  });

  it("limits infants to number of adults", () => {
    const onConfirm = vi.fn();
    render(
      <TravelersWidget
        initialValues={{ adults: 1, children: 0, infants: 0 }}
        onConfirm={onConfirm}
      />
    );

    const buttons = screen.getAllByRole("button");
    const infantPlusButton = buttons[5]; // Plus button for infants

    // Click to add 1 infant
    fireEvent.click(infantPlusButton);

    // Should not be able to add more (max = adults = 1)
    expect(infantPlusButton).toBeDisabled();
  });

  it("adjusts infants when adults decrease", () => {
    const onConfirm = vi.fn();
    render(
      <TravelersWidget
        initialValues={{ adults: 2, children: 0, infants: 2 }}
        onConfirm={onConfirm}
      />
    );

    const buttons = screen.getAllByRole("button");
    const adultMinusButton = buttons[0];

    // Decrease adults from 2 to 1
    fireEvent.click(adultMinusButton);

    // Infants should be reduced to 1 (max = adults)
    expect(screen.getByText("Confirmer (2 voyageurs)")).toBeInTheDocument();
  });
});

describe("TravelersConfirmBeforeSearchWidget", () => {
  it("renders solo confirmation question", () => {
    const onConfirm = vi.fn();
    const onEditConfirm = vi.fn();
    render(
      <TravelersConfirmBeforeSearchWidget
        currentTravelers={{ adults: 1, children: 0, infants: 0 }}
        onConfirm={onConfirm}
        onEditConfirm={onEditConfirm}
      />
    );

    expect(screen.getByText(/seul\(e\)/)).toBeInTheDocument();
    expect(screen.getByText(/Oui, je pars seul/)).toBeInTheDocument();
    expect(screen.getByText(/Non, modifier/)).toBeInTheDocument();
  });

  it("calls onConfirm when solo is confirmed", () => {
    const onConfirm = vi.fn();
    const onEditConfirm = vi.fn();
    render(
      <TravelersConfirmBeforeSearchWidget
        currentTravelers={{ adults: 1, children: 0, infants: 0 }}
        onConfirm={onConfirm}
        onEditConfirm={onEditConfirm}
      />
    );

    fireEvent.click(screen.getByText(/Oui, je pars seul/));

    expect(onConfirm).toHaveBeenCalled();
    expect(onEditConfirm).not.toHaveBeenCalled();
  });

  it("shows edit form when modify is clicked", () => {
    const onConfirm = vi.fn();
    const onEditConfirm = vi.fn();
    render(
      <TravelersConfirmBeforeSearchWidget
        currentTravelers={{ adults: 1, children: 0, infants: 0 }}
        onConfirm={onConfirm}
        onEditConfirm={onEditConfirm}
      />
    );

    fireEvent.click(screen.getByText(/Non, modifier/));

    expect(screen.getByText("Adultes")).toBeInTheDocument();
    expect(screen.getByText("Enfants")).toBeInTheDocument();
  });

  it("calls onEditConfirm with modified values", () => {
    const onConfirm = vi.fn();
    const onEditConfirm = vi.fn();
    render(
      <TravelersConfirmBeforeSearchWidget
        currentTravelers={{ adults: 1, children: 0, infants: 0 }}
        onConfirm={onConfirm}
        onEditConfirm={onEditConfirm}
      />
    );

    // Click modify
    fireEvent.click(screen.getByText(/Non, modifier/));

    // Increase adults
    const buttons = screen.getAllByRole("button");
    const adultPlusButton = buttons[1];
    fireEvent.click(adultPlusButton);

    // Confirm
    fireEvent.click(screen.getByText(/Confirmer \(2 voyageurs\)/));

    expect(onEditConfirm).toHaveBeenCalledWith({
      adults: 2,
      children: 0,
      infants: 0,
    });
  });
});
