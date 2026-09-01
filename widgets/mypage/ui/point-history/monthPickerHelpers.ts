interface PickerBoundary {
  getClientRects: () => { length: number };
  contains: (target: Node | null) => boolean;
}

/** 보이는 배너 바깥에서 발생한 포인터 이벤트만 picker 닫기로 판정한다. */
export function shouldCloseMonthPicker(
  banner: PickerBoundary | null,
  target: Node | null,
): boolean {
  return Boolean(
    banner &&
    banner.getClientRects().length > 0 &&
    !banner.contains(target),
  );
}
