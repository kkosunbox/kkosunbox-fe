import Image from "next/image";
import { COMPARE_PACKAGES, PACKAGE_COMPARISON_ROWS } from "@/entities/package";
import logo from "@/shared/assets/logo-main.svg";
import styles from "./PackageComparison.module.css";

export function PackageComparison() {
  return (
    <section className={styles.section} aria-labelledby="package-comparison-title">
      <h2 id="package-comparison-title" className="text-display-28-eb">
        한눈에 보는 <span>패키지 비교</span>
      </h2>
      <p className="text-body-16-m">우리 아이에게 맞는 구성을 비교해보고 선택해보세요.</p>
      <p className={styles.scrollHint}>표를 좌우로 밀어 패키지 구성을 비교해보세요.</p>
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
