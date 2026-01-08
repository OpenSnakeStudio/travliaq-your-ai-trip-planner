/**
 * usePerformance Tests
 *
 * Tests for performance optimization hooks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useStableCallback,
  useLazyInit,
  usePrevious,
  useUpdateEffect,
  useIsMounted,
  useRenderCount,
  useMemoCompare,
} from "../usePerformance";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("updates value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Still showing initial because timer kept resetting
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("c");
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debounces callback execution", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("arg1");
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith("arg1");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cancels previous calls on rapid invocation", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("c");
  });
});

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("initial", 100));
    expect(result.current).toBe("initial");
  });

  it("throttles value updates", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 0 } }
    );

    // Initial value is set immediately
    expect(result.current).toBe(0);

    // First update schedules a timer (since lastUpdated is initialized to Date.now())
    rerender({ value: 1 });
    // Still showing initial value - update is scheduled
    expect(result.current).toBe(0);

    // Rapid updates within interval
    rerender({ value: 2 });
    rerender({ value: 3 });

    // Still initial until interval passes
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // After timer, shows latest value
    expect(result.current).toBe(3);
  });
});

describe("useThrottledCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("executes first call immediately", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 100));

    act(() => {
      result.current("first");
    });

    expect(callback).toHaveBeenCalledWith("first");
  });

  it("throttles subsequent calls", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 100));

    act(() => {
      result.current("1");
      result.current("2");
      result.current("3");
    });

    // First call executes immediately
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("1");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Second call scheduled with "2" args (call "3" was ignored since timeout was pending)
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith("2");
  });
});

describe("useStableCallback", () => {
  it("returns same reference across renders", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }) => useStableCallback(cb),
      { initialProps: { cb: callback } }
    );

    const firstRef = result.current;

    rerender({ cb: vi.fn() });

    expect(result.current).toBe(firstRef);
  });

  it("calls the latest callback version", () => {
    const callback1 = vi.fn().mockReturnValue("first");
    const callback2 = vi.fn().mockReturnValue("second");

    const { result, rerender } = renderHook(
      ({ cb }) => useStableCallback(cb),
      { initialProps: { cb: callback1 } }
    );

    rerender({ cb: callback2 });

    act(() => {
      result.current();
    });

    expect(callback2).toHaveBeenCalled();
    expect(callback1).not.toHaveBeenCalled();
  });
});

describe("useLazyInit", () => {
  it("computes value only once", () => {
    const factory = vi.fn(() => "computed");
    const { result, rerender } = renderHook(() => useLazyInit(factory));

    expect(result.current).toBe("computed");
    expect(factory).toHaveBeenCalledTimes(1);

    rerender();
    rerender();

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("returns computed value on subsequent renders", () => {
    let counter = 0;
    const factory = () => ++counter;

    const { result, rerender } = renderHook(() => useLazyInit(factory));

    expect(result.current).toBe(1);
    rerender();
    expect(result.current).toBe(1);
  });
});

describe("usePrevious", () => {
  it("returns undefined on first render", () => {
    const { result } = renderHook(() => usePrevious(0));
    expect(result.current).toBeUndefined();
  });

  it("returns previous value after update", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 1 });
    expect(result.current).toBe(0);

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });
});

describe("useUpdateEffect", () => {
  it("does not run on mount", () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, []));

    expect(effect).not.toHaveBeenCalled();
  });

  it("runs on subsequent updates", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 0 } }
    );

    expect(effect).not.toHaveBeenCalled();

    rerender({ dep: 1 });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("runs cleanup function", () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);

    const { rerender, unmount } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 0 } }
    );

    rerender({ dep: 1 });
    expect(cleanup).not.toHaveBeenCalled();

    rerender({ dep: 2 });
    expect(cleanup).toHaveBeenCalledTimes(1);

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});

describe("useIsMounted", () => {
  it("returns true while mounted", () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current()).toBe(true);
  });

  it("returns false after unmount", () => {
    const { result, unmount } = renderHook(() => useIsMounted());

    const isMounted = result.current;
    unmount();

    expect(isMounted()).toBe(false);
  });
});

describe("useRenderCount", () => {
  it("tracks render count", () => {
    const { result, rerender } = renderHook(() => useRenderCount());

    expect(result.current).toBe(1);

    rerender();
    expect(result.current).toBe(2);

    rerender();
    expect(result.current).toBe(3);
  });

  it("logs with component name in development", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;

    // Note: In vitest, NODE_ENV is typically "test", not "development"
    // This test just verifies the hook doesn't crash with a name
    renderHook(() => useRenderCount("TestComponent"));

    consoleSpy.mockRestore();
  });
});

describe("useMemoCompare", () => {
  it("returns same reference when comparison is true", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useMemoCompare(value, (prev, next) => prev?.length === next.length),
      { initialProps: { value: [1, 2, 3] } }
    );

    const firstValue = result.current;

    // Same length array - should return previous
    rerender({ value: [4, 5, 6] });
    expect(result.current).toBe(firstValue);
  });

  it("returns new value when comparison is false", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useMemoCompare(value, (prev, next) => prev?.length === next.length),
      { initialProps: { value: [1, 2, 3] } }
    );

    const firstValue = result.current;

    // Different length - should return new value
    rerender({ value: [1, 2] });
    expect(result.current).not.toBe(firstValue);
    expect(result.current).toEqual([1, 2]);
  });

  it("handles undefined previous value", () => {
    const { result } = renderHook(
      ({ value }) => useMemoCompare(value, (prev, next) => prev?.id === next.id),
      { initialProps: { value: { id: 1 } } }
    );

    expect(result.current).toEqual({ id: 1 });
  });
});
