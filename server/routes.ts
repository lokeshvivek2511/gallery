import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertCollectionSchema, insertMediaSchema } from "@shared/schema";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images and videos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // All routes are prefixed with /api

  // Verify password
  app.post('/api/auth/verify', (req, res) => {
    const { password } = req.body;
    
    if (password === 'lokiroja') {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });
  
  // Collections CRUD
  
  // Get all collections
  app.get('/api/collections', async (req, res, next) => {
    try {
      const collections = await storage.getAllCollections();
      res.json(collections);
    } catch (error) {
      next(error);
    }
  });
  
  // Get collection by ID
  app.get('/api/collections/:id', async (req, res, next) => {
    try {
      const collection = await storage.getCollection(parseInt(req.params.id));
      
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      
      res.json(collection);
    } catch (error) {
      next(error);
    }
  });
  
  // Create collection
  app.post('/api/collections', async (req, res, next) => {
    try {
      const result = insertCollectionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid collection data', errors: result.error.errors });
      }
      
      const collection = await storage.createCollection(result.data);
      res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  });
  
  // Update collection
  app.patch('/api/collections/:id', async (req, res, next) => {
    try {
      const collectionId = parseInt(req.params.id);
      const existingCollection = await storage.getCollection(collectionId);
      
      if (!existingCollection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      
      // Partial update validation
      const updateSchema = insertCollectionSchema.partial();
      const result = updateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid collection data', errors: result.error.errors });
      }
      
      const updatedCollection = await storage.updateCollection(collectionId, result.data);
      res.json(updatedCollection);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete collection
  app.delete('/api/collections/:id', async (req, res, next) => {
    try {
      const collectionId = parseInt(req.params.id);
      const existingCollection = await storage.getCollection(collectionId);
      
      if (!existingCollection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      
      // Delete all media items in the collection first
      const mediaItems = await storage.getMediaByCollection(collectionId);
      for (const item of mediaItems) {
        // Delete the actual file
        if (item.filepath) {
          try {
            fs.unlinkSync(item.filepath);
          } catch (error) {
            console.error(`Failed to delete file: ${item.filepath}`, error);
          }
        }
        
        // Delete from storage
        await storage.deleteMedia(item.id);
      }
      
      await storage.deleteCollection(collectionId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Media CRUD
  
  // Get all media items in a collection
  app.get('/api/collections/:id/media', async (req, res, next) => {
    try {
      const collectionId = parseInt(req.params.id);
      const mediaItems = await storage.getMediaByCollection(collectionId);
      res.json(mediaItems);
    } catch (error) {
      next(error);
    }
  });
  
  // Upload media to a collection
  app.post('/api/collections/:id/upload', upload.array('files', 10), async (req, res, next) => {
    try {
      const collectionId = parseInt(req.params.id);
      const existingCollection = await storage.getCollection(collectionId);
      
      if (!existingCollection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      
      const uploadedFiles = [];
      for (const file of files) {
        const isVideo = file.mimetype.startsWith('video/');
        const mediaData = {
          collectionId,
          filename: path.basename(file.originalname),
          filepath: file.path,
          url: `/uploads/${path.basename(file.path)}`,
          thumbnail: isVideo ? null : `/uploads/${path.basename(file.path)}`,
          type: isVideo ? 'video' : 'image',
          isFavorite: false
        };
        
        const media = await storage.createMedia(mediaData);
        uploadedFiles.push(media);
      }
      
      res.status(201).json(uploadedFiles);
    } catch (error) {
      next(error);
    }
  });
  
  // Toggle favorite status
  app.patch('/api/media/:id/favorite', async (req, res, next) => {
    try {
      const mediaId = parseInt(req.params.id);
      const media = await storage.getMedia(mediaId);
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      const { isFavorite } = req.body;
      if (typeof isFavorite !== 'boolean') {
        return res.status(400).json({ message: 'isFavorite field must be a boolean' });
      }
      
      const updatedMedia = await storage.updateMedia(mediaId, { isFavorite });
      res.json(updatedMedia);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete media
  app.delete('/api/media/:id', async (req, res, next) => {
    try {
      const mediaId = parseInt(req.params.id);
      const media = await storage.getMedia(mediaId);
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      // Delete the actual file
      if (media.filepath) {
        try {
          fs.unlinkSync(media.filepath);
        } catch (error) {
          console.error(`Failed to delete file: ${media.filepath}`, error);
        }
      }
      
      await storage.deleteMedia(mediaId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Serve the uploads directory statically
  app.use('/uploads', (req, res, next) => {
    // Simple auth check (in a real app, this would be more robust)
    next();
  }, (req, res, next) => {
    const options = {
      root: uploadDir,
      dotfiles: 'deny',
      headers: {
        'Cache-Control': 'max-age=31536000'
      }
    };
    
    const fileName = req.path.slice(1); // Remove the leading /
    res.sendFile(fileName, options, (err) => {
      if (err) {
        next(err);
      }
    });
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
