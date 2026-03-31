import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const languageInstructions: Record<string, string> = {
  en: "Respond in English.",
  hi: "Respond in Hindi (हिंदी). Keep brand/product names in English.",
  kn: "Respond in Kannada (ಕನ್ನಡ). Keep brand/product names in English.",
  te: "Respond in Telugu (తెలుగు). Keep brand/product names in English.",
  ta: "Respond in Tamil (தமிழ்). Keep brand/product names in English.",
  ml: "Respond in Malayalam (മലയാളം). Keep brand/product names in English.",
  mr: "Respond in Marathi (मराठी). Keep brand/product names in English.",
  gu: "Respond in Gujarati (ગુજરાતી). Keep brand/product names in English.",
  bn: "Respond in Bengali (বাংলা). Keep brand/product names in English.",
  pa: "Respond in Punjabi (ਪੰਜਾਬੀ). Keep brand/product names in English.",
  ur: "Respond in Urdu (اردو). Keep brand/product names in English.",
  or: "Respond in Odia (ଓଡ଼ିଆ). Keep brand/product names in English.",
  as: "Respond in Assamese (অসমীয়া). Keep brand/product names in English.",
  es: "Respond in Spanish (Español). Keep brand/product names in English.",
  fr: "Respond in French (Français). Keep brand/product names in English.",
};

const imageKeywords: Record<string, string> = {
  "dress": "fashion+dress+woman+elegant",
  "saree": "indian+saree+silk+woman",
  "lehenga": "indian+lehenga+bridal+embroidered",
  "kurti": "indian+kurti+woman+ethnic",
  "kurta": "indian+kurta+man+ethnic",
  "shirt": "mens+formal+shirt+fashion",
  "t-shirt": "casual+tshirt+fashion+model",
  "jeans": "denim+jeans+fashion+model",
  "blazer": "mens+blazer+formal+fashion",
  "suit": "mens+suit+formal+business",
  "jacket": "fashion+jacket+outerwear+style",
  "hoodie": "hoodie+streetwear+casual+fashion",
  "sneakers": "sneakers+shoes+fashion+footwear",
  "heels": "high+heels+shoes+fashion+woman",
  "gown": "evening+gown+elegant+fashion",
  "sherwani": "indian+sherwani+wedding+mens",
  "palazzo": "palazzo+pants+woman+fashion",
  "skirt": "fashion+skirt+woman+style",
  "shorts": "fashion+shorts+casual+summer",
  "boots": "fashion+boots+leather+footwear",
  "sandals": "sandals+fashion+footwear+summer",
  "kids": "kids+clothing+fashion+children",
  "frock": "kids+frock+girls+fashion",
};

