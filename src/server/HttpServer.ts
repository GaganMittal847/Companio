import express, { Express, Request, Response } from "express";
import http from "http";
import cors from 'cors';
import connectToDatabase from "../config/db";
import { ExternalController } from "../controllers/ExternalController";
import { CategoryController } from "../controllers/categoryController";
import { SubCategoryController } from "../controllers/subCategoryController";
import { SellerController } from "../controllers/sellerController";
import { RequestController } from "../controllers/requestController";
import { ChatController } from "../controllers/ChatController";


export class HttpServer {
  private app: Express;
  private port: number;
  private server: http.Server;

  constructor(port: number) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.configureMiddleware();
    this.configureRoutes();
    this.connectToDatabase();
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await connectToDatabase();
      console.log("Database connected successfully.");
    } catch (error) {
      console.error("Failed to connect to the database:", error);
    }
  }

  // Middleware configuration
  private configureMiddleware(): void {
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "*"],
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Serve static files from a public directory
   // this.app.use(express.static(path.join(__dirname, "../public")));
  }

  // Route configuration
  private configureRoutes(): void {
    const externalController = new ExternalController();
    this.app.use("/companio/external", externalController.router);
    this.app.use("/api/categories", new CategoryController().router);
    this.app.use("/api/subCategories", new SubCategoryController().router);
    this.app.use("/booking", new RequestController().router);
    this.app.use("/api/seller", new SellerController().router);
    this.app.use("/api/chat", new ChatController().router);
    this.app.get("/cms/health", (req: Request, res: Response) => {
      res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        port: this.port,
      });
    });
  }

  // Start the HTTP server
  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}
