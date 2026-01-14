import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    title: string;
    description: string;
    date: Date;
    status: "active" | "inactive";
}

const postSchema = new Schema<IPost>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
});

export default mongoose.model<IPost>("Post", postSchema);
