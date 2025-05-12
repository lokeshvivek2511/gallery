import { 
  Collection, 
  type InsertCollection, 
  MediaItem, 
  type InsertMediaItem 
} from "@shared/schema";
import path from "path";
import fs from "fs";

// Storage interface
export interface IStorage {
  // Collections
  getAllCollections(): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection>;
  deleteCollection(id: number): Promise<void>;
  
  // Media Items
  getMediaByCollection(collectionId: number): Promise<MediaItem[]>;
  getMedia(id: number): Promise<MediaItem | undefined>;
  createMedia(media: InsertMediaItem): Promise<MediaItem>;
  updateMedia(id: number, media: Partial<InsertMediaItem>): Promise<MediaItem>;
  deleteMedia(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private collections: Map<number, Collection>;
  private mediaItems: Map<number, MediaItem>;
  private collectionIdCounter: number;
  private mediaIdCounter: number;

  constructor() {
    this.collections = new Map();
    this.mediaItems = new Map();
    this.collectionIdCounter = 1;
    this.mediaIdCounter = 1;
    
    // Create sample collections
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample collections
    const beachCollection = this.createCollection({
      name: "Beach Getaway",
      description: "Our magical weekend in the Maldives",
      coverImage: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
    });

    const anniversaryCollection = this.createCollection({
      name: "Anniversary Dinner",
      description: "Five years of love celebration",
      coverImage: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
    });

    const danceCollection = this.createCollection({
      name: "First Dance",
      description: "The night we couldn't stop dancing",
      coverImage: "https://images.unsplash.com/photo-1525318557657-5cc99530aa42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
    });

    // Add sample media items to collections
    const sampleMediaData = [
      {
        collectionId: beachCollection.id,
        filename: "Sunset kiss.jpg",
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        thumbnail: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        type: "image",
        isFavorite: false,
        description: "Sunset kiss"
      },
      {
        collectionId: beachCollection.id,
        filename: "Morning walk.jpg",
        url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        thumbnail: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        type: "image",
        isFavorite: true,
        description: "Morning walk"
      },
      {
        collectionId: beachCollection.id,
        filename: "Golden hour.jpg",
        url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        thumbnail: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        type: "image",
        isFavorite: false,
        description: "Golden hour"
      },
      {
        collectionId: anniversaryCollection.id,
        filename: "Romantic dinner.jpg",
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        thumbnail: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        type: "image",
        isFavorite: true,
        description: "Romantic dinner"
      }
    ];

    sampleMediaData.forEach(item => {
      this.createMedia(item as InsertMediaItem);
    });
  }

  // Collection methods
  async getAllCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.collectionIdCounter++;
    const now = new Date().toISOString();
    
    const collection: Collection = {
      id,
      ...insertCollection,
      itemCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.collections.set(id, collection);
    return collection;
  }

  async updateCollection(id: number, updateData: Partial<InsertCollection>): Promise<Collection> {
    const collection = this.collections.get(id);
    
    if (!collection) {
      throw new Error(`Collection with id ${id} not found`);
    }
    
    const updatedCollection = {
      ...collection,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.collections.set(id, updatedCollection);
    return updatedCollection;
  }

  async deleteCollection(id: number): Promise<void> {
    this.collections.delete(id);
  }

  // Media methods
  async getMediaByCollection(collectionId: number): Promise<MediaItem[]> {
    return Array.from(this.mediaItems.values())
      .filter(item => item.collectionId === collectionId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getMedia(id: number): Promise<MediaItem | undefined> {
    return this.mediaItems.get(id);
  }

  async createMedia(insertMedia: InsertMediaItem): Promise<MediaItem> {
    const id = this.mediaIdCounter++;
    const now = new Date().toISOString();
    
    const media: MediaItem = {
      id,
      ...insertMedia,
      createdAt: now,
      updatedAt: now
    };
    
    this.mediaItems.set(id, media);
    
    // Update the item count in the collection
    const collection = await this.getCollection(insertMedia.collectionId);
    if (collection) {
      await this.updateCollection(collection.id, {
        itemCount: (collection.itemCount || 0) + 1
      });
    }
    
    return media;
  }

  async updateMedia(id: number, updateData: Partial<InsertMediaItem>): Promise<MediaItem> {
    const media = this.mediaItems.get(id);
    
    if (!media) {
      throw new Error(`Media with id ${id} not found`);
    }
    
    const updatedMedia = {
      ...media,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.mediaItems.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: number): Promise<void> {
    const media = this.mediaItems.get(id);
    
    if (media) {
      // Update the item count in the collection
      const collection = await this.getCollection(media.collectionId);
      if (collection && collection.itemCount && collection.itemCount > 0) {
        await this.updateCollection(collection.id, {
          itemCount: collection.itemCount - 1
        });
      }
      
      this.mediaItems.delete(id);
    }
  }
}

export const storage = new MemStorage();
