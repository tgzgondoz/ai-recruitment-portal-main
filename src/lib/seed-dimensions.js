import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const dimensionsKnowledge = [
  "Dimensions Management Consultancy Overview: We help businesses attract top talent, develop high-performing teams, and stay compliant. We deliver measurable results through recruitment, training, and HR consulting.",
  "Our Mission: To transform your ideas into a powerful online presence that drives results.",
  "Design & Branding: We work with ex-founders and world-class design leaders to create unconventional brands and digital products of the future.",
  "Facilitation Center: Interactive workshops and expert-led sessions to enhance collaboration, problem-solving, and team dynamics.",
  "Leadership Development Centre: Tailored leadership programs for emerging and senior leaders to transform potential into excellence.",
  "OD & Trust Building Centre: Strengthening organizational culture and trust through data-driven strategies and team alignment initiatives.",
  "Telecoms Training Centre: Specialized technical and soft-skills training for the telecoms industry, keeping teams ahead of trends.",
  "Talent Sourcing: Strategic recruitment solutions to identify, attract, and secure top-tier talent for your organization.",
  "CMI (UK) Certified Courses: Globally recognized management qualifications to elevate professional credibility and competence.",
  "Address: 5th Floor, Runhare House, Corner 4th Street And Kwame Nkrumah Avenue, Harare, Zimbabwe. Phone: +263 242 721 987"
];

export const seedDimensionsData = async () => {
  try {
    console.log("🚀 Starting Optimized Batch Seeding...");
    
    // 1. Initialize the Embedding Model
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // 2. Batch generate embeddings
    const batchRequests = dimensionsKnowledge.map((text) => ({
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT",
    }));

    const result = await model.batchEmbedContents({
      requests: batchRequests,
    });

    // 3. Prepare data for 'dimensions_knowledge' table
    const rowsToInsert = dimensionsKnowledge.map((text, index) => ({
      content: text,
      embedding: result.embeddings[index].values,
      metadata: { 
        source: "official_docs_2026",
        category: text.includes(":") ? text.split(":")[0] : "General"
      }
    }));

    // 4. Batch Upsert to the CORRECT table name
    console.log("📡 Sending data to Supabase...");
    const { error } = await supabase
      .from('dimensions_knowledge') // Updated from 'notifications'
      .upsert(rowsToInsert, { onConflict: 'content' }); 

    if (error) throw error;

    console.log("✅ Successfully seeded 'dimensions_knowledge' table.");
    alert("✅ Dimensions Data Seeded Successfully!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    alert(`Seeding failed: ${error.message}`);
  }
};