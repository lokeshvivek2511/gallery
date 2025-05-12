import { useState, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
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

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCollectionModal = ({ open, onOpenChange }: CreateCollectionModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Collection name required",
        description: "Please enter a name for your collection",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let coverImageUrl = null;
      
      // If there's a cover image, upload it first
      if (coverImage) {
        const formData = new FormData();
        formData.append('files', coverImage);
        
        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload cover image');
        }
        
        const uploadedMedia = await uploadResponse.json();
        if (uploadedMedia && uploadedMedia.length > 0) {
          coverImageUrl = uploadedMedia[0].fileUrl;
        }
      }
      
      // Create the collection
      const collection = {
        name,
        description: description || undefined,
        coverImageUrl: coverImageUrl || undefined
      };
      
      await apiRequest('POST', '/api/collections', collection);
      
      toast({
        title: "Collection created",
        description: `Your collection "${name}" has been created successfully.`
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      handleClose();
    } catch (error) {
      toast({
        title: "Error creating collection",
        description: "There was an error creating your collection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setName('');
    setDescription('');
    setCoverImage(null);
    setCoverImagePreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[#5A4B53]">Create New Collection</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-[#5A4B53] mb-1">
              Collection Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Our Trip to Paris"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E36588]"
            />
          </div>
          
          <div>
            <Label htmlFor="cover-image" className="block text-sm font-medium text-[#5A4B53] mb-1">
              Cover Image
            </Label>
            <div 
              className="border-2 border-dashed border-[#F8C8DC] rounded-xl p-6 text-center cursor-pointer hover:bg-[#F8C8DC] hover:bg-opacity-10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverImagePreview ? (
                <div className="relative">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="mx-auto h-40 object-cover rounded-lg"
                  />
                  <p className="mt-2 text-xs text-gray-500">Click to change image</p>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-10 w-10 text-[#E36588] mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to select a cover image</p>
                </>
              )}
              
              <Input
                ref={fileInputRef}
                id="cover-image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-[#5A4B53] mb-1">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A special memory collection..."
              rows={2}
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
            disabled={!name.trim() || isSubmitting}
            className="bg-[#E36588] text-white hover:bg-[#D14D72]"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating..." : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionModal;
