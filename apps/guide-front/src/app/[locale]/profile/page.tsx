'use client'

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import UniversityCard from '@/components/ui/UniversityCard/UniversityCard';
import Cookies from 'js-cookie';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData } from '@/api/api';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

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

// Edit Profile Modal Component
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  onSave: (data: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profileData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const t = useTranslations("ProfilePage.editModal");
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only set form data after mount to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isOpen && profileData) {
      setFormData({
        name: profileData?.name || '',
        email: profileData?.email || '',
      });
    }
  }, [isMounted, isOpen, profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {name?: string; email?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.nameRequired');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    if (isMounted && profileData) {
      setFormData({
        name: profileData?.name || '',
        email: profileData?.email || '',
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{t('title')}</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            type="button"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{t('form.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? styles.inputError : ''}
              placeholder={t('form.namePlaceholder')}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">{t('form.email')} *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? styles.inputError : ''}
              placeholder={t('form.emailPlaceholder')}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={handleClose}
            >
              {t('buttons.cancel')}
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
            >
              {t('buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Define the Guide interface to match your PCAssemblySteps data structure
interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  reviewCount: number;
  updatedAt: string;
  steps: any[];
  // Add other guide fields as needed
}

const ProfilePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [favoriteGuideIds, setFavoriteGuideIds] = useState<string[]>([]);
  const [favoriteGuides, setFavoriteGuides] = useState<Guide[]>([]);
  const [allGuides, setAllGuides] = useState<Guide[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const token = Cookies.get('auth_token');
  const t = useTranslations("ProfilePage");
  const ts = useTranslations("Header");
  const locale = useLocale();
  const router = useRouter();

  // Set client-side flag and get user ID from cookies
  useEffect(() => {
    setIsClient(true);
    
    // Get user ID from cookies
    const userCookie = Cookies.get('user_data');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setCurrentUserId(userData.id);
      } catch (error) {
        console.error('Error parsing user_data cookie:', error);
      }
    }
  }, []);

  // Fetch all guides to match with favorite IDs
  const { data: guidesData } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => await fetchData({ url: '/api/guides' }),
    enabled: isClient, // Only fetch on client side
  });

  // Set all guides when data loads
  useEffect(() => {
    if (guidesData) {
      setAllGuides(guidesData);
    }
  }, [guidesData]);

  // Get favorite guide IDs from localStorage - CLIENT ONLY
  useEffect(() => {
    if (!isClient || !currentUserId) return;

    const getFavoriteGuideIds = () => {
      try {
        const storageKey = `bookmarkedGuides_${currentUserId}`;
        const bookmarkedGuidesStr = localStorage.getItem(storageKey);
        
        if (bookmarkedGuidesStr) {
          const bookmarkedIds = JSON.parse(bookmarkedGuidesStr);
          if (Array.isArray(bookmarkedIds)) {
            setFavoriteGuideIds(bookmarkedIds);
          } else {
            setFavoriteGuideIds([]);
          }
        } else {
          setFavoriteGuideIds([]);
        }
      } catch (error) {
        console.error('Error reading bookmarked guides from localStorage:', error);
        setFavoriteGuideIds([]);
      }
    };

    getFavoriteGuideIds();

    // Listen for storage changes (in case bookmarks are updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `bookmarkedGuides_${currentUserId}`) {
        getFavoriteGuideIds();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient, currentUserId]);

  // Sync favorite guides with actual guide data
  useEffect(() => {
    if (allGuides.length > 0 && favoriteGuideIds.length > 0) {
      const favGuides = allGuides.filter((guide: Guide) => 
        favoriteGuideIds.includes(guide.id)
      );
      setFavoriteGuides(favGuides);
    } else {
      setFavoriteGuides([]);
    }
  }, [allGuides, favoriteGuideIds]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['profileData'],
    queryFn: () => fetchData({ url: '/api/users/me', token: token }),
    enabled: !!token && isClient, // Only run if token exists and we're on client
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (updatedData: any) => 
      fetchData({ 
        url: '/api/users/me', 
        token: token, 
        method: 'PATCH', 
        body: updatedData 
      }),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profileData'], updatedProfile);
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    }
  });

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (updatedData: any) => {
    updateProfileMutation.mutate(updatedData);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Helper function to get display value from multilingual field
  const getDisplayValue = (field: MultilingualField | null, lang: keyof MultilingualField = 'en'): string => {
    if (!field) return '';
    return field[lang] || field.en || Object.values(field)[0] || '';
  };

  // Show loading state only on client to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading</p>
        </div>
      </div>
    );
  }

  if (error || !data || data?.statusCode === 401) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{t('error')}</p>
          <button 
            onClick={() => handleNavigate('/login')}
            className={styles.loginButton}
          >
            {ts('nav.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.coverPhoto}>
          <div className={styles.profileImageContainer}>
            <div className={styles.profileImage}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="currentColor"/>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{data?.name || t('noName')}</h1>
          <div className={styles.contactInfo}>
            <p className={styles.email}>{data?.email || t('noEmail')}</p>
          </div>
          <button 
            className={styles.editButton}
            onClick={handleEditProfile}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? t('saving') : t('editProfile')}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.likedUniversitiesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('bookmarkedGuides')}</h2>
          </div>
          <div className={styles.universitiesContainer}>
            {favoriteGuides.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                        stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <h3>{t('noBookmarkedGuides')}</h3>
                <p>{t('bookmarkGuideHint')}</p>
                <button 
                  className={styles.exploreButton}
                  onClick={() => handleNavigate('/')}
                >
                  {t('exploreGuides')}
                </button>
              </div>
            ) : (
              <div className={styles.guidesGrid}>
                {favoriteGuides.map((guide: Guide) => (
                  <div key={guide.id} className={styles.guideCard}>
                    <div className={styles.guideImage}>
                      <div className={styles.guideImagePlaceholder}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className={styles.guideContent}>
                      <h3 className={styles.guideTitle}>{guide.title}</h3>
                      <p className={styles.guideDescription}>{guide.description}</p>
                      <div className={styles.guideMeta}>
                        <span className={styles.guideCategory}>{guide.category}</span>
                        <span 
                          className={styles.guideDifficulty}
                          style={{ 
                            backgroundColor: getDifficultyColor(guide.difficulty) + '20',
                            color: getDifficultyColor(guide.difficulty)
                          }}
                        >
                          {guide.difficulty}
                        </span>
                        <span className={styles.guideDuration}>{guide.duration}</span>
                      </div>
                      <div className={styles.guideStats}>
                        <span className={styles.guideRating}>
                          ⭐ {guide.rating} ({guide.reviewCount})
                        </span>
                        <span className={styles.guideSteps}>
                          {guide.steps?.length || 0} steps
                        </span>
                      </div>
                      <button 
                        className={styles.viewGuideButton}
                        onClick={() => handleNavigate(`/guides/${guide.id}`)}
                      >
                        {t('viewGuide')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={data}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

// Helper function to get difficulty color (same as in PCAssemblySteps)
const getDifficultyColor = (difficulty: string) => {
  switch(difficulty?.toLowerCase()) {
    case 'easy': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'hard': return '#ef4444';
    default: return '#6b7280';
  }
};

export default ProfilePage;