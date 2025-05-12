import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from './use-toast';
import { Collection } from '@shared/schema';

interface CollectionWithCount extends Collection {
  mediaCount: number;
}

interface CollectionWithMedia extends Collection {
  media: any[];
}

interface CreateCollectionInput {
  name: string;
  description?: string;
  coverImageUrl?: string;
}

interface UseCollectionsReturn {
  collections: CollectionWithCount[] | undefined;
  collection: (id: number) => CollectionWithMedia | undefined;
  isLoading: boolean;
  isLoadingCollection: boolean;
  createCollection: (data: CreateCollectionInput) => Promise<void>;
  updateCollection: (id: number, data: Partial<CreateCollectionInput>) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
}

/**
 * Hook for collections operations
 */
export function useCollections(): UseCollectionsReturn {
  const { toast } = useToast();

  // Query for all collections
  const { data: collections, isLoading } = useQuery<CollectionWithCount[]>({
    queryKey: ['/api/collections'],
  });

  // Function to get a specific collection with its media
  const getCollection = (id: number) => {
    const { data, isLoading } = useQuery<CollectionWithMedia>({
      queryKey: ['/api/collections', id],
      enabled: !!id,
    });

    return {
      collection: data,
      isLoading
    };
  };

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateCollectionInput) => {
      await apiRequest('POST', '/api/collections', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: "Collection created",
        description: "Your collection has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Creation failed",
        description: "Failed to create the collection. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update collection mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<CreateCollectionInput> }) => {
      await apiRequest('PUT', `/api/collections/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/collections', variables.id] });
      toast({
        title: "Collection updated",
        description: "Your collection has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the collection. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete collection mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the collection. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Wrapper for collection data
  const collection = (id: number): CollectionWithMedia | undefined => {
    const { collection } = getCollection(id);
    return collection;
  };

  // Wrapper for collection loading state
  const isLoadingCollection = (id: number): boolean => {
    const { isLoading } = getCollection(id);
    return isLoading;
  };

  // Create collection handler
  const createCollection = async (data: CreateCollectionInput): Promise<void> => {
    await createMutation.mutateAsync(data);
  };

  // Update collection handler
  const updateCollection = async (id: number, data: Partial<CreateCollectionInput>): Promise<void> => {
    await updateMutation.mutateAsync({ id, data });
  };

  // Delete collection handler
  const deleteCollection = async (id: number): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    collections,
    collection,
    isLoading,
    isLoadingCollection: false, // This is a placeholder since we're returning a function above
    createCollection,
    updateCollection,
    deleteCollection
  };
}
