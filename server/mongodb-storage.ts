import { 
  Collection, 
  InsertCollection, 
  MediaItem, 
  InsertMediaItem 
} from "@shared/schema";
import mongoose from "mongoose";
import { IStorage } from "./storage";
import dotenv from "dotenv";

dotenv.config();

// Define MongoDB schema for Collection
const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String
  },
  itemCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Define MongoDB schema for MediaItem
const MediaItemSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  filepath: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create MongoDB models
const CollectionModel = mongoose.model('Collection', CollectionSchema);
const MediaItemModel = mongoose.model('MediaItem', MediaItemSchema);

export class MongoStorage implements IStorage {
  constructor() {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://lokeshvlw2004:Lokesh%4025@cluster0.fdepz.mongodb.net/galleries")
        .then(() => {
          console.log('MongoDB Connected');
          this.initializeSampleData();
        })
        .catch(err => {
          console.error('MongoDB connection error:', err);
        });
    } else {
      this.initializeSampleData();
    }
  }

  private async initializeSampleData() {
    try {
      // Check if collections exist
      const count = await CollectionModel.countDocuments();
      
      if (count === 0) {
        console.log('Initializing sample data...');
        
        // Sample collections
        const beachCollection = await this.createCollection({
          name: "Beach Getaway",
          description: "Our magical weekend in the Maldives",
          coverImage: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        });

        const anniversaryCollection = await this.createCollection({
          name: "Anniversary Dinner",
          description: "Five years of love celebration",
          coverImage: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        });

        const danceCollection = await this.createCollection({
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

        for (const item of sampleMediaData) {
          await this.createMedia(item as InsertMediaItem);
        }
        
        console.log('Sample data initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // Collection methods
  async getAllCollections(): Promise<Collection[]> {
    try {
      const collections = await CollectionModel.find().sort({ createdAt: -1 });
      return collections.map(doc => this.documentToCollection(doc));
    } catch (error) {
      console.error('Error getting collections:', error);
      return [];
    }
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    try {
      // Use a query by numeric ID instead of MongoDB ObjectId
      const collection = await CollectionModel.findOne({ _id: id.toString() });
      return collection ? this.documentToCollection(collection) : undefined;
    } catch (error) {
      console.error(`Error getting collection ${id}:`, error);
      return undefined;
    }
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    try {
      const newCollection = new CollectionModel({
        ...insertCollection,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const saved = await newCollection.save();
      return this.documentToCollection(saved);
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  async updateCollection(id: number, updateData: Partial<InsertCollection>): Promise<Collection> {
    try {
      const updated = await CollectionModel.findOneAndUpdate(
        { _id: id.toString() },
        {
          ...updateData,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updated) {
        throw new Error(`Collection with id ${id} not found`);
      }
      
      return this.documentToCollection(updated);
    } catch (error) {
      console.error(`Error updating collection ${id}:`, error);
      throw error;
    }
  }

  async deleteCollection(id: number): Promise<void> {
    try {
      await CollectionModel.findOneAndDelete({ _id: id.toString() });
      // Also delete all media items in the collection
      await MediaItemModel.deleteMany({ collectionId: id.toString() });
    } catch (error) {
      console.error(`Error deleting collection ${id}:`, error);
      throw error;
    }
  }

  // Media methods
  async getMediaByCollection(collectionId: number): Promise<MediaItem[]> {
    try {
      // Use string ID instead of ObjectId
      const mediaItems = await MediaItemModel.find({ collectionId: collectionId.toString() }).sort({ createdAt: -1 });
      return mediaItems.map(doc => this.documentToMediaItem(doc));
    } catch (error) {
      console.error(`Error getting media for collection ${collectionId}:`, error);
      return [];
    }
  }

  async getMedia(id: number): Promise<MediaItem | undefined> {
    try {
      const mediaItem = await MediaItemModel.findOne({ _id: id.toString() });
      return mediaItem ? this.documentToMediaItem(mediaItem) : undefined;
    } catch (error) {
      console.error(`Error getting media ${id}:`, error);
      return undefined;
    }
  }

  async createMedia(insertMedia: InsertMediaItem): Promise<MediaItem> {
    try {
      // Make a copy and convert collectionId to string
      const mediaData: any = { 
        ...insertMedia,
        collectionId: insertMedia.collectionId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const newMedia = new MediaItemModel(mediaData);
      const saved = await newMedia.save();
      
      // Update the item count in the collection
      await CollectionModel.findOneAndUpdate(
        { _id: insertMedia.collectionId.toString() },
        { $inc: { itemCount: 1 }, updatedAt: new Date() }
      );
      
      return this.documentToMediaItem(saved);
    } catch (error) {
      console.error('Error creating media:', error);
      throw error;
    }
  }

  async updateMedia(id: number, updateData: Partial<InsertMediaItem>): Promise<MediaItem> {
    try {
      // Convert any collectionId to string if it exists in updateData
      const processedUpdateData: any = { ...updateData };
      if (processedUpdateData.collectionId) {
        processedUpdateData.collectionId = processedUpdateData.collectionId.toString();
      }
      
      const updated = await MediaItemModel.findOneAndUpdate(
        { _id: id.toString() },
        {
          ...processedUpdateData,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updated) {
        throw new Error(`Media with id ${id} not found`);
      }
      
      return this.documentToMediaItem(updated);
    } catch (error) {
      console.error(`Error updating media ${id}:`, error);
      throw error;
    }
  }

  async deleteMedia(id: number): Promise<void> {
    try {
      const media = await MediaItemModel.findOne({ _id: id.toString() });
      
      if (media) {
        // Update the item count in the collection
        await CollectionModel.findOneAndUpdate(
          { _id: media.collectionId.toString() },
          { $inc: { itemCount: -1 }, updatedAt: new Date() }
        );
        
        await MediaItemModel.findOneAndDelete({ _id: id.toString() });
      }
    } catch (error) {
      console.error(`Error deleting media ${id}:`, error);
      throw error;
    }
  }

  // Helper methods to convert MongoDB documents to our schema types
  private documentToCollection(doc: any): Collection {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      coverImage: doc.coverImage,
      itemCount: doc.itemCount,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }

  private documentToMediaItem(doc: any): MediaItem {
    return {
      id: doc._id.toString(),
      collectionId: doc.collectionId.toString(),
      filename: doc.filename,
      filepath: doc.filepath,
      url: doc.url,
      thumbnail: doc.thumbnail,
      type: doc.type,
      isFavorite: doc.isFavorite,
      description: doc.description,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };
  }
}