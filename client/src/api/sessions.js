import supabase from './supabase';

/**
 * @param {string} mentorId - mentor_profiles.id
 * @param {'career_advice'|'interview_prep'|'resume_review'|'networking'} sessionType
 * @param {string|null} scheduledDate - ISO date string or null
 * @param {string|null} message
 */
export async function createSession(mentorId, sessionType, scheduledDate, message) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }
  if (!user) {
    return { data: null, error: new Error('You must be signed in to book a session.') };
  }

  return supabase
    .from('sessions')
    .insert({
      mentee_id: user.id,
      mentor_id: mentorId,
      session_type: sessionType,
      scheduled_date: scheduledDate,
      message: message ?? null,
    })
    .select()
    .single();
}

/** @returns {Promise<{ data: object[]|null, error: Error|null }>} */
export async function getMySession() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }
  if (!user) {
    return { data: [], error: null };
  }

  const { data: profile } = await supabase
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const orParts = [`mentee_id.eq.${user.id}`];
  if (profile?.id) {
    orParts.push(`mentor_id.eq.${profile.id}`);
  }

  return supabase.from('sessions').select('*').or(orParts.join(',')).order('created_at', { ascending: false });
}

/**
 * @param {string} sessionId
 * @param {'pending'|'accepted'|'declined'|'completed'} status
 */
export async function updateSessionStatus(sessionId, status) {
  return supabase.from('sessions').update({ status }).eq('id', sessionId).select().single();
}
