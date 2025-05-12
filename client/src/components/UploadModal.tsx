import { useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '../contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadModal = ({ open, onOpenChange }: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Temporary upload media function
  const uploadMedia = async (files: File[], note?: string, collectionId?: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Upload functionality temporarily disabled during development');
        resolve();
      }, 1000);
    });
  };
  
  const { data: collections } = useQuery({
    queryKey: ['/api/collections'],
    enabled: open,
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const fileList = Array.from(e.dataTransfer.files);
      setFiles(fileList);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      await uploadMedia(
        files, 
        note, 
        collectionId ? parseInt(collectionId) : undefined
      );
      handleClose();
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClose = () => {
    setFiles([]);
    setNote('');
    setCollectionId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[#5A4B53]">Upload Memories</DialogTitle>
        </DialogHeader>
        
        <div 
          className="border-2 border-dashed border-[#F8C8DC] rounded-xl p-8 text-center mb-5 cursor-pointer hover:bg-[#F8C8DC] hover:bg-opacity-10 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadCloud className="h-12 w-12 text-[#E36588] mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#5A4B53] mb-2">Drag photos & videos here</h4>
          <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
          
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          
          <Button
            className="bg-[#E36588] text-white px-4 py-2 rounded-lg hover:bg-[#D14D72] transition"
          >
            Select Files
          </Button>
          
          {files.length > 0 && (
            <div className="mt-4 text-left">
              <p className="font-medium text-[#5A4B53]">Selected files ({files.length}):</p>
              <ul className="mt-2 text-sm text-gray-500 max-h-24 overflow-y-auto">
                {files.map((file, index) => (
                  <li key={index} className="truncate">{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="collection" className="block text-sm font-medium text-[#5A4B53] mb-1">
              Add to Collection
            </Label>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a collection (optional)" />
              </SelectTrigger>
              <SelectContent>
                {collections && Array.isArray(collections) ? collections.map((collection: any) => (
                  <SelectItem key={collection.id} value={collection.id.toString()}>
                    {collection.name}
                  </SelectItem>
                )) : (
                  <SelectItem value="0">No collections available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="note" className="block text-sm font-medium text-[#5A4B53] mb-1">
              Add a Romantic Note
            </Label>
            <Textarea
              id="note"
              placeholder="Write something sweet..."
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E36588]"
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            disabled={files.length === 0 || isUploading}
            className="bg-[#E36588] text-white hover:bg-[#D14D72]"
            onClick={handleUpload}
          >
            {isUploading ? "Uploading..." : "Upload Memories"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
