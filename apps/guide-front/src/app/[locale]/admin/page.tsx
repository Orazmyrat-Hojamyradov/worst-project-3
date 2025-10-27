"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useCreateUniversity, useDeleteUniversity, useFetchUniversities, useUpdateUniversity } from "./hooks";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import CustomSelect from "@/components/ui/Select/Select";

interface Tip {
  id: string;
  type: "pro" | "warning" | "info";
  text: string;
}

interface Step {
  id: string;
  title: string;
  body: string;
  order: number;
  mediaUrl: string | null;
  mediaType: string | null;
  estimateMinutes: number;
  tips: Tip[];
}

interface University {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: number;
  mediaUrl: string | null; // Added guide-level media
  steps: Step[];
  language: "en" | "ru" | "tm";
  createdAt: string;
  updatedAt: string;
}

interface CreateUniversityPayload {
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: number;
  mediaUrl: string | null; // Added guide-level media
  steps: Omit<Step, "id">[];
  language: "en" | "ru" | "tm";
}

interface CreateStep extends Omit<Step, "id"> {}
interface CreateTip extends Omit<Tip, "id"> {}

const initialStep: CreateStep = {
  title: "",
  body: "",
  order: 1,
  mediaUrl: null,
  mediaType: null,
  estimateMinutes: 10,
  tips: [],
};

const initialFormData: CreateUniversityPayload = {
  title: "",
  description: "",
  category: "",
  difficulty: "Intermediate",
  duration: "",
  rating: 5,
  mediaUrl: null, // Added guide-level media
  steps: [initialStep],
  language: "en",
};

