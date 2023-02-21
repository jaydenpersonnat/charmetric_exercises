

/**
 * these are defined in an external queries file but 
 * added here as a comment for additional context
 *
 * QUERIES.QUERY_GET_ARTIST_INFO.ARTIST_INSIGHTS

module.exports {
 ...
 GET_INSIGHTS_COUNT: (cm_artist, highWeight, mediumWeight, daysAgo) => `
      SELECT COUNT(*) as "count"
      FROM chartmetric.analytics.cm_artist_insights ai
      JOIN chartmetric.analytics.cm_artist_insights_weight aiw ON ai.target = aiw.target AND ai.type = aiw.type
      WHERE cm_artist = ${cm_artist}
      AND weight >= ${highWeight}
      AND timestp >= current_date - ${daysAgo}
      UNION
      SELECT COUNT(*) as "count"
      FROM chartmetric.analytics.cm_artist_insights ai
      JOIN chartmetric.analytics.cm_artist_insights_weight aiw ON ai.target = aiw.target AND ai.type = aiw.type
      WHERE cm_artist = ${cm_artist}
      AND weight >= ${mediumWeight}
      AND timestp >= current_date - ${daysAgo}
      `,
 GET_ARTIST_INSIGHTS: (cm_artist, limit, weight, daysAgo) => `
      WITH insights AS (
        SELECT ai.*, aiw.weight
        FROM chartmetric.analytics.cm_artist_insights ai
        JOIN chartmetric.analytics.cm_artist_insights_weight aiw ON ai.target = aiw.target AND ai.type = aiw.type
        WHERE cm_artist = ${cm_artist}
        AND weight >= ${weight}
        AND timestp >= current_date - ${daysAgo}
        ORDER BY timestp DESC, weight DESC
        LIMIT ${limit}
      )
      , artist AS (
        SELECT 
            DISTINCT i.cm_artist, 
            t.image_url AS artist_url
        from insights i
        JOIN raw_data.cm_artist t ON i.cm_artist = t.id
       )
      , track as (
        SELECT 
            DISTINCT i.cm_track, 
            t.image_url AS track_url
        FROM insights i
        JOIN raw_data.cm_track t ON i.cm_track = t.id
       )
      , album AS (
        SELECT 
            DISTINCT i.cm_album, 
            t.image_url AS album_url
        FROM insights i
        JOIN raw_data.cm_album t ON i.cm_album = t.id
       )
      SELECT i.* , 
          album.album_url, 
          track.track_url, 
          artist.artist_url
      FROM insights i
      LEFT JOIN album ON i.cm_album = album.cm_album
      LEFT JOIN track ON i.cm_track = track.cm_track
      LEFT JOIN artist ON i.cm_artist = artist.cm_artist
      `,
 ...
};

*/


async function getArtistInsights(query) {
    const { id, limit, weight, daysAgo, newsFormat } = query;
    const counts =
      weight !== undefined
        ? await Promise.resolve()
        : await snowflakeClientExecuteQuery(
            QUERIES.QUERY_GET_ARTIST_INFO.ARTIST_INSIGHTS.GET_INSIGHTS_COUNT(
              id,
              8, // high weight
              4, // medium weight
              daysAgo
            )
          );

    if (weight === undefined)
    {
        const high = counts[0]?.count;
        const medium = counts[1]?.count 
        weight = weight 
            ? weight 
            : high 
            ? 8 // high weight
            : medium 
            ? 4 // meidum weight
            : 1; // low eight 
    }
    let sfResult = await snowflakeClientExecuteQuery(
        QUERIES.QUERY_GET_ARTIST_INFO.ARTIST_INSIGHTS.GET_ARTIST_INSIGHTS(
            id,
            limit * 10,
            weight,
            daysAgo
          ) 
    );
    
    let filteredResult = filterResults(sfResult); 
    
    let results = filteredResult.map(async result => formatInsight(result)); 
    await Promise.all(results); 

    results = results.filter(e => e != null);
    results = results.slice(0, limit + (10 - weight) * 200);

    const insights = results.map(async result => {
        const news = insightToNews(result);
        return newsFormat ? news : result;
    })
    
    await Promise.all(insights); 

    return newsFormat ? {insights, weights} : insights;
  }