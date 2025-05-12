import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { insertCollectionSchema, insertMediaSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage: mediaStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  } 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    
    const user = await storage.getUserByUsername("couple");
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
    
    return res.status(200).json({ message: "Login successful" });
  });
  
  // Collection routes
  app.get("/api/collections", async (req: Request, res: Response) => {
    try {
      const collections = await storage.getAllCollections();
      
      // Get media count for each collection
      const collectionsWithCount = await Promise.all(collections.map(async (collection) => {
        const mediaItems = await storage.getMediaByCollection(collection.id);
        return {
          ...collection,
          mediaCount: mediaItems.length
        };
      }));
      
      res.status(200).json(collectionsWithCount);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });
  
  app.get("/api/collections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      const mediaItems = await storage.getMediaByCollection(id);
      
      res.status(200).json({
        ...collection,
        media: mediaItems
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });
  
  app.post("/api/collections", async (req: Request, res: Response) => {
    try {
      const validationResult = insertCollectionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const collection = await storage.createCollection(validationResult.data);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to create collection" });
    }
  });
  
  app.put("/api/collections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      const validationResult = insertCollectionSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedCollection = await storage.updateCollection(id, validationResult.data);
      res.status(200).json(updatedCollection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update collection" });
    }
  });
  
  app.delete("/api/collections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      await storage.deleteCollection(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });
  
  // Media routes
  app.get("/api/media", async (req: Request, res: Response) => {
    try {
      const mediaItems = await storage.getAllMedia();
      res.status(200).json(mediaItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });
  
  app.get("/api/media/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const mediaItems = await storage.getRecentMedia(limit);
      res.status(200).json(mediaItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent media" });
    }
  });
  
  app.get("/api/media/favorites", async (req: Request, res: Response) => {
    try {
      const mediaItems = await storage.getFavoriteMedia();
      res.status(200).json(mediaItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorite media" });
    }
  });
  
  app.post("/api/media/upload", upload.array("files", 10), async (req: Request, res: Response) => {
    try {
      const uploadedFiles = req.files as Express.Multer.File[];
      const { note, collectionId } = req.body;
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const createdMedia = [];
      
      for (const file of uploadedFiles) {
        const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
        const fileUrl = `/uploads/${file.filename}`;
        
        const mediaData = {
          fileName: file.originalname,
          fileType,
          fileUrl,
          note: note || null,
          isFavorite: false,
          collectionId: collectionId ? parseInt(collectionId) : null
        };
        
        const validationResult = insertMediaSchema.safeParse(mediaData);
        
        if (!validationResult.success) {
          // Clean up the uploaded file
          fs.unlinkSync(file.path);
          continue;
        }
        
        const media = await storage.createMedia(validationResult.data);
        createdMedia.push(media);
      }
      
      res.status(201).json(createdMedia);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload media" });
    }
  });
  
  app.put("/api/media/:id/favorite", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      const updatedMedia = await storage.toggleFavorite(id);
      res.status(200).json(updatedMedia);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });
  
  app.put("/api/media/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      const validationResult = insertMediaSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedMedia = await storage.updateMedia(id, validationResult.data);
      res.status(200).json(updatedMedia);
    } catch (error) {
      res.status(500).json({ message: "Failed to update media" });
    }
  });
  
  app.delete("/api/media/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      // Delete file from disk
      if (media.fileUrl) {
        const filePath = path.join(__dirname, "..", "public", media.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteMedia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media" });
    }
  });
  
  // Serve static files from uploads directory
  app.use("/uploads", express.static(uploadsDir));
  
  const httpServer = createServer(app);
  return httpServer;
}
