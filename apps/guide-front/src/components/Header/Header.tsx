'use client';

import { useState, useEffect } from "react";
import { Home, Heart, User, GraduationCap, Menu, X, LogIn, Laptop } from "lucide-react";
import styles from "./Header.module.css";
import LanguageSwitcher from "../ui/LangSwitcher/LangSwitcher";
import ThemeToggle from "../ui/ThemeToggle/ThemeToggle";
import Link from "next/link";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const t = useTranslations("Header");

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get('auth_token'));
  }, []);

  function handleLogout() {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    window.location.href = '/login';
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Laptop size={28} />
        <span className={styles.logoText}>{t('logo')}</span>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.show : ""}`}>
        <Link href="/" className={styles.navItem} onClick={() => setIsOpen(false)}>
          <Home size={18} />
          <span>{t('nav.home')}</span>
        </Link>
        
        {/* Conditionally render profile link only when we know the auth status */}
        {isLoggedIn && (
          <Link href="/profile" className={styles.navItem} onClick={() => setIsOpen(false)}>
            <User size={18} />
            <span>{t('nav.profile')}</span>
          </Link>
        )}
        
        <Link 
          href={isLoggedIn ? "#" : "/login"} 
          className={styles.navItem} 
          onClick={isLoggedIn ? handleLogout : undefined}
        >
          <LogIn size={18} />
          <span>{isLoggedIn ? t('nav.logout') : t('nav.login')}</span>
        </Link>
      </nav>

      <div className={styles.controls}>
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('aria.menu')}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}