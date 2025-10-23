'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Home, User, LogIn, Laptop, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  const t = useTranslations();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get('auth_token'));
  }, []);

  const handleLogout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    window.location.href = '/login';
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <Laptop size={26} />
          <span className={styles.brandName}>{t('Footer.brandName')}</span>
        </div>

        {/* Contact Section */}
        <div className={styles.contactSection}>
          <div className={styles.contactItem}>
            <Phone size={18} />
            <a href="tel:+99361123456" className={styles.contactLink}>
              +993 61 12 34 56
            </a>
          </div>
          <div className={styles.contactItem}>
            <Mail size={18} />
            <a href="mailto:info@example.com" className={styles.contactLink}>
              info@example.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>
            © {new Date().getFullYear()} {t('Footer.brandName')}.{' '}
            {t('Footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
