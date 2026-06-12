import { describe, it, expect } from "vitest";
import { getInviteSectionMode } from "@/features/order";

describe("getInviteSectionMode", () => {
  it("(invite 있음, history 있음) → ineligible", () => {
    expect(
      getInviteSectionMode({
        initialInviteCode: "FRIEND10",
        hasSubscriptionHistory: true,
      }),
    ).toBe("ineligible");
  });

  it("(invite 있음, history 없음) → locked", () => {
    expect(
      getInviteSectionMode({
        initialInviteCode: "FRIEND10",
        hasSubscriptionHistory: false,
      }),
    ).toBe("locked");
  });

  it("(invite 없음, history 있음) → hidden", () => {
    expect(
      getInviteSectionMode({
        initialInviteCode: null,
        hasSubscriptionHistory: true,
      }),
    ).toBe("hidden");
  });

  it("(invite 없음, history 없음) → open", () => {
    expect(
      getInviteSectionMode({
        initialInviteCode: null,
        hasSubscriptionHistory: false,
      }),
    ).toBe("open");
  });

  it("inviteDismissed=true이면 쿠키가 있어도 open/hidden으로 분기", () => {
    expect(
      getInviteSectionMode({
        initialInviteCode: "FRIEND10",
        hasSubscriptionHistory: false,
        inviteDismissed: true,
      }),
    ).toBe("open");
    expect(
      getInviteSectionMode({
        initialInviteCode: "FRIEND10",
        hasSubscriptionHistory: true,
        inviteDismissed: true,
      }),
    ).toBe("hidden");
  });
});
