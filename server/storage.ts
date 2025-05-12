import { collections, media, type User, type InsertUser, type Collection, type InsertCollection, type Media, type InsertMedia } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Collection methods
  getAllCollections(): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: number): Promise<boolean>;
  
  // Media methods
  getAllMedia(): Promise<Media[]>;
  getMediaById(id: number): Promise<Media | undefined>;
  getMediaByCollection(collectionId: number): Promise<Media[]>;
  getFavoriteMedia(): Promise<Media[]>;
  getRecentMedia(limit?: number): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: number, media: Partial<InsertMedia>): Promise<Media | undefined>;
  toggleFavorite(id: number): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private collectionsMap: Map<number, Collection>;
  private mediaMap: Map<number, Media>;
  userCurrentId: number;
  collectionCurrentId: number;
  mediaCurrentId: number;

  constructor() {
    this.users = new Map();
    this.collectionsMap = new Map();
    this.mediaMap = new Map();
    this.userCurrentId = 1;
    this.collectionCurrentId = 1;
    this.mediaCurrentId = 1;
    
    // Create default user
    this.createUser({
      username: "couple",
      password: "lokiroja"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Collection methods
  async getAllCollections(): Promise<Collection[]> {
    return Array.from(this.collectionsMap.values());
  }
  
  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collectionsMap.get(id);
  }
  
  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.collectionCurrentId++;
    const createdAt = new Date();
    const collection: Collection = { ...insertCollection, id, createdAt };
    this.collectionsMap.set(id, collection);
    return collection;
  }
  
  async updateCollection(id: number, collectionData: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = this.collectionsMap.get(id);
    
    if (!collection) {
      return undefined;
    }
    
    const updatedCollection: Collection = {
      ...collection,
      ...collectionData
    };
    
    this.collectionsMap.set(id, updatedCollection);
    return updatedCollection;
  }
  
  async deleteCollection(id: number): Promise<boolean> {
    const deleted = this.collectionsMap.delete(id);
    
    // Also remove collection ID from any media that belonged to this collection
    const mediaInCollection = Array.from(this.mediaMap.values())
      .filter(media => media.collectionId === id);
      
    for (const item of mediaInCollection) {
      const updatedItem = { ...item, collectionId: null };
      this.mediaMap.set(item.id, updatedItem);
    }
    
    return deleted;
  }
  
  // Media methods
  async getAllMedia(): Promise<Media[]> {
    return Array.from(this.mediaMap.values());
  }
  
  async getMediaById(id: number): Promise<Media | undefined> {
    return this.mediaMap.get(id);
  }
  
  async getMediaByCollection(collectionId: number): Promise<Media[]> {
    return Array.from(this.mediaMap.values())
      .filter(media => media.collectionId === collectionId);
  }
  
  async getFavoriteMedia(): Promise<Media[]> {
    return Array.from(this.mediaMap.values())
      .filter(media => media.isFavorite);
  }
  
  async getRecentMedia(limit: number = 20): Promise<Media[]> {
    return Array.from(this.mediaMap.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }
  
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.mediaCurrentId++;
    const createdAt = new Date();
    const mediaItem: Media = { ...insertMedia, id, createdAt };
    this.mediaMap.set(id, mediaItem);
    return mediaItem;
  }
  
  async updateMedia(id: number, mediaData: Partial<InsertMedia>): Promise<Media | undefined> {
    const mediaItem = this.mediaMap.get(id);
    
    if (!mediaItem) {
      return undefined;
    }
    
    const updatedItem: Media = {
      ...mediaItem,
      ...mediaData
    };
    
    this.mediaMap.set(id, updatedItem);
    return updatedItem;
  }
  
  async toggleFavorite(id: number): Promise<Media | undefined> {
    const mediaItem = this.mediaMap.get(id);
    
    if (!mediaItem) {
      return undefined;
    }
    
    const updatedItem: Media = {
      ...mediaItem,
      isFavorite: !mediaItem.isFavorite
    };
    
    this.mediaMap.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    return this.mediaMap.delete(id);
  }
}

export const storage = new MemStorage();
