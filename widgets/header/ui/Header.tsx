"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import logoMain from "@/shared/assets/logo-main.svg";
import { Button, DefaultPetIcon, useModal } from "@/shared/ui";
import { getProfileDisplayName } from "@/shared/config/profile";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasProfileRecord } from "@/features/profile/lib/profileStatus";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "home" as const },
  { href: "/about", label: "꼬순박스 소개", icon: "document" as const },
  { href: "/subscribe", label: "구독 시작하기", icon: "check-circle" as const },
  { href: "/support", label: "고객센터", icon: "heart" as const },
];

type DrawerNavIconType = (typeof NAV_ITEMS)[number]["icon"];


function SwitchHorizontalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 16H17M17 16L14 13M17 16L14 19" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8H7M7 8L10 5M7 8L10 11" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="var(--color-border)" strokeWidth="1.5" />
      <path d="M12 8V16M8 12H16" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ========== 모바일 드로워 단축 아이콘 (32×32) ==========

function DrawerUserIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10C22 13.3137 19.3137 16 16 16C12.6863 16 10 13.3137 10 10C10 6.68629 12.6863 4 16 4C19.3137 4 22 6.68629 22 10Z" fill="var(--color-icon-warm)"/>
      <path d="M16 12.0996C21.5062 12.0996 26.1391 16.2682 26.7705 21.793L26.8691 22.6523C27.1887 25.4485 25.0233 27.9001 22.2383 27.9004H9.76172C6.97674 27.9001 4.81132 25.4485 5.13086 22.6523L5.22949 21.793C5.86086 16.2682 10.4938 12.0996 16 12.0996Z" fill="url(#u_paint0)"/>
      <path d="M16 12.0996C21.5062 12.0996 26.1391 16.2682 26.7705 21.793L26.8691 22.6523C27.1887 25.4485 25.0233 27.9001 22.2383 27.9004H9.76172C6.97674 27.9001 4.81132 25.4485 5.13086 22.6523L5.22949 21.793C5.86086 16.2682 10.4938 12.0996 16 12.0996Z" fill="#E08310" fillOpacity="0.2"/>
      <path d="M16 12.0996C21.5062 12.0996 26.1391 16.2682 26.7705 21.793L26.8691 22.6523C27.1887 25.4485 25.0233 27.9001 22.2383 27.9004H9.76172C6.97674 27.9001 4.81132 25.4485 5.13086 22.6523L5.22949 21.793C5.86086 16.2682 10.4938 12.0996 16 12.0996Z" stroke="url(#u_paint1)" strokeWidth="0.2"/>
      <defs>
        <linearGradient id="u_paint0" x1="16" y1="11.3333" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="u_paint1" x1="16" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DrawerPinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.63645 26.9091L17.4546 13.0909C17.8563 12.6893 18.5075 12.6893 18.9092 13.0909C19.3108 13.4926 19.3108 14.1438 18.9092 14.5455L5.091 28.3636C4.68934 28.7653 4.03811 28.7653 3.63645 28.3636C3.23479 27.962 3.23479 27.3108 3.63645 26.9091Z" fill="var(--color-icon-warm)"/>
      <path d="M18.8037 3.15613C20.4687 1.49133 23.168 1.49129 24.833 3.15613L28.8438 7.16687C30.5088 8.83192 30.5088 11.5321 28.8438 13.1971L24.8076 17.2333C24.7007 17.3402 24.6098 17.4625 24.5381 17.5956L20.9385 24.2802C20.2772 25.5077 18.6198 25.7505 17.6338 24.7645L7.3877 14.5194C6.35991 13.4916 6.67578 11.7537 7.99902 11.1522L12.8926 8.92761C13.0622 8.85048 13.2169 8.74297 13.3486 8.61121L18.8037 3.15613Z" fill="url(#p_paint0)"/>
      <path d="M18.8037 3.15613C20.4687 1.49133 23.168 1.49129 24.833 3.15613L28.8438 7.16687C30.5088 8.83192 30.5088 11.5321 28.8438 13.1971L24.8076 17.2333C24.7007 17.3402 24.6098 17.4625 24.5381 17.5956L20.9385 24.2802C20.2772 25.5077 18.6198 25.7505 17.6338 24.7645L7.3877 14.5194C6.35991 13.4916 6.67578 11.7537 7.99902 11.1522L12.8926 8.92761C13.0622 8.85048 13.2169 8.74297 13.3486 8.61121L18.8037 3.15613Z" fill="#E08310" fillOpacity="0.25"/>
      <path d="M18.8037 3.15613C20.4687 1.49133 23.168 1.49129 24.833 3.15613L28.8438 7.16687C30.5088 8.83192 30.5088 11.5321 28.8438 13.1971L24.8076 17.2333C24.7007 17.3402 24.6098 17.4625 24.5381 17.5956L20.9385 24.2802C20.2772 25.5077 18.6198 25.7505 17.6338 24.7645L7.3877 14.5194C6.35991 13.4916 6.67578 11.7537 7.99902 11.1522L12.8926 8.92761C13.0622 8.85048 13.2169 8.74297 13.3486 8.61121L18.8037 3.15613Z" stroke="url(#p_paint1)" strokeWidth="0.2"/>
      <defs>
        <linearGradient id="p_paint0" x1="19.2728" y1="0.515162" x2="19.2728" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="p_paint1" x1="18.4352" y1="1.8075" x2="18.4352" y2="25.4749" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DrawerClipboardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6.33333C10 5.04467 11.0745 4 12.4 4H19.6C20.9255 4 22 5.04467 22 6.33333V8.66667C22 9.95533 20.9255 11 19.6 11H12.4C11.0745 11 10 9.95533 10 8.66667V6.33333Z" fill="var(--color-icon-warm)"/>
      <path d="M9.75 7.09961H22.25C24.267 7.09961 25.9004 8.71569 25.9004 10.7061V24.2939C25.9004 26.2843 24.267 27.9004 22.25 27.9004H9.75C7.73304 27.9004 6.09961 26.2843 6.09961 24.2939V10.7061C6.09961 8.71569 7.73304 7.09961 9.75 7.09961Z" fill="url(#c_paint0)"/>
      <path d="M9.75 7.09961H22.25C24.267 7.09961 25.9004 8.71569 25.9004 10.7061V24.2939C25.9004 26.2843 24.267 27.9004 22.25 27.9004H9.75C7.73304 27.9004 6.09961 26.2843 6.09961 24.2939V10.7061C6.09961 8.71569 7.73304 7.09961 9.75 7.09961Z" fill="#E08310" fillOpacity="0.32"/>
      <path d="M9.75 7.09961H22.25C24.267 7.09961 25.9004 8.71569 25.9004 10.7061V24.2939C25.9004 26.2843 24.267 27.9004 22.25 27.9004H9.75C7.73304 27.9004 6.09961 26.2843 6.09961 24.2939V10.7061C6.09961 8.71569 7.73304 7.09961 9.75 7.09961Z" stroke="url(#c_paint1)" strokeWidth="0.2"/>
      <g opacity="0.8">
        <path d="M20.1176 22.2632C20.605 22.2632 21 22.652 21 23.1316C21 23.6112 20.605 24 20.1176 24H11.8824C11.395 24 11 23.6112 11 23.1316C11 22.652 11.395 22.2632 11.8824 22.2632H20.1176Z" fill="url(#c_paint2)"/>
        <path d="M20.1176 17.6316C20.605 17.6316 21 18.0204 21 18.5C21 18.9796 20.605 19.3684 20.1176 19.3684H11.8824C11.395 19.3684 11 18.9796 11 18.5C11 18.0204 11.395 17.6316 11.8824 17.6316H20.1176Z" fill="url(#c_paint3)"/>
        <path d="M20.1176 13C20.605 13 21 13.3888 21 13.8684C21 14.348 20.605 14.7368 20.1176 14.7368H11.8824C11.395 14.7368 11 14.348 11 13.8684C11 13.3888 11.395 13 11.8824 13H20.1176Z" fill="url(#c_paint4)"/>
      </g>
      <defs>
        <linearGradient id="c_paint0" x1="16" y1="6.125" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="c_paint1" x1="16" y1="7" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="c_paint2" x1="16" y1="17" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="c_paint3" x1="16" y1="17" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="c_paint4" x1="16" y1="17" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========== 모바일 드로워 네비게이션 아이콘 (24×24) ==========

function DrawerHomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.7793 4.28516C10.5047 2.70536 13.339 2.70536 15.0645 4.28516L19.5645 8.40527C20.3714 9.14417 20.8221 10.1363 20.8223 11.167V17.9648C20.8223 19.5762 19.3658 20.9004 17.5469 20.9004H6.29688C4.4779 20.9004 3.02149 19.5762 3.02148 17.9648V11.167C3.02161 10.1363 3.47235 9.14417 4.2793 8.40527L8.7793 4.28516Z" fill="url(#h_paint0)"/>
      <path d="M8.7793 4.28516C10.5047 2.70536 13.339 2.70536 15.0645 4.28516L19.5645 8.40527C20.3714 9.14417 20.8221 10.1363 20.8223 11.167V17.9648C20.8223 19.5762 19.3658 20.9004 17.5469 20.9004H6.29688C4.4779 20.9004 3.02149 19.5762 3.02148 17.9648V11.167C3.02161 10.1363 3.47235 9.14417 4.2793 8.40527L8.7793 4.28516Z" fill="#E08310" fillOpacity="0.25"/>
      <path d="M8.7793 4.28516C10.5047 2.70536 13.339 2.70536 15.0645 4.28516L19.5645 8.40527C20.3714 9.14417 20.8221 10.1363 20.8223 11.167V17.9648C20.8223 19.5762 19.3658 20.9004 17.5469 20.9004H6.29688C4.4779 20.9004 3.02149 19.5762 3.02148 17.9648V11.167C3.02161 10.1363 3.47235 9.14417 4.2793 8.40527L8.7793 4.28516Z" stroke="#F6E9DD" strokeWidth="0.2"/>
      <path opacity="0.8" d="M8.92188 15.2174V21H14.9219V15.2174C14.9219 14.545 14.3249 14 13.5885 14H10.2552C9.51883 14 8.92188 14.545 8.92188 15.2174Z" fill="var(--color-icon-warm)"/>
      <defs>
        <linearGradient id="h_paint0" x1="11.9219" y1="2.27034" x2="11.9219" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DrawerDocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.95459 9.30769C1.95459 8.03319 2.93956 7 4.15459 7H8.8891C9.47929 7 10.0447 7.24874 10.4584 7.69034L12.3239 9.6819C12.7281 10.1135 12.9546 10.6943 12.9546 11.2993V19.6923C12.9546 20.9668 11.9696 22 10.7546 22H4.15459C2.93956 22 1.95459 20.9668 1.95459 19.6923V9.30769Z" fill="var(--color-icon-warm)"/>
      <path d="M10 2.09961H14.2715C15.3485 2.09961 16.3768 2.52142 17.1133 3.2627L18.8418 5.00195C19.5221 5.68671 19.9004 6.59117 19.9004 7.5293V16.2109C19.9002 18.2434 18.1589 19.9004 16 19.9004H10C7.84107 19.9004 6.09984 18.2434 6.09961 16.2109V5.78906C6.09984 3.75664 7.84107 2.09961 10 2.09961Z" fill="url(#d_paint0)"/>
      <path d="M10 2.09961H14.2715C15.3485 2.09961 16.3768 2.52142 17.1133 3.2627L18.8418 5.00195C19.5221 5.68671 19.9004 6.59117 19.9004 7.5293V16.2109C19.9002 18.2434 18.1589 19.9004 16 19.9004H10C7.84107 19.9004 6.09984 18.2434 6.09961 16.2109V5.78906C6.09984 3.75664 7.84107 2.09961 10 2.09961Z" fill="#E08310" fillOpacity="0.25"/>
      <path d="M10 2.09961H14.2715C15.3485 2.09961 16.3768 2.52142 17.1133 3.2627L18.8418 5.00195C19.5221 5.68671 19.9004 6.59117 19.9004 7.5293V16.2109C19.9002 18.2434 18.1589 19.9004 16 19.9004H10C7.84107 19.9004 6.09984 18.2434 6.09961 16.2109V5.78906C6.09984 3.75664 7.84107 2.09961 10 2.09961Z" stroke="url(#d_paint1)" strokeWidth="0.2"/>
      <g opacity="0.8">
        <path d="M16.2941 15.4211C16.684 15.4211 17 15.7745 17 16.2105C17 16.6465 16.684 17 16.2941 17H9.70588C9.31603 17 9 16.6465 9 16.2105C9 15.7745 9.31603 15.4211 9.70588 15.4211H16.2941Z" fill="url(#d_paint2)"/>
        <path d="M16.2941 11.2105C16.684 11.2105 17 11.564 17 12C17 12.436 16.684 12.7895 16.2941 12.7895H9.70588C9.31603 12.7895 9 12.436 9 12C9 11.564 9.31603 11.2105 9.70588 11.2105H16.2941Z" fill="url(#d_paint3)"/>
        <path d="M16.2941 7C16.684 7 17 7.35346 17 7.78947C17 8.22549 16.684 8.57895 16.2941 8.57895H9.70588C9.31603 8.57895 9 8.22549 9 7.78947C9 7.35346 9.31603 7 9.70588 7H16.2941Z" fill="url(#d_paint4)"/>
      </g>
      <defs>
        <linearGradient id="d_paint0" x1="13" y1="2.23684" x2="13" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="d_paint1" x1="13" y1="2" x2="13" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="d_paint2" x1="13" y1="10.6364" x2="13" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="d_paint3" x1="13" y1="10.6364" x2="13" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="d_paint4" x1="13" y1="10.6364" x2="13" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DrawerCheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.9091 6.54549C22.9091 9.55795 20.467 12 17.4545 12C14.4421 12 12 9.55795 12 6.54549C12 3.53303 14.4421 1.09094 17.4545 1.09094C20.467 1.09094 22.9091 3.53303 22.9091 6.54549Z" fill="var(--color-icon-warm)"/>
      <path d="M12.3181 2.28149C17.5096 2.28149 21.7185 6.49041 21.7185 11.6819C21.7185 16.8734 17.5096 21.0823 12.3181 21.0823C7.12664 21.0823 2.91772 16.8734 2.91772 11.6819C2.91772 6.49041 7.12664 2.28149 12.3181 2.28149Z" fill="url(#cc_paint0)"/>
      <path d="M12.3181 2.28149C17.5096 2.28149 21.7185 6.49041 21.7185 11.6819C21.7185 16.8734 17.5096 21.0823 12.3181 21.0823C7.12664 21.0823 2.91772 16.8734 2.91772 11.6819C2.91772 6.49041 7.12664 2.28149 12.3181 2.28149Z" fill="#E08310" fillOpacity="0.32"/>
      <path d="M12.3181 2.28149C17.5096 2.28149 21.7185 6.49041 21.7185 11.6819C21.7185 16.8734 17.5096 21.0823 12.3181 21.0823C7.12664 21.0823 2.91772 16.8734 2.91772 11.6819C2.91772 6.49041 7.12664 2.28149 12.3181 2.28149Z" stroke="url(#cc_paint1)" strokeWidth="0.2"/>
      <path opacity="0.8" d="M16.3305 8.14882C16.65 7.8293 17.168 7.8293 17.4875 8.14882C17.807 8.46834 17.807 8.98626 17.4875 9.30578L11.7133 15.0799C10.9678 15.8254 9.75929 15.8254 9.01377 15.0799L6.51235 12.5785C6.19283 12.259 6.19283 11.7411 6.51235 11.4215C6.83186 11.102 7.34979 11.102 7.66931 11.4215L10.1707 13.923C10.2772 14.0294 10.4499 14.0294 10.5564 13.923L16.3305 8.14882Z" fill="url(#cc_paint2)"/>
      <defs>
        <linearGradient id="cc_paint0" x1="12.3181" y1="1.39022" x2="12.3181" y2="21.1819" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="cc_paint1" x1="12.3181" y1="2.18188" x2="12.3181" y2="21.1819" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="cc_paint2" x1="11.9999" y1="10.72" x2="11.9999" y2="15.639" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DrawerHeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#ht_clip0)">
        <path d="M20.9138 6.60846C20.4746 8.55362 17.9049 10.2778 16.9013 10.8861C16.6506 11.038 16.3494 11.038 16.0987 10.8861C15.0951 10.2778 12.5254 8.55362 12.0862 6.60846C11.6896 4.85203 12.6962 3.02704 14.4008 3.00082C14.436 3.00028 14.4717 3 14.5079 3C15.1941 3 15.8068 3.35843 16.1659 3.62343C16.3621 3.76821 16.6379 3.76821 16.8341 3.62343C17.1932 3.35843 17.8059 3 18.4921 3C18.5283 3 18.564 3.00028 18.5992 3.00082C20.3038 3.02704 21.3104 4.85203 20.9138 6.60846Z" fill="var(--color-icon-warm)"/>
        <path d="M18.8468 13.3148C18.0659 16.7188 13.4975 19.7362 11.7134 20.8006C11.2678 21.0665 10.7322 21.0665 10.2866 20.8006C8.50248 19.7362 3.93412 16.7188 3.15322 13.3148C2.44809 10.2411 4.23766 7.04733 7.26809 7.00143C7.33064 7.00048 7.39412 7 7.45854 7C8.67847 7 9.76758 7.62726 10.4061 8.09101C10.7549 8.34436 11.2451 8.34436 11.5939 8.09101C12.2324 7.62726 13.3215 7 14.5415 7C14.6059 7 14.6694 7.00048 14.7319 7.00143C17.7623 7.04733 19.5519 10.2411 18.8468 13.3148Z" fill="url(#ht_paint0)"/>
        <path d="M18.8468 13.3148C18.0659 16.7188 13.4975 19.7362 11.7134 20.8006C11.2678 21.0665 10.7322 21.0665 10.2866 20.8006C8.50248 19.7362 3.93412 16.7188 3.15322 13.3148C2.44809 10.2411 4.23766 7.04733 7.26809 7.00143C7.33064 7.00048 7.39412 7 7.45854 7C8.67847 7 9.76758 7.62726 10.4061 8.09101C10.7549 8.34436 11.2451 8.34436 11.5939 8.09101C12.2324 7.62726 13.3215 7 14.5415 7C14.6059 7 14.6694 7.00048 14.7319 7.00143C17.7623 7.04733 19.5519 10.2411 18.8468 13.3148Z" fill="#E08310" fillOpacity="0.25"/>
        <path d="M14.541 7.09961C14.6049 7.09961 14.6684 7.10062 14.7305 7.10156C16.2071 7.12395 17.3829 7.91173 18.1055 9.0752C18.8289 10.2401 19.0958 11.7798 18.749 13.292C18.3658 14.9627 17.0486 16.5509 15.5898 17.8604C14.1339 19.1672 12.5515 20.1842 11.6621 20.7148C11.2481 20.9618 10.7519 20.9618 10.3379 20.7148C9.44853 20.1842 7.86611 19.1672 6.41016 17.8604C4.95138 16.5509 3.63423 14.9627 3.25098 13.292C2.90417 11.7798 3.17106 10.2401 3.89453 9.0752C4.61713 7.91173 5.79293 7.12395 7.26953 7.10156C7.33158 7.10062 7.39507 7.09961 7.45898 7.09961C8.64694 7.09976 9.71495 7.71233 10.3477 8.17188C10.7314 8.45048 11.2686 8.45048 11.6523 8.17188C12.2851 7.71233 13.3531 7.09976 14.541 7.09961Z" stroke="url(#ht_paint1)" strokeWidth="0.2"/>
      </g>
      <defs>
        <linearGradient id="ht_paint0" x1="11" y1="6.41667" x2="11" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="ht_paint1" x1="11" y1="7" x2="11" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="ht_clip0">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function DrawerLogoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#lo_clip0)">
        <path d="M8.23409 14.7323C7.68884 14.7323 7.24683 14.3246 7.24683 13.8216V10.1784C7.24683 9.67544 7.68884 9.26767 8.23409 9.26767H13.9108C14.0472 9.26767 14.1577 9.16573 14.1577 9.03998V6.9126C14.1577 6.10119 15.2211 5.69483 15.843 6.26859L21.3577 11.356C21.7432 11.7117 21.7432 12.2883 21.3577 12.644L15.843 17.7314C15.2211 18.3052 14.1577 17.8988 14.1577 17.0874V14.96C14.1577 14.8343 14.0472 14.7323 13.9108 14.7323H8.23409Z" fill="#9DA1A3"/>
        <path d="M4.24702 21.5999C3.25291 21.5999 2.44702 20.7402 2.44702 19.6799V4.31985C2.44702 3.25947 3.25291 2.39985 4.24702 2.39985H7.84702C8.84113 2.39985 9.64702 3.25947 9.64702 4.31985V19.6799C9.64702 20.7402 8.84113 21.5999 7.84702 21.5999H4.24702Z" fill="url(#lo_paint0)"/>
        <path d="M4.24702 21.5999C3.25291 21.5999 2.44702 20.7402 2.44702 19.6799V4.31985C2.44702 3.25947 3.25291 2.39985 4.24702 2.39985H7.84702C8.84113 2.39985 9.64702 3.25947 9.64702 4.31985V19.6799C9.64702 20.7402 8.84113 21.5999 7.84702 21.5999H4.24702Z" fill="#8D9498" fillOpacity="0.25"/>
        <path d="M2.54663 19.6799V4.31958C2.54677 3.30844 3.3141 2.50036 4.24683 2.50024H7.84741C8.78005 2.50047 9.54649 3.30851 9.54663 4.31958V19.6799C9.54659 20.6911 8.78011 21.5 7.84741 21.5002H4.24683C3.31404 21.5001 2.54667 20.6912 2.54663 19.6799Z" stroke="url(#lo_paint1)" strokeWidth="0.2"/>
      </g>
      <defs>
        <linearGradient id="lo_paint0" x1="2.14702" y1="11.9999" x2="9.64702" y2="11.9999" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="lo_paint1" x1="2.44702" y1="11.9999" x2="9.64702" y2="11.9999" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="lo_clip0">
          <rect width="24" height="24" fill="white" transform="matrix(0 -1 1 0 0 24)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function DrawerNavIcon({ type }: { type: DrawerNavIconType }) {
  switch (type) {
    case "home": return <DrawerHomeIcon />;
    case "document": return <DrawerDocumentIcon />;
    case "check-circle": return <DrawerCheckCircleIcon />;
    case "heart": return <DrawerHeartIcon />;
  }
}

