import supabase from './supabase';

function escapeIlike(value) {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/** PostgREST `or()` splits on commas; quote values that may contain them. */
function quotedIlikePattern(rawSearch) {
  const pattern = `%${escapeIlike(rawSearch)}%`;
  return `"${pattern.replace(/"/g, '""')}"`;
}

function normalizeMentor(row) {
  if (!row) return row;
  let expertise = row.expertise;
  if (typeof expertise === 'string') {
    try {
      expertise = JSON.parse(expertise);
    } catch {
      expertise = [];
    }
  }
  if (!Array.isArray(expertise)) expertise = [];

  const { expertise_search: _ignored, ...rest } = row;

  return {
    ...rest,
    expertise,
    rating: row.rating != null ? Number(row.rating) : 0,
    years_experience: row.years_experience != null ? Number(row.years_experience) : 0,
    total_sessions: row.total_sessions != null ? Number(row.total_sessions) : 0,
  };
}

/**
 * @param {{ search?: string, industry?: string }} filters
 */
export async function getAllMentors(filters = {}) {
  const industry = (filters.industry ?? '').trim();
  const search = (filters.search ?? '').trim();

  let query = supabase.from('mentor_profiles').select('*');

  if (industry) {
    query = query.eq('industry', industry);
  }

  if (search) {
    const p = quotedIlikePattern(search);
    query = query.or(
      `name.ilike.${p},company.ilike.${p},title.ilike.${p},bio.ilike.${p},expertise_search.ilike.${p}`,
    );
  }

  const { data, error } = await query.order('rating', { ascending: false });

  if (error) {
    return { data: null, error };
  }

  return { data: data.map(normalizeMentor), error: null };
}

export async function getMentorById(id) {
  const { data, error } = await supabase.from('mentor_profiles').select('*').eq('id', id).maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data: data ? normalizeMentor(data) : null, error: null };
}

export async function getFeaturedMentors() {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .select('*')
    .order('rating', { ascending: false })
    .limit(3);

  if (error) {
    return { data: null, error };
  }

  return { data: data.map(normalizeMentor), error: null };
}
