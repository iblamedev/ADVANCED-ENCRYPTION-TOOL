import React, { useState, useCallback, useRef } from 'react';
import { Lock, Unlock, Upload, Download, Shield, Eye, EyeOff, AlertCircle, CheckCircle, FileText, Key } from 'lucide-react';
import { encryptFile, decryptFile, validatePassword } from '../utils/encryption';
import { formatFileSize } from '../utils/fileUtils';

interface FileData {
  file: File;
  encrypted?: boolean;
  originalName?: string;
}

export const EncryptionTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const strength = validatePassword(value);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileSelect = (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (file.size > maxSize) {
      showMessage('error', 'File size must be less than 50MB');
      return;
    }
    
    setSelectedFile({ file });
    showMessage('info', `Selected: ${file.name} (${formatFileSize(file.size)})`);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile || !password) {
      showMessage('error', 'Please select a file and enter a password');
      return;
    }

    if (passwordStrength === 'weak') {
      showMessage('error', 'Please use a stronger password');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const progressCallback = (progress: number) => setProgress(progress);
      const encryptedData = await encryptFile(selectedFile.file, password, progressCallback);
      
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = `${selectedFile.file.name}.encrypted`;
        downloadLinkRef.current.click();
        URL.revokeObjectURL(url);
      }

      setSelectedFile({
        file: new File([encryptedData], `${selectedFile.file.name}.encrypted`),
        encrypted: true,
        originalName: selectedFile.file.name
      });
      
      showMessage('success', 'File encrypted successfully!');
    } catch (error) {
      showMessage('error', 'Encryption failed. Please try again.');
      console.error('Encryption error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDecrypt = async () => {
    if (!selectedFile || !password) {
      showMessage('error', 'Please select an encrypted file and enter the password');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const progressCallback = (progress: number) => setProgress(progress);
      const { decryptedData, originalFilename } = await decryptFile(selectedFile.file, password, progressCallback);
      
      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = originalFilename;
        downloadLinkRef.current.click();
        URL.revokeObjectURL(url);
      }

      setSelectedFile({
        file: new File([decryptedData], originalFilename),
        encrypted: false
      });
      
      showMessage('success', 'File decrypted successfully!');
    } catch (error) {
      showMessage('error', 'Decryption failed. Please check your password and try again.');
      console.error('Decryption error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'strong': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full border border-blue-500/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Encryption Tool</h1>
          <p className="text-gray-300">Secure your files with military-grade AES-256 encryption</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border backdrop-blur-sm ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
            message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : 
               message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> :
               <AlertCircle className="w-5 h-5 mr-2" />}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              File Selection
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <FileText className="w-12 h-12 text-blue-400" />
                  </div>
                  <div className="text-white">
                    <p className="font-medium">{selectedFile.file.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(selectedFile.file.size)}</p>
                    {selectedFile.encrypted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 mt-2">
                        <Lock className="w-3 h-3 mr-1" />
                        Encrypted
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div className="text-gray-300">
                    <p className="font-medium">Drag & drop your file here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Password & Actions Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Security Settings
            </h2>
            
            <div className="space-y-4">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Encryption Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordStrength && (
                  <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthText()}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleEncrypt}
                  disabled={isProcessing || !selectedFile || !password}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Encrypt
                </button>
                
                <button
                  onClick={handleDecrypt}
                  disabled={isProcessing || !selectedFile || !password}
                  className="flex items-center justify-center px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Decrypt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security Information</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">AES-256-GCM</p>
                <p>Military-grade encryption standard</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">PBKDF2</p>
                <p>Password-based key derivation with 100k iterations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">Client-Side</p>
                <p>All encryption happens in your browser</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden download link */}
        <a ref={downloadLinkRef} className="hidden" />
      </div>
    </div>
  );
};