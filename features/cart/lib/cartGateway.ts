import { addCartItem, deleteCartItem, getCart, getCartCount, quoteCart, updateCartItem } from "../api/cartApi";
import type { CartDto, CartPriceDto } from "../api/types";
import {
  addGuestCartItem,
  deleteGuestCartItem,
  getGuestCart,
  getGuestCartCount,
  mergeGuestCartIntoMember,
  quoteGuestCart,
  updateGuestCartItem,
} from "./guestCart";

/** 회원(서버) / 비회원(브라우저) 장바구니를 같은 인터페이스로 다룬다 */
export interface CartGateway {
  getCart: () => Promise<CartDto>;
  getCount: () => Promise<number>;
  add: (productId: number, quantity: number) => Promise<CartDto>;
  update: (id: number, quantity: number) => Promise<CartDto>;
  remove: (id: number) => Promise<void>;
  quote: (ids: number[]) => Promise<CartPriceDto>;
}

/** 로그인 직후 비회원 장바구니를 서버 장바구니로 합친다 — 바뀌었으면 true */
export function mergeGuestCart() {
  return mergeGuestCartIntoMember((productId, quantity) => addCartItem({ productId, quantity }));
}

/** 회원 장바구니 조회는 비회원 장바구니 병합이 끝난 뒤에 한다 — 로그인 직후 진입한 화면이 병합 전 상태를 보지 않게 */
const afterGuestMerge = () => mergeGuestCart().catch(() => false);

const memberCartGateway: CartGateway = {
  getCart: () => afterGuestMerge().then(getCart),
  getCount: () => afterGuestMerge().then(getCartCount).then((data) => data.count),
  add: (productId, quantity) => addCartItem({ productId, quantity }),
  update: (id, quantity) => updateCartItem(id, { quantity }),
  remove: (id) => deleteCartItem(id).then(() => undefined),
  quote: (ids) => quoteCart({ cartItemIds: ids }),
};

const guestCartGateway: CartGateway = {
  getCart: getGuestCart,
  getCount: () => Promise.resolve(getGuestCartCount()),
  add: addGuestCartItem,
  update: updateGuestCartItem,
  remove: deleteGuestCartItem,
  quote: quoteGuestCart,
};

export function getCartGateway(isLoggedIn: boolean): CartGateway {
  return isLoggedIn ? memberCartGateway : guestCartGateway;
}

