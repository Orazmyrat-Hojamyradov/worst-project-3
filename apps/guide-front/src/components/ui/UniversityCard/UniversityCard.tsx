'use client'

import React from 'react';
import { Building, MapPin, Star, Heart, X, Calendar, Users, DollarSign, Award, Home, Stethoscope } from "lucide-react";
import styles from "../../UniversitySwiper/UniversitySwiper.module.css";
import Link from 'next/link';
import Image from 'next/image';
import ReactDOM from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import Cookies from 'js-cookie'

interface MultilingualField {
  en: string;
  ru: string;
  tm: string;
}

interface University {
  id: number;
  photolr1: string | null;
  name: MultilingualField;
  description: MultilingualField;
  specials: MultilingualField | null;
  financing: MultilingualField | null;
  duration: MultilingualField | null;
  applicationDeadline: string | null;
  gender: MultilingualField | null;
  age: number | null;
  others: MultilingualField | null;
  medicine: MultilingualField | null;
  salary: MultilingualField | null;
  donitory: MultilingualField | null;
  rewards: MultilingualField | null;
  others_p: MultilingualField | null;
  officialLink: string;
}

interface Props {
  uni: University;
  onToggleFavorite?: () => void;
}

// Local storage key for favorites
const FAVORITES_KEY = 'university_favorites';

// Helper function to get user data
const getUserData = () => {
  try {
    const userData = Cookies.get('user_data')
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
};

// Helper function to get display value from multilingual field
const getDisplayValue = (field: MultilingualField | null, lang: keyof MultilingualField): string => {
  if (!field) return '';
  return field[lang] || field.en || '';
};

// Helper functions for localStorage operations
export const getFavorites = (): number[] => {
  try {
    const stored = typeof window !== "undefined" && localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Handle both old format (full objects) and new format (IDs only)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        // Convert old format to new format (IDs only)
        const ids = parsed.map((uni: any) => uni.id).filter((id: number) => id != null);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
        return ids;
      }
      return parsed.filter((id: any) => id != null);
    }
    return [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
};

export const saveFavorite = (universityId: number) => {
  try {
    const favorites = getFavorites();
    const isAlreadyFavorite = favorites.includes(universityId);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, universityId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error);
  }
};

export const removeFavorite = (universityId: number) => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(id => id !== universityId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    window.location.reload()
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
  }
};

export const isFavoriteUniversity = (universityId: number): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.includes(universityId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return !!getUserData();
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: University;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isUserLoggedIn: boolean;
}

function UniversityModal({ isOpen, onClose, university, isFavorite, onToggleFavorite, isUserLoggedIn }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const t = useTranslations("UniversityCard.modal");
  const locale = useLocale() as keyof MultilingualField; // Get current locale

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isUserLoggedIn) {
      const proceed = window.confirm(t('authPrompt'));
      if (proceed) {
        window.location.href = '/auth';
      }
      return;
    }
    onToggleFavorite();
  };

  const InfoSection = ({ title, value, icon: Icon }: { title: string; value: string | null; icon: any }) => {
    if (!value) return null;
    
    return (
      <div className={styles.infoSection}>
        <div className={styles.infoHeader}>
          <Icon size={24} />
          <h4>{title}</h4>
        </div>
        <p>{value}</p>
      </div>
    );
  };

  // Create portal content
  const modalContent = (
    <div className={styles.fullScreenModalOverlay} onClick={handleOverlayClick}>
      <div className={styles.fullScreenModalContent}>
        {/* Header */}
        <div className={styles.fullScreenModalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerImage}>
              {university.photolr1 ? (
                <Image 
                  src={university.photolr1} 
                  alt={getDisplayValue(university.name, locale)} 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Building size={80} />
              )}
            </div>
            <div className={styles.headerInfo}>
              <h1>{getDisplayValue(university.name, locale)}</h1>
              <p className={styles.headerDescription}>{getDisplayValue(university.description, locale)}</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button
              className={`${styles.fullScreenLikeBtn} ${isFavorite ? styles.liked : ""} ${!isUserLoggedIn ? styles.disabled : ""}`}
              onClick={handleFavoriteClick}
              title={isUserLoggedIn ? 
                (isFavorite ? t('buttons.removeFavorite') : t('buttons.addFavorite')) : 
                t('buttons.loginRequired')}
            >
              <Heart size={24} fill={isFavorite ? "#ff0000" : "none"} />
              {isFavorite ? t('buttons.removeFavorite') : t('buttons.addFavorite')}
            </button>
            
            {university.officialLink && (
              <Link 
                href={university.officialLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.fullScreenWebsiteButton}
                onClick={(e) => e.stopPropagation()}
              >
                {t('buttons.visitWebsite')}
              </Link>
            )}
            
            <button className={styles.closeFullScreenButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.fullScreenModalBody}>
          <div className={styles.detailsGrid}>
            <InfoSection 
              title={t('sections.specializations')} 
              value={getDisplayValue(university.specials, locale)} 
              icon={Award} 
            />
            
            <InfoSection 
              title={t('sections.financing')} 
              value={getDisplayValue(university.financing, locale)} 
              icon={DollarSign} 
            />
            
            <InfoSection 
              title={t('sections.duration')} 
              value={getDisplayValue(university.duration, locale)} 
              icon={Calendar} 
            />
            
            <InfoSection 
              title={t('sections.deadline')} 
              value={university.applicationDeadline} 
              icon={Calendar} 
            />
            
            <InfoSection 
              title={t('sections.gender')} 
              value={getDisplayValue(university.gender, locale)} 
              icon={Users} 
            />
            
            <InfoSection 
              title={t('sections.age')} 
              value={university.age ? university.age.toString() : null} 
              icon={Users} 
            />
            
            <InfoSection 
              title={t('sections.medical')} 
              value={getDisplayValue(university.medicine, locale)} 
              icon={Stethoscope} 
            />
            
            <InfoSection 
              title={t('sections.salary')} 
              value={getDisplayValue(university.salary, locale)} 
              icon={DollarSign} 
            />
            
            <InfoSection 
              title={t('sections.dormitory')} 
              value={getDisplayValue(university.donitory, locale)} 
              icon={Home} 
            />
            
            <InfoSection 
              title={t('sections.scholarships')} 
              value={getDisplayValue(university.rewards, locale)} 
              icon={Award} 
            />
            
            <InfoSection 
              title={t('sections.otherInfo')} 
              value={getDisplayValue(university.others, locale)} 
              icon={Award} 
            />
            
            <InfoSection 
              title={t('sections.additionalDetails')} 
              value={getDisplayValue(university.others_p, locale)} 
              icon={Award} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render using portal to document.body
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}

