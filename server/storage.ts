import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type BlogPost, type InsertBlogPost, type CartItem } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcrypt";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Products
  getProducts(filters?: { category?: string; search?: string; page?: number; limit?: number; sort?: string; minPrice?: number; maxPrice?: number; brands?: string[] }): Promise<{ products: Product[]; total: number }>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Orders
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Cart
  getCart(userId: string): Promise<CartItem[]>;
  addToCart(userId: string, item: CartItem): Promise<void>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<void>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Blog
  getBlogPosts(page?: number, limit?: number, search?: string): Promise<{ posts: BlogPost[]; total: number }>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
}

export class FileStorage implements IStorage {
  private dataDir = path.join(process.cwd(), 'data');
  private cart: Map<string, CartItem[]> = new Map();

  constructor() {
    this.ensureDataDir();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private async readJsonFile<T>(filename: string, defaultValue: T[]): Promise<T[]> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data, (key, value) => {
        // Parse dates
        if (key.endsWith('At') && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      return defaultValue;
    }
  }

  private async writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const users = await this.readJsonFile<User>('users.json', []);
    return users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.readJsonFile<User>('users.json', []);
    return users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await this.readJsonFile<User>('users.json', []);
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    users.push(user);
    await this.writeJsonFile('users.json', users);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const users = await this.readJsonFile<User>('users.json', []);
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return undefined;
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    users[index] = {
      ...users[index],
      ...updateData,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('users.json', users);
    return users[index];
  }

  // Products
  async getProducts(filters?: { category?: string; search?: string; page?: number; limit?: number; sort?: string; minPrice?: number; maxPrice?: number; brands?: string[] }): Promise<{ products: Product[]; total: number }> {
    const products = await this.readJsonFile<Product>('products.json', []);
    let filteredProducts = products;

    // Filter by category
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // Filter by search term
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by price range
    if (filters?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    // Filter by brands
    if (filters?.brands && filters.brands.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        filters.brands!.some(brand => p.brand?.toLowerCase() === brand.toLowerCase())
      );
    }

    // Sort products
    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name':
        default:
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    const total = filteredProducts.length;
    
    // Apply pagination
    if (filters?.page && filters?.limit) {
      const start = (filters.page - 1) * filters.limit;
      filteredProducts = filteredProducts.slice(start, start + filters.limit);
    }

    return { products: filteredProducts, total };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.readJsonFile<Product>('products.json', []);
    return products.find(product => product.id === id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const products = await this.readJsonFile<Product>('products.json', []);
    
    const product: Product = {
      ...insertProduct,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    products.push(product);
    await this.writeJsonFile('products.json', products);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = await this.readJsonFile<Product>('products.json', []);
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) return undefined;
    
    products[index] = {
      ...products[index],
      ...updateData,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('products.json', products);
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.readJsonFile<Product>('products.json', []);
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) return false;
    
    products.splice(index, 1);
    await this.writeJsonFile('products.json', products);
    return true;
  }

  // Orders
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const orders = await this.readJsonFile<Order>('orders.json', []);
    return orders.filter(order => order.userId === userId);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const orders = await this.readJsonFile<Order>('orders.json', []);
    return orders.find(order => order.id === id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orders = await this.readJsonFile<Order>('orders.json', []);
    
    const order: Order = {
      ...insertOrder,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    orders.push(order);
    await this.writeJsonFile('orders.json', orders);
    return order;
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const orders = await this.readJsonFile<Order>('orders.json', []);
    const index = orders.findIndex(order => order.id === id);
    
    if (index === -1) return undefined;
    
    orders[index] = {
      ...orders[index],
      ...updateData,
      updatedAt: new Date(),
    };
    
    await this.writeJsonFile('orders.json', orders);
    return orders[index];
  }

  // Cart (in-memory with session persistence)
  async getCart(userId: string): Promise<CartItem[]> {
    return this.cart.get(userId) || [];
  }

  async addToCart(userId: string, item: CartItem): Promise<void> {
    const userCart = this.cart.get(userId) || [];
    const existingIndex = userCart.findIndex(cartItem => cartItem.productId === item.productId);
    
    if (existingIndex >= 0) {
      userCart[existingIndex].quantity += item.quantity;
    } else {
      userCart.push(item);
    }
    
    this.cart.set(userId, userCart);
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<void> {
    const userCart = this.cart.get(userId) || [];
    const index = userCart.findIndex(item => item.productId === productId);
    
    if (index >= 0) {
      if (quantity <= 0) {
        userCart.splice(index, 1);
      } else {
        userCart[index].quantity = quantity;
      }
      this.cart.set(userId, userCart);
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    const userCart = this.cart.get(userId) || [];
    const filteredCart = userCart.filter(item => item.productId !== productId);
    this.cart.set(userId, filteredCart);
  }

  async clearCart(userId: string): Promise<void> {
    this.cart.delete(userId);
  }

  // Blog
  async getBlogPosts(page?: number, limit?: number, search?: string): Promise<{ posts: BlogPost[]; total: number }> {
    const posts = await this.readJsonFile<BlogPost>('blog.json', []);
    let filteredPosts = posts;
    
    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredPosts = filteredPosts.filter(p => 
        p.title.toLowerCase().includes(searchTerm) || 
        p.content.toLowerCase().includes(searchTerm) ||
        p.excerpt?.toLowerCase().includes(searchTerm)
      );
    }
    
    const total = filteredPosts.length;
    
    // Apply pagination
    if (page && limit) {
      const start = (page - 1) * limit;
      filteredPosts = filteredPosts.slice(start, start + limit);
    }
    
    return { posts: filteredPosts, total };
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const posts = await this.readJsonFile<BlogPost>('blog.json', []);
    return posts.find(post => post.id === id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const posts = await this.readJsonFile<BlogPost>('blog.json', []);
    
    const post: BlogPost = {
      ...insertPost,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    posts.push(post);
    await this.writeJsonFile('blog.json', posts);
    return post;
  }
}

export const storage = new FileStorage();
