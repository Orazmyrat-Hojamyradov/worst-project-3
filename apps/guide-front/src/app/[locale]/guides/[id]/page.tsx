'use client'

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Star, Calendar, ChevronLeft, Bookmark, ChevronDown, ChevronUp, CheckCircle, Circle, AlertCircle, Info, Lightbulb, Play, Image } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const PCAssemblySteps = () => {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [bookmarked, setBookmarked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const t = useTranslations('GuideSteps');
  const isAuth = !!Cookies.get('auth_token')

  // Get current user from cookies
  useEffect(() => {
    const userCookie = Cookies.get('user_data');
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        setCurrentUserId(user.id || user.userId || user._id);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

  // Load bookmarks and completed steps from state for current user
  useEffect(() => {
    if (!isAuth) alert("Log in!")

    // Load bookmarks for this user (using state instead of localStorage)
    const savedBookmarks = window.bookmarksData?.[currentUserId] || [];
    setBookmarked(savedBookmarks.includes(id));

    // Load completed steps for this guide and user (using state)
    const savedCompletedSteps = window.completedStepsData?.[`${currentUserId}_${id}`] || [];
    setCompletedSteps(savedCompletedSteps);
  }, [id, currentUserId]);

  // Save completed steps whenever they change
  useEffect(() => {
    if (!currentUserId) return;
    if (!window.completedStepsData) window.completedStepsData = {};
    window.completedStepsData[`${currentUserId}_${id}`] = completedSteps;
  }, [completedSteps, id, currentUserId]);

  // Toggle bookmark and save to state for current user
  const toggleBookmark = () => {
    if (!currentUserId) {
      console.log('User not logged in');
      alert("Log in!")
    }

    if (!window.bookmarksData) window.bookmarksData = {};
    let bookmarks = window.bookmarksData[currentUserId] || [];
    
    if (bookmarked) {
      // Remove bookmark
      bookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
    } else {
      // Add bookmark
      if (!bookmarks.includes(id)) {
        bookmarks.push(id);
      }
    }
    
    window.bookmarksData[currentUserId] = bookmarks;
    setBookmarked(!bookmarked);
  };

  // For anonymous users
  const handleAnonymousUser = () => {
    if (!isAuth) alert("Log in!")
    const tempUserId = `anonymous_${Date.now()}`;
    setCurrentUserId(tempUserId);
    return tempUserId;
  };

  // Enhanced toggle bookmark that handles anonymous users
  const toggleBookmarkEnhanced = () => {
    if (!currentUserId) {
      const tempUserId = handleAnonymousUser();
      setCurrentUserId(tempUserId);
      setTimeout(() => toggleBookmark(), 100);
      return;
    }
    toggleBookmark();
  };

  const { data: guideData, isLoading, error } = useQuery({
    queryKey: ["guide", id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3010/api/guides/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch guide");
      return res.json();
    },
  });

  console.log(guideData);
  

  // Loading state
  if (isLoading) {
    return (
      <div className="container">
        <div className="mainContent">
          <div className="loading">{t('loading')}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <div className="mainContent">
          <div className="error">{t('error')}: {error.message}</div>
        </div>
      </div>
    );
  }

  // No data state
  if (!guideData) {
    return (
      <div className="container">
        <div className="mainContent">
          <div className="not-found">{t('notFound')}</div>
        </div>
      </div>
    );
  }

  const toggleStepComplete = (stepId) => {
    if (!currentUserId) {
      const tempUserId = handleAnonymousUser();
      setCurrentUserId(tempUserId);
      setTimeout(() => toggleStepComplete(stepId), 100);
      return;
    }

    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const toggleStepExpanded = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  // Safe calculations with fallbacks
  const progress = ((completedSteps.length / (guideData.steps?.length || 1)) * 100) || 0;
  const totalMinutes = guideData.steps?.reduce((acc, step) => acc + step.estimateMinutes, 0) || 0;
  const remainingMinutes = guideData.steps
    ?.filter(step => !completedSteps.includes(step.id))
    ?.reduce((acc, step) => acc + step.estimateMinutes, 0) || 0;

  const getTipIcon = (type) => {
    switch(type) {
      case 'pro': return <Lightbulb size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      case 'info': return <Info size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getTranslatedTipType = (type) => {
    const typeMap = {
      'pro': t('proTip'),
      'warning': t('warningTip'),
      'info': t('infoTip')
    };
    return typeMap[type] || type;
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTranslatedDifficulty = (difficulty) => {
    const difficultyMap = {
      'Easy': t('easy'),
      'Medium': t('medium'),
      'Hard': t('hard'),
      'Beginner': t('beginner'),
      'Intermediate': t('intermediate'),
      'Advanced': t('advanced'),
      'Expert': t('expert')
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getTranslatedCategory = (category) => {
    const categoryMap = {
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

  const handleBackClick = () => {
    router.back();
  };

  // Format date with translation
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Render media content (image or video) - FIXED VERSION
  const renderMedia = (mediaUrl, mediaType) => {
    if (!mediaUrl || !mediaType) return null;

    return (
      <div className="stepMedia">
        {mediaType === 'image' && (
          <div className="mediaContainer imageContainer">
            <img 
              src={mediaUrl} 
              alt="Step illustration"
              className="stepImage"
              loading="lazy"
            />
          </div>
        )}
        
        {mediaType === 'video' && (
          <div className="mediaContainer videoContainer">
            <video 
              controls 
              className="stepVideo"
            >
              <source src={mediaUrl} type="video/mp4" />
              {t('videoNotSupported')}
            </video>
          </div>
        )}
      </div>
    );
  };

  console.log(guideData);
  

  return (
    <div className="container">
      <style>{`
        :root {
          --main-color: #e11d48;
          --bg-color: #fafafa;
          --text-color: #1e293b;
          --nav-hover: #be123c;
          --border-color: #d4d4d8;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          background-color: #0f172a;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          background-color: #1e293b;
          border-bottom: 1px solid #334155;
          padding: 1rem 0;
        }

        .headerContent {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .backButton {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .backButton:hover {
          background-color: #334155;
          color: #e2e8f0;
        }

        .mainContent {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
        }

        .leftColumn {
          min-width: 0;
        }

        .titleSection {
          margin-bottom: 2rem;
        }

        .badges {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .categoryBadge {
          background-color: #334155;
          color: #e2e8f0;
        }

        .difficultyBadge {
          background-color: #f59e0b;
          color: #000;
        }

        .title {
          font-size: 2.25rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }

        .description {
          font-size: 1rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .metaInfo {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .metaItem {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ratingStars {
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .sectionTitle {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 1.5rem;
        }

        .stepsContainer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stepCard {
          background-color: #1e293b;
          border: 1px solid #334155;
          border-radius: 0.5rem;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .stepCard:hover {
          border-color: #475569;
        }

        .stepCard.completed {
          border-color: #10b981;
          background-color: rgba(16, 185, 129, 0.05);
        }

        .stepHeader {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stepCheckbox {
          flex-shrink: 0;
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
          margin-top: 0.25rem;
          user-select: none;
        }

        .stepCheckbox:hover {
          color: #10b981;
        }

        .stepCheckbox.completed {
          color: #10b981 !important;
        }

        .stepHeaderContent {
          flex: 1;
          min-width: 0;
        }

        .stepTopRow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .stepNumber {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .stepDuration {
          font-size: 0.75rem;
          color: #64748b;
        }

        .stepDifficulty {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 600;
        }

        .stepTitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .stepTitle.completed {
          text-decoration: line-through;
          color: #64748b;
        }

        .stepBody {
          color: #94a3b8;
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        /* Media Styles */
        .stepMedia {
          margin: 1rem 0;
        }

        .mediaContainer {
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: #0f172a;
          border: 1px solid #334155;
        }

        .stepImage {
          width: 100%;
          height: auto;
          display: block;
          max-height: 400px;
          object-fit: contain;
        }

        .stepVideo {
          width: 100%;
          height: auto;
          max-height: 400px;
          background-color: #000;
        }

        .mediaCaption {
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #334155;
          background-color: rgba(15, 23, 42, 0.8);
        }

        .tipsSection {
          margin-top: 1rem;
          background-color: #0f172a;
          border-radius: 0.375rem;
          padding: 1rem;
        }

        .tipsHeader {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .tipsList {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          list-style: none;
        }

        .tipItem {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .tipIcon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .tipIcon.pro {
          color: #10b981;
        }

        .tipIcon.warning {
          color: #f59e0b;
        }

        .tipIcon.info {
          color: #3b82f6;
        }

        .hideDetailsButton {
          margin-top: 1rem;
          background-color: #334155;
          border: none;
          color: #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .hideDetailsButton:hover {
          background-color: #475569;
        }

        .detailsPlaceholder {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #0f172a;
          border-radius: 0.375rem;
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .progressCard {
          background-color: #1e293b;
          border: 1px solid #334155;
          border-radius: 0.5rem;
          padding: 1.5rem;
        }

        .progressHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .progressTitle {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .bookmarkButton {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          border-radius: 0.25rem;
        }

        .bookmarkButton:hover {
          color: var(--main-color);
          background-color: rgba(225, 29, 72, 0.1);
        }

        .bookmarkButton.active {
          color: var(--main-color);
        }

        .progressStats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .statItem {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .statLabel {
          font-size: 0.75rem;
          color: #64748b;
        }

        .statValue {
          font-size: 0.875rem;
          color: #e2e8f0;
          font-weight: 600;
        }

        .progressBarContainer {
          margin-bottom: 1rem;
        }

        .progressLabel {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .progressBarTrack {
          height: 0.5rem;
          background-color: #0f172a;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progressBarFill {
          height: 100%;
          background: linear-gradient(90deg, var(--main-color), var(--nav-hover));
          transition: width 0.3s ease;
        }

        .timeRemaining {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid #334155;
          margin-top: 0.75rem;
          font-size: 0.875rem;
        }

        .timeLabel {
          color: #94a3b8;
        }

        .timeValue {
          color: #e2e8f0;
          font-weight: 600;
        }

        .stepsList {
          margin-top: 1.5rem;
          border-top: 1px solid #334155;
          padding-top: 1.5rem;
        }

        .sidebarStepItem {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-bottom: 0.5rem;
        }

        .sidebarStepItem:hover {
          background-color: #0f172a;
        }

        .sidebarStepItem.completed {
          opacity: 0.7;
        }

        .sidebarStepIcon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .sidebarStepContent {
          flex: 1;
          min-width: 0;
        }

        .sidebarStepTitle {
          font-size: 0.875rem;
          color: #e2e8f0;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .sidebarStepTitle.completed {
          text-decoration: line-through;
          color: #64748b;
        }

        .sidebarStepDuration {
          font-size: 0.75rem;
          color: #64748b;
        }

        .loading, .error, .not-found {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          font-size: 1.125rem;
          color: #94a3b8;
        }

        .error {
          color: #ef4444;
        }

        @media (max-width: 1024px) {
          .mainContent {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
            order: -1;
          }

          .progressCard {
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 640px) {
          .mainContent {
            padding: 1.5rem 1rem;
          }

          .title {
            font-size: 1.75rem;
          }

          .stepCard {
            padding: 1rem;
          }

          .progressStats {
            grid-template-columns: 1fr;
          }

          .metaInfo {
            flex-direction: column;
            gap: 0.75rem;
          }

          .stepImage,
          .stepVideo {
            max-height: 250px;
          }
        }
      `}</style>

      <header className="header">
        <div className="headerContent">
          <button className="backButton" onClick={handleBackClick}>
            <ChevronLeft size={16} />
            {t('backToGuides')}
          </button>
        </div>
      </header>

      <main className="mainContent">
        <div className="leftColumn">
          <div className="titleSection">
            <div className="badges">
              <span className="badge categoryBadge">{getTranslatedCategory(guideData.category)}</span>
              <span 
                className="badge difficultyBadge"
                style={{ 
                  backgroundColor: getDifficultyColor(guideData.difficulty) + '20',
                  color: getDifficultyColor(guideData.difficulty)
                }}
              >
                {getTranslatedDifficulty(guideData.difficulty)}
              </span>
            </div>
            
            <h1 className="title">{guideData.title}</h1>
            <p className="description">{guideData.description}</p>
            
            <div className="metaInfo">
              <div className="metaItem">
                <Clock size={16} />
                <span>{guideData.duration}</span>
              </div>
              <div className="metaItem ratingStars">
                <Star size={16} fill="currentColor" />
                <span>{guideData.rating} {t('reviews', { count: guideData.reviewCount })}</span>
              </div>
              <div className="metaItem">
                <Calendar size={16} />
                <span>{t('updated')} {formatDate(guideData.updatedAt)}</span>
              </div>
            </div>
          </div>

          <h2 className="sectionTitle">{t('assemblySteps')}</h2>
          
          <div className="stepsContainer">
            {guideData.steps?.map((step) => (
              <div 
                key={step.id}
                id={`step-${step.id}`}
                className={`stepCard ${completedSteps.includes(step.id) ? 'completed' : ''}`}
              >
                <div className="stepHeader">
                  <div 
                    className={`stepCheckbox ${completedSteps.includes(step.id) ? 'completed' : ''}`}
                    onClick={() => toggleStepComplete(step.id)}
                  >
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </div>
                  
                  <div className="stepHeaderContent">
                    <div className="stepTopRow">
                      <span className="stepNumber">{t('step')} {step.order}</span>
                      <span className="stepDuration">{step.estimateMinutes} {t('min')}</span>
                      <span 
                        className="stepDifficulty"
                        style={{ 
                          backgroundColor: getDifficultyColor(step.difficulty) + '20',
                          color: getDifficultyColor(step.difficulty)
                        }}
                      >
                        {getTranslatedDifficulty(step.difficulty)}
                      </span>
                    </div>
                    
                    <h3 className={`stepTitle ${completedSteps.includes(step.id) ? 'completed' : ''}`}>
                      {step.title}
                    </h3>
                    
                    <p className="stepBody">{step.body}</p>
                    
                    {/* Render media if exists - FIXED CONDITION */}
                    {step.mediaUrl && step.mediaType && renderMedia(step.mediaUrl, step.mediaType)}
                    
                    {step.tips && step.tips.length > 0 && (
                      <div className="tipsSection">
                        <div className="tipsHeader">
                          <Lightbulb size={16} />
                          {t('proTips')}
                        </div>
                        <ul className="tipsList">
                          {step.tips.map((tip) => (
                            <li key={tip.id} className="tipItem">
                              <span className={`tipIcon ${tip.type}`}>
                                {getTipIcon(tip.type)}
                              </span>
                              <span>{tip.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {expandedSteps[step.id] && (
                      <div className="detailsPlaceholder">
                        {guideData?.description}
                      </div>
                    )}

                    <button 
                      className="hideDetailsButton"
                      onClick={() => toggleStepExpanded(step.id)}
                    >
                      {expandedSteps[step.id] ? (
                        <>
                          <ChevronUp size={16} />
                          {t('hideDetails')}
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          {t('showDetails')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <div className="progressCard">
            <div className="progressHeader">
              <h3 className="progressTitle">{guideData.title}</h3>
              <button 
                className={`bookmarkButton ${bookmarked ? 'active' : ''}`}
                onClick={toggleBookmarkEnhanced}
                title={bookmarked ? t('removeBookmark') : t('addBookmark')}
              >
                <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="progressStats">
              <div className="statItem">
                <span className="statLabel">{t('duration')}</span>
                <span className="statValue">{guideData.duration}</span>
              </div>
              <div className="statItem">
                <span className="statLabel">{t('steps')}</span>
                <span className="statValue">{t('stepsCompleted', { completed: completedSteps.length, total: guideData.steps?.length || 0 })}</span>
              </div>
            </div>

            <div className="progressBarContainer">
              <div className="progressLabel">
                <span>{t('progress')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progressBarTrack">
                <div 
                  className="progressBarFill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="timeRemaining">
              <span className="timeLabel">{t('timeRemaining')}:</span>
              <span className="timeValue">~{remainingMinutes}{t('min')}</span>
            </div>

            <div className="stepsList">
              {guideData.steps?.map((step) => (
                <div 
                  key={step.id}
                  className={`sidebarStepItem ${completedSteps.includes(step.id) ? 'completed' : ''}`}
                  onClick={() => {
                    document.getElementById(`step-${step.id}`)?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                >
                  <div className="sidebarStepIcon">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <Circle size={16} style={{ color: '#64748b' }} />
                    )}
                  </div>
                  <div className="sidebarStepContent">
                    <div className={`sidebarStepTitle ${completedSteps.includes(step.id) ? 'completed' : ''}`}>
                      {step.title}
                    </div>
                    <div className="sidebarStepDuration">{step.estimateMinutes} {t('min')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PCAssemblySteps;