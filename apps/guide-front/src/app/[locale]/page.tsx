'use client'

import CategoryCard from "@/components/CategoryCard/CategoryCard";
import FilterSection from "@/components/FilterSection/FilterSection";
import GuideCard from "@/components/GuideCard/GuideCard";
import HeroSection from "@/components/HeroSection/HeroSection";
import { example } from "@/example";
import { useLocale, useTranslations } from "next-intl";
import { useFetchUniversities } from "./admin/hooks";
import { useState, useMemo, useEffect } from "react";
import { categories } from "@/categories";
import Cookies from "js-cookie";

interface FilterState {
  category: string;
  difficulty: string;
  duration: string;
  rating: string;
  difficultyLevel?: string;
}

type Guide = typeof example

function App() {
  const { data, isLoading, error } = useFetchUniversities();
  const t = useTranslations("HomePage");
  const locale = useLocale();
  
  const [filters, setFilters] = useState<FilterState>({
    category: t('allCategories'),
    difficulty: t('allLevels'),
    duration: t('anyDuration'),
    rating: t('anyRating')
  });

  const currentLanguage = useLocale();

  // Enhanced duration parser with error handling
  const parseDurationToMinutes = (duration: string | number): number => {
    if (!duration) return 0;
    
    try {
      // If duration is already a number, treat it as hours
      if (typeof duration === 'number') {
        return duration * 60;
      }

      const lowerDuration = duration.toString().toLowerCase();
      
      // Handle ranges like "3-4 hours"
      if (lowerDuration.includes('-')) {
        const rangeMatch = lowerDuration.match(/(\d+)\s*-\s*(\d+)\s*(hour|hr|min)/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          const unit = rangeMatch[3];
          const average = (start + end) / 2;
          return unit === 'hour' || unit === 'hr' ? average * 60 : average;
        }
      }
      
      // Handle single values with units
      const singleMatch = lowerDuration.match(/(\d+)\s*(hour|hr|min)/);
      if (singleMatch) {
        const value = parseInt(singleMatch[1]);
        const unit = singleMatch[2];
        return unit === 'hour' || unit === 'hr' ? value * 60 : value;
      }
      
      // Try to parse pure numbers
      const numberMatch = lowerDuration.match(/\d+/);
      if (numberMatch) {
        const value = parseInt(numberMatch[0]);
        // Assume hours if no unit specified and value is small, minutes if large
        return value < 10 ? value * 60 : value;
      }
      
      return 0;
    } catch (error) {
      console.error('Error parsing duration:', error);
      return 0;
    }
  };

  // Safe data access helper
  const getSafeData = () => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  };

  // Filter the data based on current filters and language
  const filteredData = useMemo(() => {
    const safeData = getSafeData();
    if (!safeData.length) return [];

    return safeData.filter((guide: Guide) => {
      if (!guide || typeof guide !== 'object') return false;

      // Language filter - filter by cookie locale
      if (guide.language && guide.language !== currentLanguage) {
        return false;
      }

      // Category filter
      if (filters.category !== t('allCategories')) {
        const guideCategory = guide.category?.toLowerCase().trim();
        const filterCategory = filters.category.toLowerCase().trim();
        if (guideCategory !== filterCategory) {
          return false;
        }
      }

      // Difficulty filter
      if (filters.difficulty !== t('allLevels')) {
        const guideDifficulty = guide.difficulty?.toLowerCase().trim();
        const filterDifficulty = filters.difficulty.toLowerCase().trim();
        if (guideDifficulty !== filterDifficulty) {
          return false;
        }
      }

      // Duration filter
      if (filters.duration !== t('anyDuration')) {
        const guideDurationMinutes = parseDurationToMinutes(guide.duration || '');
        
        switch (filters.duration) {
          case t('under30min'):
            if (guideDurationMinutes > 30 || guideDurationMinutes === 0) return false;
            break;
          case t('30to60min'):
            if (guideDurationMinutes < 30 || guideDurationMinutes > 60) return false;
            break;
          case t('1to2hours'):
            if (guideDurationMinutes < 60 || guideDurationMinutes > 120) return false;
            break;
          case t('2to4hours'):
            if (guideDurationMinutes < 120 || guideDurationMinutes > 240) return false;
            break;
          case t('4plusHours'):
            if (guideDurationMinutes < 240) return false;
            break;
        }
      }

      // Rating filter
      if (filters.rating !== t('anyRating')) {
        const guideRating = typeof guide.rating === 'number' 
          ? guide.rating 
          : Number(guide.rating) || 0;
        
        switch (filters.rating) {
          case t('45plusStars'):
            if (guideRating < 4.5) return false;
            break;
          case t('40plusStars'):
            if (guideRating < 4.0) return false;
            break;
          case t('35plusStars'):
            if (guideRating < 3.5) return false;
            break;
          case t('30plusStars'):
            if (guideRating < 3.0) return false;
            break;
        }
      }

      return true;
    });
  }, [data, filters, t, currentLanguage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="app">
        <HeroSection />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '1.125rem',
          color: '#94a3b8'
        }}>
          {t('loading')}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <HeroSection />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '1.125rem',
          color: '#ef4444'
        }}>
          {t('error')}: {error.message}
        </div>
      </div>
    );
  }

  const safeData = getSafeData();
  const hasData = safeData.length > 0;

  return (
    <div className="app">
      <HeroSection />

      <h1 style={{ textAlign: 'center' }}>{t('featuredGuides')}</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px' }}>
        {t('featuredDescription')}
      </p>

      <FilterSection onFilterChange={handleFilterChange}/>
        
      <h4 style={{ textAlign: 'center' }}>
        {t('showingGuides', { count: filteredData.length })}
      </h4>
      
      {hasData ? (
        <div 
        id="let"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {filteredData.map((guide: Guide) => (
            <GuideCard
              key={guide.id || guide.title}
              guide={guide}
            />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '1.125rem',
          color: '#94a3b8'
        }}>
          {t('noGuidesFound')}
        </div>
      )}
    </div>
  );
}

export default App;