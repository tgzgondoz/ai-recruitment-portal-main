import { serve } from "std/server"
import { createClient } from "supabase"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { applicationId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch detailed data for context
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        candidate_id,
        job_listings (title, description, required_skills),
        candidate_documents (file_url)
      `)
      .eq('id', applicationId)
      .single()

    if (fetchError || !app) throw new Error("Context retrieval failed")

    // 2. Fetch the Resume Text from Storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('candidate-documents')
      .download(app.candidate_documents.file_url)

    if (downloadError) throw downloadError
    const resumeText = await fileBlob.text() // Basic text extraction

    // 3. AI Analysis (Replacing Math.random)
    // Here you would fetch from Google Gemini, OpenAI, or Anthropic
    // We send the Job Description + Resume to the AI
    const aiAnalysis = await performAIScore(resumeText, app.job_listings)

    // 4. Update Application & Profile
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        ats_score: aiAnalysis.score,
        is_high_scoring: aiAnalysis.score >= 85,
        internal_notes: aiAnalysis.reasoning 
      })
      .eq('id', applicationId)

    const { error: profError } = await supabase
      .from('candidate_profiles')
      .update({ 
        detected_skills: aiAnalysis.skills,
        summary_bio: aiAnalysis.summary 
      })
      .eq('id', app.candidate_id)

    if (updateError || profError) throw new Error("Database sync failed")

    return new Response(JSON.stringify(aiAnalysis), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 400 
    })
  }
})

// Helper logic for AI Prompts
async function performAIScore(resume, job) {
  // In a real scenario, call fetch("https://api.openai.com/v1/chat/completions", ...)
  // For now, this represents the logic the AI would return:
  return {
    score: 88,
    skills: ["React", "PostgreSQL", "System Architecture"],
    summary: "Expert full-stack developer with specific experience in database scaling.",
    reasoning: "Candidate meets 90% of requirements but lacks specified Tailwind experience."
  }
}