export default function AdminUniversitiesPage() {
  const [formData, setFormData] = useState<CreateUniversityPayload>(initialFormData);
  const [editingUni, setEditingUni] = useState<University | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "ru" | "tm">("en");
  const [uploadingStepIndex, setUploadingStepIndex] = useState<number | null>(null);
  const [uploadingGuideMedia, setUploadingGuideMedia] = useState(false); // New state for guide media upload

  const { data: universities, isLoading } = useFetchUniversities();
  const createMutation = useCreateUniversity();
  const updateMutation = useUpdateUniversity();
  const deleteMutation = useDeleteUniversity();
  const t = useTranslations('AdminUniversities');

  const userData = Cookies.get('user_data')
  const user = userData ? JSON.parse(userData) : null

  console.log(universities);

  // File upload handler for guide-level media
  const handleGuideFileUpload = async (file: File) => {
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Uploading guide media:', file.name, file.type, file.size);

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only images and videos are allowed.');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 50MB limit');
      return;
    }

    setUploadingGuideMedia(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('Sending upload request...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload success:', data);
      
      setFormData(prev => ({
        ...prev,
        mediaUrl: data.url,
      }));

      alert('Guide media uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingGuideMedia(false);
    }
  };

  // File upload handler for step media
  const handleFileUpload = async (stepIndex: number, file: File) => {
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Uploading file:', file.name, file.type, file.size);

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only images and videos are allowed.');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 50MB limit');
      return;
    }

    setUploadingStepIndex(stepIndex);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('Sending upload request...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload success:', data);
      
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      
      handleMediaUpdate(stepIndex, data.url, mediaType);

      alert('File uploaded successfully! The URL will be saved when you submit the form.');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingStepIndex(null);
    }
  };

  const handleMediaUpdate = (stepIndex: number, mediaUrl: string | null, mediaType: string | null) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      mediaUrl,
      mediaType,
    };
    setFormData({ ...formData, steps: updatedSteps });
    console.log('Media updated for step', stepIndex, 'URL:', mediaUrl, 'Type:', mediaType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Current form data before submit:', formData);
    console.log('Steps with media:', formData.steps.map((step, index) => ({
      index,
      title: step.title,
      mediaUrl: step.mediaUrl,
      mediaType: step.mediaType
    })));

    const payload = {
      ...formData,
      language: currentLanguage,
      mediaUrl: formData.mediaUrl, // Include guide-level mediaUrl
      steps: formData.steps.map(step => ({
        title: step.title,
        body: step.body,
        order: step.order,
        mediaUrl: step.mediaUrl,
        mediaType: step.mediaType,
        estimateMinutes: step.estimateMinutes,
        tips: step.tips.map(tip => ({
          type: tip.type,
          text: tip.text,
        })),
      })),
    };

    console.log('Submitting payload:', JSON.stringify(payload, null, 2));
    console.log('Guide mediaUrl:', payload.mediaUrl);

    try {
      if (editingUni) {
        await updateMutation.mutateAsync({ id: editingUni.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      alert('University saved successfully!');
      resetForm();
    } catch (error) {
      console.error("Error saving university:", error);
      alert('Failed to save university. Check console for details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this university?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingUni(null);
    setCurrentLanguage("en");
  };

  const handleStepChange = (
    stepIndex: number,
    field: keyof Omit<Step, "id" | "tips">,
    value: string | number | null
  ) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      [field]: value,
    };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const handleTipChange = (
    stepIndex: number,
    tipIndex: number,
    field: keyof Tip,
    value: string
  ) => {
    const updatedSteps = [...formData.steps];
    const updatedTips = [...updatedSteps[stepIndex].tips];
    
    updatedTips[tipIndex] = {
      ...updatedTips[tipIndex],
      [field]: value,
    };

    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      tips: updatedTips,
    };

    setFormData({ ...formData, steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: CreateStep = {
      ...initialStep,
      order: formData.steps.length + 1,
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
  };

  const addTip = (stepIndex: number) => {
    const updatedSteps = [...formData.steps];
    const newTip: CreateTip = {
      type: "info",
      text: "",
    };
    
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      tips: [...updatedSteps[stepIndex].tips, newTip],
    };

    setFormData({ ...formData, steps: updatedSteps });
  };

  const removeStep = (stepIndex: number) => {
    const updatedSteps = formData.steps.filter((_, index) => index !== stepIndex);
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));
    setFormData({ ...formData, steps: reorderedSteps });
  };

  const removeTip = (stepIndex: number, tipIndex: number) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      tips: updatedSteps[stepIndex].tips.filter((_, index) => index !== tipIndex),
    };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const removeMedia = (stepIndex: number) => {
    handleMediaUpdate(stepIndex, null, null);
  };

  const removeGuideMedia = () => {
    setFormData(prev => ({
      ...prev,
      mediaUrl: null,
    }));
  };

  const startEditing = (uni: University) => {
    setEditingUni(uni);
    setCurrentLanguage(uni.language);
    setFormData({
      title: uni.title,
      description: uni.description,
      category: uni.category,
      difficulty: uni.difficulty,
      duration: uni.duration,
      rating: uni.rating,
      mediaUrl: uni.mediaUrl, // Load guide-level mediaUrl
      steps: uni.steps.map(step => ({
        title: step.title,
        body: step.body,
        order: step.order,
        mediaUrl: step.mediaUrl,
        mediaType: step.mediaType,
        estimateMinutes: step.estimateMinutes,
        tips: step.tips.map(tip => ({
          type: tip.type,
          text: tip.text,
        })),
      })),
      language: uni.language,
    });
  };

  const filteredUniversities = universities?.filter(
    (uni: University) => uni.language === currentLanguage
  );

   if ( user?.role !== 'admin' ) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t('accessDenied')}</h1>
        <p className={styles.error}>{t('noPermission')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Language Toggle */}
      <div className={styles.languageToggle}>
        <h3>Current Language: {currentLanguage.toUpperCase()}</h3>
        <div className={styles.toggleButtons}>
          {(["en", "ru", "tm"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`${styles.toggleButton} ${
                currentLanguage === lang ? styles.active : ""
              }`}
              onClick={() => setCurrentLanguage(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <h2>{editingUni ? "Edit Guide" : `Add New Guide (${currentLanguage.toUpperCase()})`}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
          className={styles.input}
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={styles.textarea}
        />

        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className={styles.input}
        />

        <CustomSelect
          value={formData.difficulty}
          onChange={(val) =>
            setFormData({
              ...formData,
              difficulty: val as CreateUniversityPayload["difficulty"],
            })
          }
          options={[
            { value: "Beginner", label: "Beginner" },
            { value: "Intermediate", label: "Intermediate" },
            { value: "Advanced", label: "Advanced" },
          ]}
        />

        <input
          type="text"
          placeholder="Duration (e.g., 3-4 hours)"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: e.target.value })
          }
          className={styles.input}
        />

        {/* Guide-level Media Upload Section */}
        <div className={styles.guideMediaSection}>
          <h3>Guide Cover Image/Video</h3>
          <div className={styles.stepField}>
            <label>Upload Guide Media</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log('Guide file selected:', file.name);
                  handleGuideFileUpload(file);
                }
                e.target.value = '';
              }}
              className={styles.input}
              disabled={uploadingGuideMedia}
            />
            {uploadingGuideMedia && (
              <span className={styles.uploadingText}>Uploading... Please wait</span>
            )}
          </div>

          {formData.mediaUrl && (
            <div className={styles.mediaPreview}>
              <div className={styles.mediaInfo}>
                <span>✅ Guide media uploaded successfully</span>
                <span className={styles.mediaPath}>Path: {formData.mediaUrl}</span>
                <a 
                  href={formData.mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.mediaLink}
                >
                  Preview
                </a>
                <button
                  type="button"
                  onClick={removeGuideMedia}
                  className={styles.removeMediaButton}
                >
                  Remove
                </button>
              </div>
              <img 
                src={formData.mediaUrl} 
                alt="Guide Preview" 
                className={styles.mediaPreviewImage}
              />
            </div>
          )}
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepsHeader}>
            <h3>Steps</h3>
            <button
              type="button"
              onClick={addStep}
              className={styles.addButton}
            >
              + Add Step
            </button>
          </div>

          {formData.steps.map((step, stepIndex) => (
            <div key={stepIndex} className={styles.stepSection}>
              <div className={styles.stepHeader}>
                <h4>Step {step.order}</h4>
                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(stepIndex)}
                    className={styles.removeButton}
                  >
                    Remove Step
                  </button>
                )}
              </div>
              
              <div className={styles.stepContent}>
                <input
                  type="text"
                  placeholder="Step Title"
                  value={step.title}
                  onChange={(e) =>
                    handleStepChange(stepIndex, "title", e.target.value)
                  }
                  className={styles.input}
                  required
                />
                
                <textarea
                  placeholder="Step Content"
                  value={step.body}
                  onChange={(e) =>
                    handleStepChange(stepIndex, "body", e.target.value)
                  }
                  className={styles.textarea}
                  required
                />
                
                <div className={styles.stepRow}>
                  <div className={styles.stepField}>
                    <label>Estimated Minutes</label>
                    <input
                      type="number"
                      placeholder="Estimated Minutes"
                      min="1"
                      value={step.estimateMinutes}
                      onChange={(e) =>
                        handleStepChange(stepIndex, "estimateMinutes", Number(e.target.value))
                      }
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.stepField}>
                    <label>Upload Media (Image or Video)</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('File selected:', file.name);
                          handleFileUpload(stepIndex, file);
                        }
                        e.target.value = '';
                      }}
                      className={styles.input}
                      disabled={uploadingStepIndex === stepIndex}
                    />
                    {uploadingStepIndex === stepIndex && (
                      <span className={styles.uploadingText}>Uploading... Please wait</span>
                    )}
                  </div>
                </div>

                {step.mediaUrl && (
                  <div className={styles.mediaPreview}>
                    <div className={styles.mediaInfo}>
                      <span>
                        {step.mediaType === 'image' ? '🖼️ Image' : '🎥 Video'} uploaded successfully
                      </span>
                      <span className={styles.mediaPath}>Path: {step.mediaUrl}</span>
                      <a 
                        href={step.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.mediaLink}
                      >
                        Preview
                      </a>
                      <button
                        type="button"
                        onClick={() => removeMedia(stepIndex)}
                        className={styles.removeMediaButton}
                      >
                        Remove
                      </button>
                    </div>
                    {step.mediaType === 'image' && (
                      <img 
                        src={step.mediaUrl} 
                        alt="Preview" 
                        className={styles.mediaPreviewImage}
                      />
                    )}
                    {step.mediaType === 'video' && (
                      <video 
                        src={step.mediaUrl} 
                        controls
                        className={styles.mediaPreviewImage}
                      />
                    )}
                  </div>
                )}

                <div className={styles.tipsSection}>
                  <div className={styles.tipsHeader}>
                    <h5>Tips</h5>
                    <button
                      type="button"
                      onClick={() => addTip(stepIndex)}
                      className={styles.addSmallButton}
                    >
                      + Add Tip
                    </button>
                  </div>
                  
                  {step.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className={styles.tipRow}>
                      <select
                        value={tip.type}
                        onChange={(e) =>
                          handleTipChange(stepIndex, tipIndex, "type", e.target.value as Tip["type"])
                        }
                        className={styles.tipSelect}
                      >
                        <option value="info">Info</option>
                        <option value="pro">Pro</option>
                        <option value="warning">Warning</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Tip text"
                        value={tip.text}
                        onChange={(e) =>
                          handleTipChange(stepIndex, tipIndex, "text", e.target.value)
                        }
                        className={styles.tipInput}
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeTip(stepIndex, tipIndex)}
                        className={styles.removeTipButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingUni 
              ? (updateMutation.isPending ? "Updating..." : "Update University") 
              : (createMutation.isPending ? "Creating..." : "Create University")}
          </button>
          {editingUni && (
            <button type="button" onClick={resetForm} className={styles.cancelButton}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>All Universities ({currentLanguage.toUpperCase()})</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className={styles.list}>
          {filteredUniversities?.map((uni: University) => (
            <li key={uni.id} className={styles.listItem}>
              <div className={styles.universityInfo}>
                <strong>{uni.title}</strong> 
                <span> - {uni.category} ({uni.difficulty})</span>
                <div className={styles.universityMeta}>
                  Duration: {uni.duration} | Rating: {uni.rating}/5 | Steps: {uni.steps.length}
                  {uni.mediaUrl && <span> | 🖼️ Has cover media</span>}
                </div>
              </div>
              <div className={styles.actions}>
                <button onClick={() => startEditing(uni)}>Edit</button>
                <button onClick={() => handleDelete(uni.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}