const { sql } = require('../config/database');

class ItemService {
  // Get all items with filtering options
  static async getItems({ status, urgency, search, page = 1, limit = 50, userId = null }) {
    try {
      const offset = (page - 1) * limit;

      // Base query
      let query = sql`SELECT * FROM items WHERE 1=1`;
      let countQuery = sql`SELECT COUNT(*) as total FROM items WHERE 1=1`;

      // Add filters
      if (status) {
        query = sql`${query} AND status = ${status}`;
        countQuery = sql`${countQuery} AND status = ${status}`;
      }
      if (urgency) {
        query = sql`${query} AND urgency = ${urgency}`;
        countQuery = sql`${countQuery} AND urgency = ${urgency}`;
      }
      if (userId) {
        query = sql`${query} AND user_id = ${userId}`;
        countQuery = sql`${countQuery} AND user_id = ${userId}`;
      }
      if (search) {
        const searchPattern = `%${search}%`;
        query = sql`${query} AND (name ILIKE ${searchPattern} OR notes ILIKE ${searchPattern})`;
        countQuery = sql`${countQuery} AND (name ILIKE ${searchPattern} OR notes ILIKE ${searchPattern})`;
      }

      // Add ordering
      query = sql`${query} ORDER BY CASE urgency WHEN 'critical' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC, date_added DESC`;
      
      // Add pagination
      query = sql`${query} LIMIT ${limit} OFFSET ${offset}`;

      // Execute queries
      const itemsResult = await query;
      const countResult = await countQuery;
      
      return {
        items: itemsResult,
        total: parseInt(countResult[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  // Get active items
  static async getActiveItems(userId = null) {
    try {
      if (userId) {
        return await sql`
          SELECT * FROM items 
          WHERE status = 'active' AND user_id = ${userId}
          ORDER BY 
            CASE urgency 
              WHEN 'critical' THEN 3 
              WHEN 'medium' THEN 2 
              WHEN 'low' THEN 1 
              ELSE 0 
            END DESC, 
            date_added DESC
        `;
      }
      
      return await sql`
        SELECT * FROM items 
        WHERE status = 'active'
        ORDER BY 
          CASE urgency 
            WHEN 'critical' THEN 3 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 1 
            ELSE 0 
          END DESC, 
          date_added DESC
      `;
    } catch (error) {
      console.error('Error fetching active items:', error);
      throw error;
    }
  }

  // Get restocked items
  static async getRestockedItems(userId = null, limit = 20) {
    try {
      if (userId) {
        return await sql`
          SELECT * FROM items 
          WHERE status = 'restocked' AND user_id = ${userId}
          ORDER BY date_restocked DESC 
          LIMIT ${limit}
        `;
      }
      
      return await sql`
        SELECT * FROM items 
        WHERE status = 'restocked'
        ORDER BY date_restocked DESC 
        LIMIT ${limit}
      `;
    } catch (error) {
      console.error('Error fetching restocked items:', error);
      throw error;
    }
  }

  // Create a new item
  static async createItem(itemData) {
    try {
      const {
        name,
        urgency = 'medium',
        notes = '',
        quantity = '',
        estimatedTimeToRunOut = '',
        category = '',
        photoUrl = null,
        audioUrl = null,
        transcription = '',
        userId = null,
        aiExtracted = false,
        aiConfidence = null,
        tags = []
      } = itemData;

      const result = await sql`
        INSERT INTO items (
          name, urgency, notes, quantity, estimated_time_to_run_out, 
          category, photo_url, audio_url, transcription, user_id, 
          ai_extracted, ai_confidence, tags
        ) VALUES (
          ${name}, ${urgency}, ${notes}, ${quantity}, ${estimatedTimeToRunOut},
          ${category}, ${photoUrl}, ${audioUrl}, ${transcription}, ${userId},
          ${aiExtracted}, ${aiConfidence}, ${tags}
        )
        RETURNING *
      `;

      return result[0];
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  // Update an item
  static async updateItem(id, updates) {
    try {
      if (Object.keys(updates).length === 0) {
        // Find the item to return it if no updates are made.
        return this.findById(id);
      }

      const item = await sql.begin(async (tx) => {
        // Build dynamic SET clause
        const setClauses = Object.entries(updates)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => {
            // Convert camelCase to snake_case for database columns
            const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            return sql`${sql(dbColumn)} = ${value}`;
          });

        if (setClauses.length === 0) {
          // If all updates were undefined, no actual update to perform
          const [currentItem] = await tx`SELECT * FROM items WHERE id = ${id}`;
          return currentItem;
        }

        // Add the updated_at timestamp manually
        setClauses.push(sql`updated_at = CURRENT_TIMESTAMP`);
        
        const [updatedItem] = await tx`
          UPDATE items
          SET ${sql.join(setClauses, sql`, `)}
          WHERE id = ${id}
          RETURNING *
        `;
        return updatedItem;
      });

      return item;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  // Mark item as restocked
  static async markAsRestocked(id) {
    try {
      const result = await sql`
        UPDATE items 
        SET status = 'restocked', date_restocked = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error marking item as restocked:', error);
      throw error;
    }
  }

  // Mark item as active
  static async markAsActive(id) {
    try {
      const result = await sql`
        UPDATE items 
        SET status = 'active', date_restocked = NULL
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error marking item as active:', error);
      throw error;
    }
  }

  // Delete an item
  static async deleteItem(id) {
    try {
      const result = await sql`
        DELETE FROM items 
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // Find item by ID
  static async findById(id) {
    try {
      const result = await sql`
        SELECT * FROM items 
        WHERE id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error finding item by ID:', error);
      throw error;
    }
  }

  // Search items with full-text search
  static async searchItems(searchTerm, userId = null) {
    try {
      if (userId) {
        return await sql`
          SELECT *, ts_rank(to_tsvector('english', name || ' ' || COALESCE(notes, '')), plainto_tsquery('english', ${searchTerm})) as rank
          FROM items 
          WHERE status = 'active' 
            AND user_id = ${userId}
            AND to_tsvector('english', name || ' ' || COALESCE(notes, '')) @@ plainto_tsquery('english', ${searchTerm})
          ORDER BY rank DESC, date_added DESC
        `;
      }

      return await sql`
        SELECT *, ts_rank(to_tsvector('english', name || ' ' || COALESCE(notes, '')), plainto_tsquery('english', ${searchTerm})) as rank
        FROM items 
        WHERE status = 'active' 
          AND to_tsvector('english', name || ' ' || COALESCE(notes, '')) @@ plainto_tsquery('english', ${searchTerm})
        ORDER BY rank DESC, date_added DESC
      `;
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }

  // Get item statistics
  static async getStats(userId = null) {
    try {
      const whereClause = userId ? `WHERE user_id = ${userId}` : '';
      
      const result = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_count,
          COUNT(*) FILTER (WHERE status = 'restocked') as restocked_count,
          COUNT(*) FILTER (WHERE status = 'active' AND urgency = 'critical') as critical_count,
          COUNT(*) FILTER (WHERE status = 'active' AND urgency = 'medium') as medium_count,
          COUNT(*) FILTER (WHERE status = 'active' AND urgency = 'low') as low_count
        FROM items
        ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      `;

      return result[0];
    } catch (error) {
      console.error('Error getting item stats:', error);
      throw error;
    }
  }
}

module.exports = ItemService; 