import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Video, 
  FileText,
  Check,
  Tag
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  preview?: string;
  type: 'image' | 'video' | 'document';
  size: number;
}

const MAX_FILES = 99;

export function MediaUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [sharedTitle, setSharedTitle] = useState('');
  const [sharedDescription, setSharedDescription] = useState('');
  const [sharedTags, setSharedTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map((file, index) => {
      const type: 'image' | 'video' | 'document' = 
        file.type.startsWith('image/') ? 'image' :
        file.type.startsWith('video/') ? 'video' : 'document';

      return {
        id: `${Date.now()}-${index}`,
        file,
        name: file.name,
        preview: type === 'image' ? URL.createObjectURL(file) : undefined,
        type,
        size: file.size
      };
    });

    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, MAX_FILES);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateFileName = (baseName: string, index: number, total: number): string => {
    if (total === 1) return baseName || 'untitled';
    const extension = baseName.split('.').pop() || '';
    const nameWithoutExt = baseName.replace(`.${extension}`, '');
    return `${nameWithoutExt}_${String(index + 1).padStart(2, '0')}.${extension}`;
  };

  const handleUpload = async () => {
    setUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploading(false);
    navigate('/media');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/media')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Upload Media</h1>
            <p className="text-muted-foreground">Upload single or multiple files (max {MAX_FILES})</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/media')}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || uploading}
            className="gap-2"
          >
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card 
              className={cn(
                'border-2 border-dashed transition-colors cursor-pointer',
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              )}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Drop files here or click to browse</h3>
                <p className="text-muted-foreground mt-1">
                  Support images, videos, and documents (max {MAX_FILES} files)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* File List */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Selected Files ({files.length})</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFiles([])}
                      className="text-destructive"
                    >
                      Clear All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="w-12 h-12 rounded bg-background flex items-center justify-center flex-shrink-0">
                        {file.preview ? (
                          <img src={file.preview} alt="" className="w-full h-full object-cover rounded" />
                        ) : file.type === 'video' ? (
                          <Video className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {sharedTitle 
                            ? generateFileName(sharedTitle, index, files.length) 
                            : file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Shared Metadata */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Shared Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sharedTitle">Shared Title</Label>
                  <Input
                    id="sharedTitle"
                    value={sharedTitle}
                    onChange={(e) => setSharedTitle(e.target.value)}
                    placeholder="Title applied to all files..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Files will be named: title_01, title_02, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharedDescription">Shared Description</Label>
                  <Textarea
                    id="sharedDescription"
                    value={sharedDescription}
                    onChange={(e) => setSharedDescription(e.target.value)}
                    placeholder="Description applied to all files..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharedTags">Shared Tags</Label>
                  <Input
                    id="sharedTags"
                    value={sharedTags}
                    onChange={(e) => setSharedTags(e.target.value)}
                    placeholder="Comma-separated tags..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: product, launch, 2024
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Upload Options</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Add timestamp to filenames
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      Compress images before upload
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Generate thumbnails
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upload Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm">Upload Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-success" />
                    Maximum file size: 100MB per file
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-success" />
                    Supported formats: JPG, PNG, GIF, MP4, PDF
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-success" />
                    Use shared metadata for batch uploads
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-success" />
                    Files are automatically tagged
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
