import React from "react";
import { useTranslations } from "next-intl";
import styles from "./CategoryCard.module.css";

type CategoryCardProps = {
  level: string;
  guidesCount: number;
  title: string;
  description: string;
  image: string;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  level, 
  guidesCount, 
  title, 
  description, 
  image 
}) => {
  const t = useTranslations("CategoryCard");

  // Translate level if it matches common difficulty levels
  const getTranslatedLevel = (level: string): string => {
    const levelMap: { [key: string]: string } = {
      'Beginner': t('beginner'),
      'Intermediate': t('intermediate'),
      'Advanced': t('advanced'),
      'Expert': t('expert'),
      'Easy': t('easy'),
      'Medium': t('medium'),
      'Hard': t('hard')
    };
    return levelMap[level] || level;
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} />
        <span className={styles.level}>{getTranslatedLevel(level)}</span>
        <span className={styles.guides}>
          {t('guidesCount', { count: guidesCount })}
        </span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {/* <span className={styles.arrow}>➝</span> */}
      </div>
    </div>
  );
};

export default CategoryCard;