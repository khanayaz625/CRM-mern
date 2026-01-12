import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Routes
import authRoutes from "../routes/auth.js";
import leadRoutes from "../routes/leads.js";
import futureItemRoutes from "../routes/futureItems.js";

const app = express();

/* ---------- Middleware ---------- */
app.use(cors({
    origin: true,
    credentials: true
}));

// Handle preflight requests globally
app.options('*', cors());

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ---------- Root Test Route ---------- */
app.get("/", (req, res) => {
    res.send("CRM Backend is running");
});

/* ---------- One-Time Setup Route ---------- */
app.get("/setup-admin", async (req, res) => {
    try {
        const email = 'admin@crm.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ message: 'Admin user already exists', email });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const user = new User({
            name: 'Admin User',
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await user.save();
        res.json({ message: '✅ Admin user created successfully!', email, password: 'admin123' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ---------- Demo Setup Route ---------- */
app.get("/setup-demo", async (req, res) => {
    try {
        // 1. Create Demo Admin
        const demoAdminEmail = 'demoadmin@crm.com';
        const hashedPassword = await bcrypt.hash('demo123', 10);
        let demoAdmin = await User.findOneAndUpdate(
            { email: demoAdminEmail },
            { name: 'Demo Admin', password: hashedPassword, role: 'admin', isDemo: true },
            { upsert: true, new: true }
        );

        // 2. Create Demo Employee
        const demoEmployeeEmail = 'employeeadmin@crm.com';
        let demoEmployee = await User.findOneAndUpdate(
            { email: demoEmployeeEmail },
            { name: 'Demo Employee', password: hashedPassword, role: 'employee', isDemo: true },
            { upsert: true, new: true }
        );

        res.json({
            message: '✅ Demo accounts created/reset successfully!',
            admin: { email: demoAdminEmail, password: 'demo123' },
            employee: { email: demoEmployeeEmail, password: 'demo123' }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ---------- API Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/future", futureItemRoutes);

/* ---------- MongoDB Connection ---------- */
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

export default app;
