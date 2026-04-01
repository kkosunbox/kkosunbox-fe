"use client";

const STATS = [
  {
    icon:
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26.6666 8L11.9999 22.6667L5.33325 16" stroke="var(--color-secondary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    , label: "1:1 맞춤 케어"
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.66675 10.9902C4.66675 10.1727 4.66675 9.76393 4.81899 9.39639C4.97123 9.02885 5.26026 8.73982 5.83832 8.16176L6.99518 7.0049C7.57324 6.42684 7.86227 6.13781 8.22981 5.98557C8.59735 5.83333 9.0061 5.83333 9.8236 5.83333H18.1766C18.9941 5.83333 19.4028 5.83333 19.7704 5.98557C20.1379 6.13781 20.4269 6.42684 21.005 7.0049L22.1618 8.16176C22.7399 8.73982 23.0289 9.02885 23.1812 9.39639C23.3334 9.76393 23.3334 10.1727 23.3334 10.9902V19.3333C23.3334 21.2189 23.3334 22.1618 22.7476 22.7475C22.1618 23.3333 21.219 23.3333 19.3334 23.3333H8.66674C6.78113 23.3333 5.83832 23.3333 5.25253 22.7475C4.66675 22.1618 4.66675 21.2189 4.66675 19.3333V10.9902Z" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" />
      <path d="M4.66675 11.6667H23.3334" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" />
      <path d="M17.3053 10.5L10.6942 10.5C10.4192 10.5 10.2817 10.5 10.1963 10.5854C10.1108 10.6709 10.1108 10.8083 10.1108 11.0833L10.1108 15.9444C10.1108 16.8367 10.1108 17.2829 10.2262 17.5227C10.4838 18.0579 11.1025 18.3142 11.6631 18.1178C11.9143 18.0299 12.2298 17.7144 12.8607 17.0835C13.1529 16.7913 13.299 16.6451 13.4544 16.563C13.7956 16.3826 14.2039 16.3826 14.5451 16.563C14.7004 16.6451 14.8465 16.7913 15.1388 17.0835C15.7697 17.7144 16.0852 18.0299 16.3363 18.1178C16.897 18.3142 17.5156 18.0579 17.7732 17.5227C17.8886 17.2829 17.8886 16.8367 17.8886 15.9444V11.0833C17.8886 10.8083 17.8886 10.6709 17.8032 10.5854C17.7178 10.5 17.5803 10.5 17.3053 10.5Z" fill="var(--color-secondary)" />
    </svg>
    , label: "이중 안심 포장"
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="9" r="5" stroke="var(--color-secondary)" stroke-width="2" />
      <circle cx="14" cy="20" r="4" stroke="var(--color-secondary)" stroke-width="2" />
      <circle cx="7" cy="11" r="3" stroke="var(--color-secondary)" stroke-width="2" />
    </svg>
    , label: "인공첨가물 0%"
  },
];

export default function StatsBar() {
  return (
    <section className="bg-[var(--color-surface-dark)] max-md:py-6 md:py-6.5">
      <div className="mx-auto flex max-w-content-narrow items-center justify-around md:justify-between px-6 md:px-8">
        {STATS.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-[5px]">
            <span className="text-[var(--color-secondary)]">{item.icon}</span>
            <span className="text-body-16-sb text-[var(--color-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
