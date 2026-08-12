import Image from "next/image";
import Script from "next/script";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import type { PackageData, PackagePurchaseProduct } from "@/entities/package";
import { OrderPriceSummaryBar } from "@/widgets/order/ui/order-section/OrderPriceSummaryBar";
import { OrderDeliveryMethodSection } from "@/widgets/order/ui/order-section/OrderDeliveryMethodSection";
import { QUANTITY_MIN, QUANTITY_MAX } from "./purchaseOrderHelpers";
import { PurchaseProductInfoCard } from "./components/PurchaseProductInfoCard";
import { PurchasePaymentMethodCard } from "./components/PurchasePaymentMethodCard";
import { PurchaseOrderSummaryCard } from "./components/PurchaseOrderSummaryCard";
import type { usePurchaseOrderSection } from "./usePurchaseOrderSection";

interface PurchaseOrderSectionViewProps {
  pkg: PackageData;
  purchaseProduct: PackagePurchaseProduct;
  vm: ReturnType<typeof usePurchaseOrderSection>;
}

export function PurchaseOrderSectionView({ pkg, purchaseProduct, vm }: PurchaseOrderSectionViewProps) {
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
        originalShippingFee={vm.originalShippingFee}
        total={vm.total}
      />

      <div className="bg-white">
        <div
          className="mx-auto max-lg:px-6 max-md:pt-6 md:py-8 lg:px-0"
          style={{ maxWidth: "var(--max-width-content)" }}
        >
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[55%_1px_1fr] md:gap-x-6 lg:grid-cols-[1fr_1px_327px] lg:gap-x-8">
            {/* 좌측 — 제품 · 배송지 · 결제수단 · 배송방법 */}
            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <PurchaseProductInfoCard
                pkg={pkg}
                unitPrice={purchaseProduct.price}
                quantity={vm.quantity}
                onDecrease={() => vm.setQuantity((q) => Math.max(QUANTITY_MIN, q - 1))}
                onIncrease={() => vm.setQuantity((q) => Math.min(QUANTITY_MAX, q + 1))}
                open={vm.openSections.product}
                onToggle={() => vm.toggleSection("product")}
              />

              <CheckoutAddressSection
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
                couponInfo={vm.couponInfo}
                couponError={vm.couponError}
                couponDiscount={vm.couponDiscount}
                onApplyCoupon={() => void vm.handleApplyCoupon()}
              />

              <OrderDeliveryMethodSection
                open={vm.openSections.delivery}
                onToggle={() => vm.toggleSection("delivery")}
              />
            </div>

            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />

            {/* 우측 — 결제 정보 · 약관 · 결제 버튼 */}
            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <PurchaseOrderSummaryCard
                open={vm.openSections.summary}
                onToggle={() => vm.toggleSection("summary")}
                basePrice={vm.basePrice}
                totalDiscount={vm.totalDiscount}
                originalShippingFee={vm.originalShippingFee}
                shippingFee={vm.shippingFee}
                total={vm.total}
                agreeOpen={vm.agreeOpen}
                agreeTerms={vm.agreeTerms}
                agreePrivacy={vm.agreePrivacy}
                agreeAll={vm.agreeAll}
                onToggleAgreePanel={vm.toggleAgreePanel}
                onToggleTerms={vm.toggleTerms}
                onTogglePrivacy={vm.togglePrivacy}
                onAgreeAll={vm.handleAgreeAll}
                submitError={vm.submitError}
                isPaying={vm.isPaying}
                paymentReady={vm.paymentReady}
                onPay={() => void vm.handlePay()}
              />

              <div className="overflow-hidden max-md:mx-[calc(50%_-_50vw)] max-md:rounded-none md:mx-3 md:rounded-[8px]">
                <Image
                  src="/images/sidebar-banner-001.png"
                  alt="꼬순박스 배너"
                  width={375}
                  height={126}
                  quality={HIGH_IMAGE_QUALITY}
                  className="h-auto w-full"
                  sizes="(min-width: 1024px) 303px, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
