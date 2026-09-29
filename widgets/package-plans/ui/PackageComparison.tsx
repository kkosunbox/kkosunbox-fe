"use client";

import Image from "next/image";
import { useState } from "react";
import { COMPARE_PACKAGES, PACKAGE_COMPARISON_ROWS } from "@/entities/package";
import logo from "@/shared/assets/logo-main.svg";
import styles from "./PackageComparison.module.css";

function ComparisonArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d={direction === "left" ? "M8.5 1.5L2 8L8.5 14.5" : "M1.5 1.5L8 8L1.5 14.5"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PackageComparison() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPackage = COMPARE_PACKAGES[selectedIndex];

  function move(direction: number) {
    setSelectedIndex(current => (current + direction + COMPARE_PACKAGES.length) % COMPARE_PACKAGES.length);
  }

  return (
    <section className={styles.section} aria-labelledby="package-comparison-title">
      <h2 id="package-comparison-title" className="text-display-28-eb">
        한눈에 보는 <span>패키지 비교</span>
      </h2>
      <p className="text-body-16-m">우리 아이에게 맞는 구성을 비교해보고 선택해보세요.</p>
      <p className={styles.scrollHint}>표를 좌우로 밀어 패키지 구성을 비교해보세요.</p>
      <div className={styles.mobileTabs} role="group" aria-label="비교할 패키지 선택">
        {COMPARE_PACKAGES.map((pkg, index) => (
          <button key={pkg.tier} type="button" aria-pressed={selectedIndex === index} onClick={() => setSelectedIndex(index)}>
            {pkg.name.replace(/ 패키지 BOX$/, "")}
          </button>
        ))}
      </div>
      <div className={styles.mobileComparison}>
        <Image className={styles.mobileLogo} src={logo} width={84} height={28} alt="꼬순박스" />
        <div className={styles.mobileValuePanel}>
          <h3>{selectedPackage.name.replace(" BOX", "")}</h3>
          <div className={styles.mobileValues}>
            {PACKAGE_COMPARISON_ROWS.map(row => {
              const value = row.contents[selectedPackage.tier];
              return value ? (
                <span className={styles.mobileValue} key={row.label}>
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" style={{ color: selectedPackage.colorVar }}>
                    <circle cx="8" cy="8" r="8" fill="currentColor" opacity=".65" />
                    <path d="m4 8 2.4 2.4L12 4.8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {value}
                </span>
              ) : <span key={row.label} aria-label="포함되지 않음">–</span>;
            })}
          </div>
        </div>
        <div className={styles.mobileSummary}>
          <strong>간식 총평</strong>
          <span style={{ color: selectedPackage.colorVar }}>{selectedPackage.quote.replace("\n", " ")}</span>
        </div>
        <div className={styles.mobileLabels}>
          {PACKAGE_COMPARISON_ROWS.map(row => <strong key={row.label}>{row.label}</strong>)}
        </div>
        <nav className={styles.mobileControls} aria-label="비교 패키지 이동">
          <button type="button" aria-label="이전 패키지" onClick={() => move(-1)}><ComparisonArrow direction="left" /></button>
          <button type="button" aria-label="다음 패키지" onClick={() => move(1)}><ComparisonArrow direction="right" /></button>
        </nav>
      </div>
      <div className={styles.scroller} tabIndex={0} role="region" aria-label="패키지 구성 비교표, 좌우 스크롤 가능">
        <table className={styles.table}>
          <caption className="sr-only">베이직, 스탠다드, 프리미엄 패키지 간식 구성 비교</caption>
          <colgroup><col className={styles.labelColumn} /><col /><col /><col /></colgroup>
          <thead>
            <tr>
              <th scope="col"><Image src={logo} width={96} height={32} alt="꼬순박스" /></th>
              {COMPARE_PACKAGES.map(pkg => <th scope="col" key={pkg.tier}>{pkg.name.replace(" BOX", "")}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className={styles.summary}>
              <th scope="row">간식 총평</th>
              {COMPARE_PACKAGES.map(pkg => <td key={pkg.tier} style={{ color: pkg.colorVar }}>{pkg.quote.replace("\n", " ")}</td>)}
            </tr>
            {PACKAGE_COMPARISON_ROWS.map(row => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {COMPARE_PACKAGES.map(pkg => (
                  <td key={pkg.tier}>
                    {row.contents[pkg.tier] ? <span className={styles.item}>
                      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" style={{ color: pkg.colorVar }}>
                        <circle cx="10" cy="10" r="10" fill="currentColor" opacity=".65" />
                        <path d="m5 10 3 3 7-7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {row.contents[pkg.tier]}
                    </span> : <><span aria-hidden="true">–</span><span className="sr-only">포함되지 않음</span></>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
