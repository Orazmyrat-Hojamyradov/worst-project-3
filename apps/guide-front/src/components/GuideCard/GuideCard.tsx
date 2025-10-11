'use client'

import React from "react";
import { useTranslations } from "next-intl";
import styles from "./GuideCard.module.css";
import { useRouter } from "next/navigation";

type Tip = {
  id: string;
  type: string;
  text: string;
};

type Step = {
  id: string;
  title: string;
  body: string;
  order: number;
  mediaUrl: string | null;
  mediaType: string | null;
  estimateMinutes: number;
  tips: Tip[];
};

type Guide = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  rating: number;
  steps: Step[];
  language: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
};

type GuideCardProps = {
  guide: Guide;
};

const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  const router = useRouter();
  const t = useTranslations('GuideCard');

  const {
    id,
    title,
    description,
    category,
    difficulty,
    duration,
    rating,
    steps,
    image,
    updatedAt,
  } = guide;

  // Calculate review count based on rating (you can adjust this logic)
  const reviewCount = Math.floor(rating * 25); // Example: 5 rating = ~125 reviews

  // Generate placeholder image if none provided
  const imageUrl = image || `https://placehold.co/600x400/1e293b/e2e8f0?text=${encodeURIComponent(title)}`;

  // Format date
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });

  const handleStartGuide = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/guides/${id}`);
  };

  const handleCardClick = () => {
    router.push(`/guides/${id}`);
  };

  // Translate difficulty levels
  const getTranslatedDifficulty = (difficulty: string): string => {
    const difficultyMap: { [key: string]: string } = {
      'Beginner': t('beginner'),
      'Intermediate': t('intermediate'),
      'Advanced': t('advanced'),
      'Expert': t('expert')
    };
    return difficultyMap[difficulty] || difficulty;
  };

  // Translate categories
  const getTranslatedCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'PC Building': t('pcBuilding'),
      'Monitor Setup': t('monitorSetup'),
      'Keyboard Assembly': t('keyboardAssembly'),
      'Audio Setup': t('audioSetup'),
      'Networking': t('networking'),
      'Gaming Setup': t('gamingSetup'),
      'Workstation': t('workstation')
    };
    return categoryMap[category] || category;
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        <img 
          src={imageUrl} 
          alt={title} 
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.tags}>
          <span className={styles.tag}>{getTranslatedCategory(category)}</span>
          <span className={`${styles.tag} ${styles[difficulty.toLowerCase()]}`}>
            {getTranslatedDifficulty(difficulty)}
          </span>
        </div>
        <div className={styles.stepCount}>
          {t('stepsCount', { count: steps.length })}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.meta}>
          <span className={styles.duration}>⏱ {duration}</span>
          <span className={styles.rating}>
            ⭐ {rating.toFixed(1)} {t('reviews', { count: reviewCount })}
          </span>
        </div>

        <div className={styles.updated}>
          {t('updated', { date: formattedDate })}
        </div>

        <button 
          onClick={handleStartGuide} 
          className={styles.button}
          aria-label={t('startGuideAriaLabel', { title })}
        >
          {t('startGuide')}
        </button>
      </div>
    </div>
  );
};

export default GuideCard;