import { describe, it, expect } from "vitest";
import { getInviteSectionMode } from "@/features/order";

describe("getInviteSectionMode", () => {
  it("(초대코드 있음, 사용 불가) → ineligible", () => {
    expect(
      getInviteSectionMode({
        hasCapturedInvite: true,
        canUseInviteCode: false,
      }),
    ).toBe("ineligible");
  });

  it("(초대코드 있음, 사용 가능) → locked", () => {
    expect(
      getInviteSectionMode({
        hasCapturedInvite: true,
        canUseInviteCode: true,
      }),
    ).toBe("locked");
  });

  it("(초대코드 없음, 사용 불가) → hidden", () => {
    expect(
      getInviteSectionMode({
        hasCapturedInvite: false,
        canUseInviteCode: false,
      }),
    ).toBe("hidden");
  });

  it("(초대코드 없음, 사용 가능) → open", () => {
    expect(
      getInviteSectionMode({
        hasCapturedInvite: false,
        canUseInviteCode: true,
      }),
    ).toBe("open");
  });

  it("inviteDismissed=true이면 코드가 있어도 open/hidden으로 분기", () => {
    expect(
      getInviteSectionMode({
        hasCapturedInvite: true,
        canUseInviteCode: true,
        inviteDismissed: true,
      }),
    ).toBe("open");
    expect(
      getInviteSectionMode({
        hasCapturedInvite: true,
        canUseInviteCode: false,
        inviteDismissed: true,
      }),
    ).toBe("hidden");
  });
});
