import { CheckoutPromotionBanner } from "@/shared/ui";
import Script from "next/script";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import type { PackageData, PackagePurchaseProduct } from "@/entities/package";
import { OrderPriceSummaryBar } from "@/widgets/order/ui/order-section/OrderPriceSummaryBar";
import { OrderDeliveryMethodSection } from "@/widgets/order/ui/order-section/OrderDeliveryMethodSection";
import { QUANTITY_MIN, QUANTITY_MAX } from "./purchaseOrderHelpers";
import { PurchaseInviteCodeCard } from "./components/PurchaseInviteCodeCard";
import { PurchaseProductInfoCard } from "./components/PurchaseProductInfoCard";
import { PurchasePaymentMethodCard } from "./components/PurchasePaymentMethodCard";
import { PurchaseOrderSummaryCard } from "./components/PurchaseOrderSummaryCard";
import type { usePurchaseOrderSection } from "./usePurchaseOrderSection";

interface PurchaseOrderSectionViewProps {
  pkg: PackageData;
  purchaseProduct: PackagePurchaseProduct;
  imageUrl?: string | null;
  relatedPlanSlug?: string | null;
  vm: ReturnType<typeof usePurchaseOrderSection>;
}

export function PurchaseOrderSectionView({ pkg, purchaseProduct, imageUrl, relatedPlanSlug, vm }: PurchaseOrderSectionViewProps) {
  return (
    <div className="pt-[var(--header-offset)]">
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />

      <OrderPriceSummaryBar
        basePrice={vm.basePrice}
        totalDiscount={vm.totalDiscount}
        shippingFee={vm.shippingFee}
        total={vm.total}
      />

      <div className="bg-white">
        <div
          className="mx-auto w-full max-w-[1288px] px-6 max-md:py-6 md:pt-[52px] md:pb-[110px]"
        >
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[minmax(0,1fr)_1px_280px] md:gap-x-6 lg:grid-cols-[minmax(0,835fr)_1px_minmax(0,300fr)] lg:gap-x-[52px]">
            {/* 좌측 — 제품 · 배송지 · 결제수단 · 배송방법 */}
            <div className="flex flex-col max-md:gap-9 md:gap-10">
              <PurchaseProductInfoCard
                pkg={pkg}
                imageUrl={imageUrl}
                relatedPlanSlug={relatedPlanSlug}
                unitPrice={purchaseProduct.price}
                quantity={vm.quantity}
                onDecrease={() => vm.setQuantity((q) => Math.max(QUANTITY_MIN, q - 1))}
                onIncrease={() => vm.setQuantity((q) => Math.min(QUANTITY_MAX, q + 1))}
                open={vm.openSections.product}
                onToggle={() => vm.toggleSection("product")}
              />

              <CheckoutAddressSection
                variant="order"
                open={vm.openSections.customer}
                onToggle={() => vm.toggleSection("customer")}
                selectedAddress={vm.address.selectedAddress}
                onChangeAddress={vm.address.handleChangeAddress}
                newAddr={vm.address.newAddr}
                setNewAddr={vm.address.setNewAddr}
                phoneError={vm.address.phoneError}
                setPhoneError={vm.address.setPhoneError}
                onSearchAddress={vm.address.handleSearchAddress}
              />

              <PurchasePaymentMethodCard
                open={vm.openSections.payment}
                onToggle={() => vm.toggleSection("payment")}
                widgetLoadError={vm.widgetLoadError}
                paymentReady={vm.paymentReady}
                onRetry={vm.reloadWidget}
                couponCodeInput={vm.couponCodeInput}
                setCouponCodeInput={vm.setCouponCodeInput}
                couponEnabled={vm.couponEnabled}
                onToggleCoupon={vm.toggleCoupon}
                couponInfo={vm.couponInfo}
                couponError={vm.couponError}
                couponDiscount={vm.couponDiscount}
                onApplyCoupon={() => void vm.handleApplyCoupon()}
              />

              <PurchaseInviteCodeCard />

              <OrderDeliveryMethodSection
                open={vm.openSections.delivery}
                onToggle={() => vm.toggleSection("delivery")}
              />
            </div>

            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />

            {/* 우측 — 결제 정보 · 약관 · 결제 버튼 */}
            <div className="flex min-w-0 flex-col gap-6">
              <PurchaseOrderSummaryCard
                open={vm.openSections.summary}
                onToggle={() => vm.toggleSection("summary")}
                basePrice={vm.basePrice}
                totalDiscount={vm.totalDiscount}
                originalShippingFee={vm.originalShippingFee}
                shippingFee={vm.shippingFee}
                total={vm.total}
                quantity={vm.quantity}
                agreeOpen={vm.agreeOpen}
                agreeTerms={vm.agreeTerms}
                agreePrivacy={vm.agreePrivacy}
                agreeAge={vm.agreeAge}
                agreeAll={vm.agreeAll}
                onToggleAgreePanel={vm.toggleAgreePanel}
                onToggleTerms={vm.toggleTerms}
                onTogglePrivacy={vm.togglePrivacy}
                onToggleAge={vm.toggleAge}
                onAgreeAll={vm.handleAgreeAll}
                submitError={vm.submitError}
                isPaying={vm.isPaying}
                paymentReady={vm.paymentReady && !vm.isQuoting}
                onPay={() => void vm.handlePay()}
              />

              <CheckoutPromotionBanner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
