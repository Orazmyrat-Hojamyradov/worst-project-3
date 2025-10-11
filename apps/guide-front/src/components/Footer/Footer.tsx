'use client'

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Footer.module.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const t = useTranslations('Footer');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log('Subscribed with email:', email);
    setEmail('');
    alert(t('subscriptionSuccess'));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <h2 className={styles.brandName}>{t('brandName')}</h2>
            <p className={styles.brandDescription}>
              {t('brandDescription')}
            </p>
          </div>

          {/* Newsletter Section */}
          <div className={styles.newsletterSection}>
            <h3 className={styles.sectionTitle}>{t('stayUpdated')}</h3>
            <form onSubmit={handleSubmit} className={styles.newsletterForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                  required
                />
                <button type="submit" className={styles.subscribeButton}>
                  {t('subscribe')}
                </button>
              </div>
            </form>
            <p className={styles.newsletterText}>
              {t('newsletterText')}
            </p>
          </div>
        </div>

        {/* Links Sections */}
        <div className={styles.linksSections}>
          {/* Guides Section */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>{t('guides')}</h3>
            <ul className={styles.linksList}>
              <li><a href="#" className={styles.link}>{t('pcBuilding')}</a></li>
              <li><a href="#" className={styles.link}>{t('monitorSetup')}</a></li>
              <li><a href="#" className={styles.link}>{t('keyboardAssembly')}</a></li>
              <li><a href="#" className={styles.link}>{t('audioSetup')}</a></li>
              <li><a href="#" className={styles.link}>{t('networking')}</a></li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>{t('resources')}</h3>
            <ul className={styles.linksList}>
              <li><a href="#" className={styles.link}>{t('componentDatabase')}</a></li>
              <li><a href="#" className={styles.link}>{t('toolRecommendations')}</a></li>
              <li><a href="#" className={styles.link}>{t('videoTutorials')}</a></li>
              <li><a href="#" className={styles.link}>{t('communityForum')}</a></li>
              <li><a href="#" className={styles.link}>{t('troubleshooting')}</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>{t('company')}</h3>
            <ul className={styles.linksList}>
              <li><a href="#" className={styles.link}>{t('aboutUs')}</a></li>
              <li><a href="#" className={styles.link}>{t('contact')}</a></li>
              <li><a href="#" className={styles.link}>{t('privacyPolicy')}</a></li>
              <li><a href="#" className={styles.link}>{t('termsOfService')}</a></li>
              <li><a href="#" className={styles.link}>{t('careers')}</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className={styles.copyright}>
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;