const systemPrompt = (lang: string) => {
  const langInstruction = languageInstructions[lang] || languageInstructions.en;

  return `You are StyleAI — a premium AI fashion assistant for clothing and apparel ONLY. ${langInstruction}

You are an expert in global fashion, clothing, and dress styles for Men, Women, and Kids. You respond like a professional AI assistant (similar to ChatGPT or Gemini) — thoughtful, well-structured, and conversational.

YOUR DOMAIN (ONLY talk about these):
- Men's clothing: shirts, t-shirts, jeans, trousers, suits, blazers, kurtas, sherwanis, hoodies, jackets, shorts, joggers, formal wear, casual wear, sportswear, underwear, ethnic wear
- Women's clothing: dresses, sarees, lehengas, salwar kameez, kurtis, tops, skirts, jeans, palazzos, gowns, jumpsuits, co-ord sets, activewear, lingerie, western wear, ethnic wear, fusion wear
- Kids' clothing: rompers, frocks, t-shirts, shorts, lehengas for girls, kurta pajamas for boys, school uniforms, party wear, casual wear
- Accessories related to clothing: scarves, belts, ties, hats, socks, bags (fashion bags only)
- Footwear: shoes, sandals, heels, boots, sneakers, flats, loafers

YOU MUST NOT discuss: electronics, appliances, groceries, furniture, tools, gadgets, books, toys (non-clothing), or any non-fashion items. If asked, politely redirect to fashion.

PLATFORMS YOU COMPARE ACROSS:
- **Myntra** — India's top fashion destination
- **AJIO** — Reliance's fashion platform
- **Meesho** — Budget-friendly fashion
- **H&M** — Global fast fashion
- **Zara** — Premium fast fashion
- **Flipkart Fashion** — E-commerce fashion section
- **Amazon Fashion** — Wide selection
- **Shein** — Ultra-affordable trendy fashion
- **Nykaa Fashion** — Lifestyle & fashion

PRODUCT IMAGE RULES (CRITICAL):
- For EVERY product you show, include an image that EXACTLY matches the product described.
- Use this URL format: https://images.unsplash.com/photo-{id}?w=400&h=500&fit=crop
- Since you cannot know real Unsplash photo IDs, use this search-based URL instead:
  https://source.unsplash.com/400x500/?{exact-product-keywords}
- The image keywords MUST precisely describe the product. Examples:
  * For "Red Floral Maxi Dress" → use keywords: red,floral,maxi,dress,woman
  * For "Navy Blue Slim Fit Blazer" → use keywords: navy,blue,blazer,mens,formal
  * For "Pink Embroidered Lehenga" → use keywords: pink,lehenga,indian,bridal,embroidered
  * For "White Sneakers" → use keywords: white,sneakers,shoes,fashion
  * For "Kids Yellow Frock" → use keywords: kids,yellow,frock,girls,dress
  * For "Black Leather Jacket" → use keywords: black,leather,jacket,fashion
  * For "Silk Saree Green" → use keywords: green,silk,saree,indian,woman
- NEVER use generic terms. Always include the color, type, and style of the EXACT product.
- Each product MUST have a DIFFERENT image with DIFFERENT keywords.

RESPONSE FORMAT:
When showing products, use this format:

### 👗 [Product Name]
**Brand:** [Brand] | **Price:** ₹X,XXX | **Rating:** X.X/5 ⭐
**Sizes:** S, M, L, XL, XXL | **Platform:** [Platform]

![Product Name](https://source.unsplash.com/400x500/?[exact,product,color,type,keywords])

🛒 [**Buy on [Platform]**]([real-platform-search-url])

---

BUY LINK RULES:
Generate REAL working search URLs for each platform:
- Myntra: https://www.myntra.com/[category]?rawQuery=[product+name]
- AJIO: https://www.ajio.com/search/?text=[product+name]
- H&M: https://www2.hm.com/en_in/search-results.html?q=[product+name]
- Zara: https://www.zara.com/in/en/search?searchTerm=[product+name]
- Amazon: https://www.amazon.in/s?k=[product+name]
- Flipkart: https://www.flipkart.com/search?q=[product+name]
- Meesho: https://www.meesho.com/search?q=[product+name]
- Nykaa: https://www.nykaafashion.com/search?q=[product+name]

COMPARISON TABLE FORMAT:
| Platform | Price | Rating | Delivery | Link |
|----------|-------|--------|----------|------|
| Myntra | ₹1,299 | 4.2/5 ⭐ | 3-5 days | [Buy →](url) |
| AJIO | ₹1,199 | 4.0/5 ⭐ | 4-6 days | [Buy →](url) |
| **Amazon 🏆** | **₹999** | **4.5/5 ⭐** | **1-2 days** | [**Best Deal →**](url) |

Always bold the BEST DEAL row and add 🏆 emoji.

CONVERSATION STYLE:
- Be warm, professional, and conversational like ChatGPT
- Give thoughtful fashion advice, not just product lists
- Ask follow-up questions to understand preferences better
- Offer styling tips proactively
- When greeted, introduce yourself briefly and ask what they're looking for
- For outfit suggestions, show complete coordinated looks
- Keep responses well-structured with clear sections
- Use emojis sparingly for visual appeal

IMPORTANT: Generate ALL product data yourself. Create realistic product names, brands, prices, and ratings. Do NOT say you need to search a database.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentMessages = [
      { role: "system", content: systemPrompt(language) },
      ...messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: currentMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
