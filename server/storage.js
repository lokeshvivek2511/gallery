import Collection from './models/Collection.js';
import MediaItem from './models/MediaItem.js';

// Storage interface for MongoDB
class MongoStorage {
  // Collection methods
  async getAllCollections() {
    try {
      return await Collection.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all collections:', error);
      throw error;
    }
  }

  async getCollection(id) {
    try {
      return await Collection.findById(id);
    } catch (error) {
      console.error(`Error getting collection with id ${id}:`, error);
      return undefined;
    }
  }

  async createCollection(insertCollection) {
    try {
      const collection = new Collection({
        ...insertCollection,
        itemCount: 0
      });
      return await collection.save();
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  async updateCollection(id, updateData) {
    try {
      const collection = await Collection.findById(id);
      
      if (!collection) {
        throw new Error(`Collection with id ${id} not found`);
      }
      
      Object.keys(updateData).forEach(key => {
        collection[key] = updateData[key];
      });
      
      collection.updatedAt = new Date();
      return await collection.save();
    } catch (error) {
      console.error(`Error updating collection with id ${id}:`, error);
      throw error;
    }
  }

  async deleteCollection(id) {
    try {
      await Collection.findByIdAndDelete(id);
    } catch (error) {
      console.error(`Error deleting collection with id ${id}:`, error);
      throw error;
    }
  }

  // Media methods
  async getMediaByCollection(collectionId) {
    try {
      return await MediaItem.find({ collectionId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error(`Error getting media for collection ${collectionId}:`, error);
      throw error;
    }
  }

  async getMedia(id) {
    try {
      return await MediaItem.findById(id);
    } catch (error) {
      console.error(`Error getting media with id ${id}:`, error);
      return undefined;
    }
  }

  async createMedia(insertMedia) {
    try {
      const media = new MediaItem(insertMedia);
      const savedMedia = await media.save();
      
      // Update the item count in the collection
      const collection = await Collection.findById(insertMedia.collectionId);
      if (collection) {
        collection.itemCount = (collection.itemCount || 0) + 1;
        await collection.save();
      }
      
      return savedMedia;
    } catch (error) {
      console.error('Error creating media:', error);
      throw error;
    }
  }

  async updateMedia(id, updateData) {
    try {
      const media = await MediaItem.findById(id);
      
      if (!media) {
        throw new Error(`Media with id ${id} not found`);
      }
      
      Object.keys(updateData).forEach(key => {
        media[key] = updateData[key];
      });
      
      media.updatedAt = new Date();
      return await media.save();
    } catch (error) {
      console.error(`Error updating media with id ${id}:`, error);
      throw error;
    }
  }

  async deleteMedia(id) {
    try {
      const media = await MediaItem.findById(id);
      
      if (media) {
        // Update the item count in the collection
        const collection = await Collection.findById(media.collectionId);
        if (collection && collection.itemCount && collection.itemCount > 0) {
          collection.itemCount -= 1;
          await collection.save();
        }
        
        await MediaItem.findByIdAndDelete(id);
      }
    } catch (error) {
      console.error(`Error deleting media with id ${id}:`, error);
      throw error;
    }
  }

  // Initialize sample data for a fresh database
  async initializeSampleData() {
    try {
      const collectionsCount = await Collection.countDocuments();
      
      if (collectionsCount === 0) {
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
            collectionId: beachCollection._id,
            filename: "Sunset kiss.jpg",
            url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            thumbnail: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            type: "image",
            isFavorite: false,
            description: "Sunset kiss"
          },
          {
            collectionId: beachCollection._id,
            filename: "Morning walk.jpg",
            url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            thumbnail: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            type: "image",
            isFavorite: true,
            description: "Morning walk"
          },
          {
            collectionId: beachCollection._id,
            filename: "Golden hour.jpg",
            url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            thumbnail: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            type: "image",
            isFavorite: false,
            description: "Golden hour"
          },
          {
            collectionId: anniversaryCollection._id,
            filename: "Romantic dinner.jpg",
            url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            thumbnail: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
            type: "image",
            isFavorite: true,
            description: "Romantic dinner"
          }
        ];

        for (const item of sampleMediaData) {
          await this.createMedia(item);
        }
        
        console.log('Sample data initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
}

export const storage = new MongoStorage();