// ========== 데스크톱 드롭다운 메뉴 아이콘 (20×20, 웜 컬러) ==========

function DropdownUserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10C22 13.3137 19.3137 16 16 16C12.6863 16 10 13.3137 10 10C10 6.68629 12.6863 4 16 4C19.3137 4 22 6.68629 22 10Z" fill="var(--color-icon-warm)"/>
      <path d="M16 12.0996C21.5062 12.0996 26.1391 16.2682 26.7705 21.793L26.8691 22.6523C27.1887 25.4485 25.0233 27.9001 22.2383 27.9004H9.76172C6.97674 27.9001 4.81132 25.4485 5.13086 22.6523L5.22949 21.793C5.86086 16.2682 10.4938 12.0996 16 12.0996Z" fill="url(#dd_u_g0)"/>
      <path d="M16 12.0996C21.5062 12.0996 26.1391 16.2682 26.7705 21.793L26.8691 22.6523C27.1887 25.4485 25.0233 27.9001 22.2383 27.9004H9.76172C6.97674 27.9001 4.81132 25.4485 5.13086 22.6523L5.22949 21.793C5.86086 16.2682 10.4938 12.0996 16 12.0996Z" fill="#E08310" fillOpacity="0.2"/>
      <path d="M16 12.0996C21.5062 12.0996 26.1391 16.2682 26.7705 21.793L26.8691 22.6523C27.1887 25.4485 25.0233 27.9001 22.2383 27.9004H9.76172C6.97674 27.9001 4.81132 25.4485 5.13086 22.6523L5.22949 21.793C5.86086 16.2682 10.4938 12.0996 16 12.0996Z" stroke="url(#dd_u_g1)" strokeWidth="0.2"/>
      <defs>
        <linearGradient id="dd_u_g0" x1="16" y1="11.3333" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dd_u_g1" x1="16" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DropdownPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.63645 26.9091L17.4546 13.0909C17.8563 12.6893 18.5075 12.6893 18.9092 13.0909C19.3108 13.4926 19.3108 14.1438 18.9092 14.5455L5.091 28.3636C4.68934 28.7653 4.03811 28.7653 3.63645 28.3636C3.23479 27.962 3.23479 27.3108 3.63645 26.9091Z" fill="var(--color-icon-warm)"/>
      <path d="M18.8037 3.15613C20.4687 1.49133 23.168 1.49129 24.833 3.15613L28.8438 7.16687C30.5088 8.83192 30.5088 11.5321 28.8438 13.1971L24.8076 17.2333C24.7007 17.3402 24.6098 17.4625 24.5381 17.5956L20.9385 24.2802C20.2772 25.5077 18.6198 25.7505 17.6338 24.7645L7.3877 14.5194C6.35991 13.4916 6.67578 11.7537 7.99902 11.1522L12.8926 8.92761C13.0622 8.85048 13.2169 8.74297 13.3486 8.61121L18.8037 3.15613Z" fill="url(#dd_p_g0)"/>
      <path d="M18.8037 3.15613C20.4687 1.49133 23.168 1.49129 24.833 3.15613L28.8438 7.16687C30.5088 8.83192 30.5088 11.5321 28.8438 13.1971L24.8076 17.2333C24.7007 17.3402 24.6098 17.4625 24.5381 17.5956L20.9385 24.2802C20.2772 25.5077 18.6198 25.7505 17.6338 24.7645L7.3877 14.5194C6.35991 13.4916 6.67578 11.7537 7.99902 11.1522L12.8926 8.92761C13.0622 8.85048 13.2169 8.74297 13.3486 8.61121L18.8037 3.15613Z" fill="#E08310" fillOpacity="0.25"/>
      <path d="M18.8037 3.15613C20.4687 1.49133 23.168 1.49129 24.833 3.15613L28.8438 7.16687C30.5088 8.83192 30.5088 11.5321 28.8438 13.1971L24.8076 17.2333C24.7007 17.3402 24.6098 17.4625 24.5381 17.5956L20.9385 24.2802C20.2772 25.5077 18.6198 25.7505 17.6338 24.7645L7.3877 14.5194C6.35991 13.4916 6.67578 11.7537 7.99902 11.1522L12.8926 8.92761C13.0622 8.85048 13.2169 8.74297 13.3486 8.61121L18.8037 3.15613Z" stroke="url(#dd_p_g1)" strokeWidth="0.2"/>
      <defs>
        <linearGradient id="dd_p_g0" x1="19.2728" y1="0.515162" x2="19.2728" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dd_p_g1" x1="18.4352" y1="1.8075" x2="18.4352" y2="25.4749" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DropdownClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6.33333C10 5.04467 11.0745 4 12.4 4H19.6C20.9255 4 22 5.04467 22 6.33333V8.66667C22 9.95533 20.9255 11 19.6 11H12.4C11.0745 11 10 9.95533 10 8.66667V6.33333Z" fill="var(--color-icon-warm)"/>
      <path d="M9.75 7.09961H22.25C24.267 7.09961 25.9004 8.71569 25.9004 10.7061V24.2939C25.9004 26.2843 24.267 27.9004 22.25 27.9004H9.75C7.73304 27.9004 6.09961 26.2843 6.09961 24.2939V10.7061C6.09961 8.71569 7.73304 7.09961 9.75 7.09961Z" fill="url(#dd_c_g0)"/>
      <path d="M9.75 7.09961H22.25C24.267 7.09961 25.9004 8.71569 25.9004 10.7061V24.2939C25.9004 26.2843 24.267 27.9004 22.25 27.9004H9.75C7.73304 27.9004 6.09961 26.2843 6.09961 24.2939V10.7061C6.09961 8.71569 7.73304 7.09961 9.75 7.09961Z" fill="#E08310" fillOpacity="0.32"/>
      <path d="M9.75 7.09961H22.25C24.267 7.09961 25.9004 8.71569 25.9004 10.7061V24.2939C25.9004 26.2843 24.267 27.9004 22.25 27.9004H9.75C7.73304 27.9004 6.09961 26.2843 6.09961 24.2939V10.7061C6.09961 8.71569 7.73304 7.09961 9.75 7.09961Z" stroke="url(#dd_c_g1)" strokeWidth="0.2"/>
      <g opacity="0.8">
        <path d="M20.1176 22.2632C20.605 22.2632 21 22.652 21 23.1316C21 23.6112 20.605 24 20.1176 24H11.8824C11.395 24 11 23.6112 11 23.1316C11 22.652 11.395 22.2632 11.8824 22.2632H20.1176Z" fill="url(#dd_c_g2)"/>
        <path d="M20.1176 17.6316C20.605 17.6316 21 18.0204 21 18.5C21 18.9796 20.605 19.3684 20.1176 19.3684H11.8824C11.395 19.3684 11 18.9796 11 18.5C11 18.0204 11.395 17.6316 11.8824 17.6316H20.1176Z" fill="url(#dd_c_g3)"/>
        <path d="M20.1176 13C20.605 13 21 13.3888 21 13.8684C21 14.348 20.605 14.7368 20.1176 14.7368H11.8824C11.395 14.7368 11 14.348 11 13.8684C11 13.3888 11.395 13 11.8824 13H20.1176Z" fill="url(#dd_c_g4)"/>
      </g>
      <defs>
        <linearGradient id="dd_c_g0" x1="16" y1="6.125" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dd_c_g1" x1="16" y1="7" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dd_c_g2" x1="16" y1="17" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="dd_c_g3" x1="16" y1="17" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="dd_c_g4" x1="16" y1="17" x2="16" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function DropdownLogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#dd_lo_clip)">
        <path d="M8.23409 14.7323C7.68884 14.7323 7.24683 14.3246 7.24683 13.8216V10.1784C7.24683 9.67544 7.68884 9.26767 8.23409 9.26767H13.9108C14.0472 9.26767 14.1577 9.16573 14.1577 9.03998V6.9126C14.1577 6.10119 15.2211 5.69483 15.843 6.26859L21.3577 11.356C21.7432 11.7117 21.7432 12.2883 21.3577 12.644L15.843 17.7314C15.2211 18.3052 14.1577 17.8988 14.1577 17.0874V14.96C14.1577 14.8343 14.0472 14.7323 13.9108 14.7323H8.23409Z" fill="var(--color-icon-warm)"/>
        <path d="M4.24702 21.5999C3.25291 21.5999 2.44702 20.7402 2.44702 19.6799V4.31985C2.44702 3.25947 3.25291 2.39985 4.24702 2.39985H7.84702C8.84113 2.39985 9.64702 3.25947 9.64702 4.31985V19.6799C9.64702 20.7402 8.84113 21.5999 7.84702 21.5999H4.24702Z" fill="url(#dd_lo_g0)"/>
        <path d="M4.24702 21.5999C3.25291 21.5999 2.44702 20.7402 2.44702 19.6799V4.31985C2.44702 3.25947 3.25291 2.39985 4.24702 2.39985H7.84702C8.84113 2.39985 9.64702 3.25947 9.64702 4.31985V19.6799C9.64702 20.7402 8.84113 21.5999 7.84702 21.5999H4.24702Z" fill="#E08310" fillOpacity="0.25"/>
        <path d="M2.54663 19.6799V4.31958C2.54677 3.30844 3.3141 2.50036 4.24683 2.50024H7.84741C8.78005 2.50047 9.54649 3.30851 9.54663 4.31958V19.6799C9.54659 20.6911 8.78011 21.5 7.84741 21.5002H4.24683C3.31404 21.5001 2.54667 20.6912 2.54663 19.6799Z" stroke="url(#dd_lo_g1)" strokeWidth="0.2"/>
      </g>
      <defs>
        <linearGradient id="dd_lo_g0" x1="2.14702" y1="11.9999" x2="9.64702" y2="11.9999" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.1"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dd_lo_g1" x1="2.44702" y1="11.9999" x2="9.64702" y2="11.9999" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="dd_lo_clip">
          <rect width="24" height="24" fill="white" transform="matrix(0 -1 1 0 0 24)"/>
        </clipPath>
      </defs>
    </svg>
  );
}

