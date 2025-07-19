// Transform PostgreSQL response data to frontend-expected format
// Converts snake_case to camelCase and handles field name differences

export const transformItem = (item) => {
  if (!item) return null;
  
  return {
    _id: item.id, // PostgreSQL uses 'id', frontend expects '_id'
    id: item.id,
    name: item.name,
    urgency: item.urgency,
    notes: item.notes,
    quantity: item.quantity,
    estimatedTimeToRunOut: item.estimated_time_to_run_out,
    category: item.category,
    photoUrl: item.photo_url,
    audioUrl: item.audio_url,
    transcription: item.transcription,
    status: item.status,
    dateAdded: item.date_added,
    dateRestocked: item.date_restocked,
    dateLastModified: item.date_last_modified,
    userId: item.user_id,
    aiExtracted: item.ai_extracted,
    aiConfidence: item.ai_confidence,
    tags: item.tags,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

export const transformItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(transformItem);
};

// Transform frontend data to PostgreSQL format (for API requests)
export const transformToDbFormat = (item) => {
  if (!item) return null;
  
  return {
    name: item.name,
    urgency: item.urgency,
    notes: item.notes,
    quantity: item.quantity,
    estimated_time_to_run_out: item.estimatedTimeToRunOut,
    category: item.category,
    photo_url: item.photoUrl,
    audio_url: item.audioUrl,
    transcription: item.transcription,
    status: item.status,
    user_id: item.userId,
    ai_extracted: item.aiExtracted,
    ai_confidence: item.aiConfidence,
    tags: item.tags,
  };
}; 