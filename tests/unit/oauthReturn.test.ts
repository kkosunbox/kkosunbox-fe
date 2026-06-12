import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setOAuthReturnPath, consumeOAuthReturnPath } from "@/features/auth/lib/oauthReturn";

function createSessionStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe("oauthReturn", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createSessionStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("상대 경로만 저장·소비", () => {
    setOAuthReturnPath("/order?planId=1");
    expect(consumeOAuthReturnPath()).toBe("/order?planId=1");
    expect(consumeOAuthReturnPath()).toBeNull();
  });

  it("외부 URL은 저장하지 않음", () => {
    setOAuthReturnPath("https://evil.com");
    expect(consumeOAuthReturnPath()).toBeNull();
  });
});