// ========== 프로필 썸네일 ==========

function ProfileThumbnail({ imageUrl, size }: { imageUrl: string | null; size: "sm" | "md" | "lg" | "xl" }) {
  const sizeClass = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-[54px] w-[54px]", xl: "h-[68px] w-[68px]" }[size];
  const iconClass = { sm: "h-5 w-5", md: "h-7 w-7", lg: "h-8 w-8", xl: "h-10 w-10" }[size];

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-[var(--color-secondary)]`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-secondary)]">
          <DefaultPetIcon className={iconClass} />
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ hasProfile, petName, email, profileImageUrl, onClose }: { hasProfile: boolean; petName: string | null; email: string | null; profileImageUrl: string | null; onClose: () => void }) {
  const { logout } = useAuth();
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();

  const isSubscriptionActive = pathname.startsWith("/mypage/subscription");
  const isMypageActive = pathname.startsWith("/mypage") && !isSubscriptionActive && !pathname.startsWith("/mypage/withdraw");

  const menuItemClass = (active: boolean) =>
    [
      "w-full h-[52px] px-6 flex items-center gap-3 text-left tracking-[-0.02em] transition-colors",
      active
        ? "text-body-14-b text-[var(--color-primary)]"
        : "text-body-14-m text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]",
    ].join(" ");

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleSwitchProfile = () => {
    onClose();
    openModal("profile-switch");
  };

  const handleAddProfile = () => {
    onClose();
    router.push("/mypage/dog-profile?new=true");
  };

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-[10px] bg-white shadow-[0px_18px_28px_rgba(9,30,66,0.1)] overflow-hidden">
      <div className="flex flex-col">
        {/* 프로필 헤더 — 그라디언트 배경 */}
        <div
          className="flex h-[90px] items-center gap-4 rounded-[10px_10px_0_0] px-5"
          style={{ background: "var(--gradient-dropdown-header)" }}
        >
          <div className="shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]">
            <ProfileThumbnail imageUrl={profileImageUrl} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 min-w-0">
              {hasProfile ? (
                <>
                  <span className="text-body-14-sb text-[var(--color-text)] truncate">{getProfileDisplayName(petName)}</span>
                  <button onClick={handleSwitchProfile} aria-label="프로필 변경" className="shrink-0">
                    <SwitchHorizontalIcon />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddProfile}
                  className="flex items-center gap-1 text-body-14-sb text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                >
                  <span className="truncate">프로필 등록하기</span>
                  <PlusCircleIcon />
                </button>
              )}
            </div>
            {email && (
              <p className="mt-1 text-body-14-m text-[var(--color-text-secondary)] truncate">
                {email}
              </p>
            )}
          </div>
        </div>

        <button onClick={() => { onClose(); router.push("/mypage"); }} className={menuItemClass(isMypageActive)}>
          <DropdownUserIcon />
          마이페이지
        </button>
        <button onClick={() => { onClose(); openModal("account-info"); }} className={menuItemClass(false)}>
          <DropdownPinIcon />
          계정정보
        </button>
        <button onClick={() => { onClose(); router.push("/mypage/subscription"); }} className={menuItemClass(isSubscriptionActive)}>
          <DropdownClipboardIcon />
          구독관리
        </button>
        <button onClick={handleLogout} className={menuItemClass(false)}>
          <DropdownLogoutIcon />
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const { isLoggedIn, user, isAuthLoading, logout } = useAuth();
  const { profile } = useProfile();
  const { openModal } = useModal();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileImageUrl = profile?.profileImageUrl ?? null;
  const hasProfile = hasProfileRecord(profile);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isProfileOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 h-[54px] bg-white shadow-[0_3px_30px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex h-full max-w-content items-center justify-between max-md:px-6 md:px-0">
          <div className="flex items-center gap-3">
            <button
              className="max-md:flex md:hidden items-center justify-center"
              onClick={() => setIsMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link href="/" aria-label="꼬순박스 홈">
              <Image src={logoMain} alt="꼬순박스 로고" priority />
            </Link>
          </div>
          <div className="flex items-center gap-[46px]">
            <Link href="/about" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-primary">
              꼬순박스 소개
            </Link>
            <Link href="/subscribe" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-primary">
              구독 시작하기
            </Link>
            <Link href="/support" className="max-md:hidden text-body-14-sb text-[var(--color-text)] hover:text-primary">
              고객센터
            </Link>
            {isAuthLoading ? (
              <div className="h-8 w-8 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            ) : isLoggedIn ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  aria-label="프로필 메뉴"
                  aria-expanded={isProfileOpen}
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <ProfileThumbnail imageUrl={profileImageUrl} size="sm" />
                </button>
                {isProfileOpen && (
                  <ProfileDropdown
                    hasProfile={hasProfile}
                    petName={profile?.name ?? null}
                    email={user?.email ?? null}
                    profileImageUrl={profileImageUrl}
                    onClose={() => setIsProfileOpen(false)}
                  />
                )}
              </div>
            ) : (
              <Button as={Link} href="/login" size="sm">
                로그인
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        <div className="flex h-full flex-col">

          {/* 상단 그라디언트 섹션 */}
          <div
            className="relative flex flex-col items-center"
            style={{ background: "var(--gradient-mobile-menu)", borderRadius: "0 0 40px 40px" }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={closeMenu}
              aria-label="메뉴 닫기"
              className="absolute right-6 top-8 flex items-center justify-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* 프로필 이미지 */}
            <div className="mt-[40px]">
              {isLoggedIn ? (
                <Link href="/mypage" onClick={closeMenu}>
                  <ProfileThumbnail imageUrl={profileImageUrl} size="xl" />
                </Link>
              ) : (
                <ProfileThumbnail imageUrl={null} size="xl" />
              )}
            </div>

            {/* 이름 / 로그인 텍스트 */}
            <div className="mt-2 flex items-center gap-1">
              {isAuthLoading ? (
                <div className="h-6 w-24 animate-pulse rounded bg-[var(--color-secondary)]" />
              ) : isLoggedIn ? (
                hasProfile ? (
                  <>
                    <span className="text-body-20-sb text-[var(--color-text)]">
                      {getProfileDisplayName(profile?.name)}
                    </span>
                    <button
                      onClick={() => { closeMenu(); openModal("profile-switch"); }}
                      aria-label="프로필 변경"
                      className="shrink-0"
                    >
                      <SwitchHorizontalIcon />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { closeMenu(); router.push("/mypage/dog-profile?new=true"); }}
                    className="text-body-20-sb text-[var(--color-text-secondary)]"
                  >
                    프로필 등록하기
                  </button>
                )
              ) : (
                <Link href="/login" onClick={closeMenu} className="text-body-20-sb text-[var(--color-text)]">
                  로그인 하기
                </Link>
              )}
            </div>

            {/* 이메일 */}
            {isLoggedIn && user?.email && (
              <p className="mt-1 text-body-14-m text-[var(--color-text-secondary)]">{user.email}</p>
            )}

            {/* 단축 아이콘 3종 */}
            <div className="mt-6 flex w-full items-start justify-between px-[68px] pb-8">
              <button
                onClick={() => { closeMenu(); router.push(isLoggedIn ? "/mypage" : "/login"); }}
                className="flex flex-col items-center gap-2"
              >
                <DrawerUserIcon />
                <span className="text-body-13-m tracking-[-0.02em] text-[var(--color-text)]">마이페이지</span>
              </button>
              <button
                onClick={() => { closeMenu(); if (isLoggedIn) { openModal("account-info"); } else { router.push("/login"); } }}
                className="flex flex-col items-center gap-2"
              >
                <DrawerPinIcon />
                <span className="text-body-13-m tracking-[-0.02em] text-[var(--color-text)]">계정정보</span>
              </button>
              <button
                onClick={() => { closeMenu(); router.push(isLoggedIn ? "/mypage/subscription" : "/login"); }}
                className="flex flex-col items-center gap-2"
              >
                <DrawerClipboardIcon />
                <span className="text-body-13-m tracking-[-0.02em] text-[var(--color-text)]">구독관리</span>
              </button>
            </div>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex-1 pt-3">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={[
                    "mx-7 flex h-[58px] items-center gap-4 rounded-xl px-3",
                    isActive ? "bg-[var(--color-surface-light)]" : "",
                  ].join(" ")}
                >
                  <DrawerNavIcon type={item.icon} />
                  <span className={isActive ? "text-body-14-b text-[var(--color-text)]" : "text-body-14-m text-[var(--color-text)]"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* 로그아웃 */}
          <div className="mx-7 mb-10">
            <button
              onClick={async () => { closeMenu(); await logout(); }}
              className="flex h-[58px] w-full items-center gap-4 px-3"
            >
              <DrawerLogoutIcon />
              <span className="text-body-14-m text-[var(--color-text-secondary)]">로그아웃</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
