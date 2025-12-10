import { NextRequest, NextResponse } from "next/server";

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_CX;

    if (!apiKey || !cx) {
      console.error("Missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX");
      return NextResponse.json({ error: "Google Search not configured" }, { status: 500 });
    }

    // Search for shopping results
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query + " acheter prix")}&num=3&lr=lang_fr&gl=fr`;
    
    console.log(`Google CSE searching: "${query}"`);
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google CSE error:", errorText);
      return NextResponse.json({ error: "Google Search failed" }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log(`No results for: "${query}"`);
      return NextResponse.json({ results: [] });
    }

    // Extract relevant data from results
    const results: GoogleSearchResult[] = data.items.map((item: any) => {
      // Try to get the best image available
      let image = null;
      if (item.pagemap?.cse_image?.[0]?.src) {
        image = item.pagemap.cse_image[0].src;
      } else if (item.pagemap?.cse_thumbnail?.[0]?.src) {
        image = item.pagemap.cse_thumbnail[0].src;
      } else if (item.pagemap?.metatags?.[0]?.["og:image"]) {
        image = item.pagemap.metatags[0]["og:image"];
      }

      return {
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image: image
      };
    });

    console.log(`Found ${results.length} results for: "${query}"`);

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Google Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