export default function UniversityCard({ uni, onToggleFavorite }: Props) {
  const [localIsFavorite, setLocalIsFavorite] = React.useState(() => {
    return isFavoriteUniversity(uni.id);
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);
  const t = useTranslations("UniversityCard");
  const locale = useLocale() as keyof MultilingualField; // Get current locale

  React.useEffect(() => {
    setLocalIsFavorite(isFavoriteUniversity(uni.id));
    setIsUserLoggedIn(!!getUserData());
  }, [uni.id]);

  // Listen for storage changes to update login status and favorites
  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsUserLoggedIn(!!getUserData());
      setLocalIsFavorite(isFavoriteUniversity(uni.id));
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [uni.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isUserLoggedIn) {
      const proceed = window.confirm(t('authPrompt'));
      if (proceed) {
        window.location.href = '/login';
      }
      return;
    }
    
    const newFavoriteStatus = !localIsFavorite;
    
    if (localIsFavorite) {
      removeFavorite(uni.id);
    } else {
      saveFavorite(uni.id);
    }
    
    setLocalIsFavorite(newFavoriteStatus);
    
    // Trigger storage event to update other components
    window.dispatchEvent(new Event('storage'));
    
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModalToggleFavorite = () => {
    if (!isUserLoggedIn) return;
    
    const newFavoriteStatus = !localIsFavorite;
    
    if (localIsFavorite) {
      removeFavorite(uni.id);
    } else {
      saveFavorite(uni.id);
    }
    
    setLocalIsFavorite(newFavoriteStatus);
    
    // Trigger storage event to update other components
    window.dispatchEvent(new Event('storage'));
    
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className={styles.card} onClick={handleCardClick}>
        <div className={styles.cardHeader}>
          {uni.photolr1 ? (
            <Image 
              src={uni.photolr1} 
              alt={getDisplayValue(uni.name, locale)} 
              fill 
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Building size={48} />
          )}
        </div>
        <div className={styles.cardBody}>
          <h3 className={styles.title}>{getDisplayValue(uni.name, locale)}</h3>
          <p className={styles.description}>{getDisplayValue(uni.description, locale)}</p>

          <div className={styles.actions}>
            <Link 
              href={uni.officialLink} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={styles.websiteLink}
            >
              {t('visitWebsite')}
            </Link>

            <button
              className={`${styles.likeBtn} ${localIsFavorite ? styles.liked : ""} ${!isUserLoggedIn ? styles.disabled : ""}`}
              onClick={handleToggleFavorite}
              title={isUserLoggedIn ? 
                (localIsFavorite ? t('removeFavorite') : t('addFavorite')) : 
                t('loginRequired')}
            >
              <Heart size={18} fill={localIsFavorite ? "#ff0000" : "none"} />
            </button>
          </div>
        </div>
      </div>

      <UniversityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        university={uni}
        isFavorite={localIsFavorite}
        onToggleFavorite={handleModalToggleFavorite}
        isUserLoggedIn={isUserLoggedIn}
      />
    </>
  );
}