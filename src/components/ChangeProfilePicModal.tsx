import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Link as LinkIcon, Trash2, X, Check, Sparkles } from 'lucide-react';
import { ATHLETIC_AVATAR_PRESETS } from '../utils/fitnessLogic';
import { SharifAvatarSvg } from './ExerciseBodyPositionSvg';

interface ChangeProfilePicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  athleteName: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

export const ChangeProfilePicModal: React.FC<ChangeProfilePicModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  athleteName,
  onSaveAvatar,
}) => {
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(currentAvatarUrl || '');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarUrl(currentAvatarUrl || '');
      setCustomUrlInput(currentAvatarUrl && !currentAvatarUrl.startsWith('data:') ? currentAvatarUrl : '');
      setErrorMessage(null);
    }
  }, [isOpen, currentAvatarUrl]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Process file upload with client-side canvas square crop and resize (256x256)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
      setIsProcessing(false);
    };

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setSelectedAvatarUrl(String(reader.result));
            setIsProcessing(false);
            return;
          }

          // Center-crop square calculation
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Export compressed webp/jpeg data url
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.88);
          setSelectedAvatarUrl(compressedDataUrl);
          setIsProcessing(false);
        } catch {
          setSelectedAvatarUrl(String(reader.result));
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setErrorMessage('Unable to process this image format.');
        setIsProcessing(false);
      };

      img.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setErrorMessage('Image URL must start with http:// or https://');
      return;
    }
    setErrorMessage(null);
    setSelectedAvatarUrl(trimmed);
  };

  const handleResetToDefault = () => {
    setSelectedAvatarUrl('');
    setCustomUrlInput('');
    setErrorMessage(null);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatarUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-photo-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 my-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-photo-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Change Profile Picture
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Personalize your athlete profile and training dashboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Live Preview Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SharifAvatarSvg
              name={athleteName}
              avatarUrl={selectedAvatarUrl}
              className="w-16 h-16 border-2 border-white dark:border-slate-700"
            />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Avatar Preview</div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {athleteName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {selectedAvatarUrl ? 'Custom photo / athletic preset' : 'Default athletic monogram'}
              </div>
            </div>
          </div>
          {selectedAvatarUrl && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Direct URL</span>
          </button>
        </div>

        {/* Tab 1: Presets Grid */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Athletic Identity
            </span>
            <div className="grid grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
              {ATHLETIC_AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatarUrl === preset.svgDataUri;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatarUrl(preset.svgDataUri);
                      setErrorMessage(null);
                    }}
                    title={`${preset.name} - ${preset.tagline}`}
                    className={`group relative p-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-colors ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-500/50'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <img
                      src={preset.svgDataUri}
                      alt={preset.name}
                      className="w-12 h-12 rounded-full group-hover:scale-105 transition-transform"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center truncate max-w-full">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload photo"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-rose-50/20 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse and upload an image
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                Supports PNG, JPG, or WEBP. Photos are automatically cropped square and compressed locally.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>
            {isProcessing && (
              <div className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
                Optimizing image...
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleApplyUrl} className="space-y-3">
            <div>
              <label htmlFor="custom-avatar-url-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Paste Image Direct URL
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-avatar-url-input"
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shrink-0"
                >
                  Preview
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Tip: Enter any publicly accessible HTTPS image link.
              </p>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Picture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
