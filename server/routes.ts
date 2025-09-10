import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertOrderSchema, cartItemSchema, insertProductSchema } from "@shared/schema";
import bcrypt from "bcrypt";

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { 
        category, 
        search, 
        page = '1', 
        limit = '12',
        sort,
        minPrice,
        maxPrice,
        brands
      } = req.query;
      
      const filters = {
        category: category as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: sort as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        brands: brands ? (brands as string).split(',') : undefined,
      };
      
      const result = await storage.getProducts(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin product routes (basic implementation)
  app.post('/api/admin/products', requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/admin/products/:id', requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/admin/products/:id', requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cart routes
  app.get('/api/cart', requireAuth, async (req, res) => {
    try {
      const cartItems = await storage.getCart(req.session.userId!);
      
      // Get product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/cart', requireAuth, async (req, res) => {
    try {
      const cartItem = cartItemSchema.parse(req.body);
      await storage.addToCart(req.session.userId!, cartItem);
      res.json({ message: 'Item added to cart' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/cart/:productId', requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      await storage.updateCartItem(req.session.userId!, req.params.productId, quantity);
      res.json({ message: 'Cart updated' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/cart/:productId', requireAuth, async (req, res) => {
    try {
      await storage.removeFromCart(req.session.userId!, req.params.productId);
      res.json({ message: 'Item removed from cart' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Checkout route
  app.post('/api/checkout', requireAuth, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Validate cart has items
      const cartItems = await storage.getCart(req.session.userId!);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      // Create order
      const order = await storage.createOrder({
        ...orderData,
        userId: req.session.userId!,
      });
      
      // Clear cart after successful order
      await storage.clearCart(req.session.userId!);
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Order routes
  app.get('/api/orders', requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrdersByUserId(req.session.userId!);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/orders/:id', requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order || order.userId !== req.session.userId!) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Blog routes
  app.get('/api/blog', async (req, res) => {
    try {
      const { page = '1', limit = '10', search } = req.query;
      const result = await storage.getBlogPosts(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/blog/:id', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
