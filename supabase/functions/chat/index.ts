import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Mock multi-platform data for comparison engine ──
const MOCK_PLATFORMS: Record<string, { name: string; priceMultiplier: number; ratingOffset: number; deliveryDays: string }> = {
  shopai: { name: "ShopAI Store", priceMultiplier: 1.0, ratingOffset: 0, deliveryDays: "2-4 days" },
  meesho: { name: "Meesho", priceMultiplier: 0.85, ratingOffset: -0.2, deliveryDays: "5-7 days" },
  ajio: { name: "AJIO", priceMultiplier: 1.1, ratingOffset: 0.1, deliveryDays: "3-5 days" },
  hm: { name: "H&M", priceMultiplier: 1.25, ratingOffset: 0.3, deliveryDays: "4-6 days" },
  flipkart: { name: "Flipkart", priceMultiplier: 0.95, ratingOffset: 0, deliveryDays: "2-3 days" },
};

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search for products by name, category, brand, or price range. Use this when the user wants to find, browse, or discover products.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term for product name or description" },
          category: { type: "string", description: "Product category filter" },
          brand: { type: "string", description: "Brand name filter" },
          max_price: { type: "number", description: "Maximum price in INR" },
          min_price: { type: "number", description: "Minimum price in INR" },
          limit: { type: "number", description: "Number of results to return, default 6" },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_products",
      description:
        "Compare a product across multiple shopping platforms (ShopAI, Meesho, AJIO, H&M, Flipkart). Use when user asks to compare prices, find best deals, or compare across brands/platforms.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Product search term to compare" },
          category: { type: "string", description: "Optional category filter" },
          max_results: { type: "number", description: "Max products to compare, default 3" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_cart",
      description: "Get the current contents of the user's shopping cart",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a product to the user's shopping cart",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "UUID of the product to add" },
          quantity: { type: "number", description: "Quantity to add, default 1" },
        },
        required: ["product_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_from_cart",
      description: "Remove a product from the user's shopping cart",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "UUID of the product to remove" },
        },
        required: ["product_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_cart_quantity",
      description: "Update the quantity of a product in the cart",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "UUID of the product" },
          quantity: { type: "number", description: "New quantity" },
        },
        required: ["product_id", "quantity"],
        additionalProperties: false,
      },
    },
  },
];

// ── Tool implementations ──

async function searchProducts(params: Record<string, unknown>) {
  let query = supabase.from("products").select("*");
  if (params.query) {
    const q = String(params.query);
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%`);
  }
  if (params.category) query = query.ilike("category", `%${params.category}%`);
  if (params.brand) query = query.ilike("brand", `%${params.brand}%`);
  if (params.max_price) query = query.lte("price", params.max_price);
  if (params.min_price) query = query.gte("price", params.min_price);
  const limit = (params.limit as number) || 6;
  query = query.limit(limit).order("rating", { ascending: false });
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { products: data, count: data?.length || 0 };
}

async function compareProducts(params: Record<string, unknown>) {
  const q = String(params.query || "");
  const maxResults = (params.max_results as number) || 3;

  // Fetch base products from our DB
  let query = supabase.from("products").select("*");
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%`);
  if (params.category) query = query.ilike("category", `%${params.category}%`);
  query = query.limit(maxResults).order("rating", { ascending: false });

  const { data, error } = await query;
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No products found to compare", comparisons: [] };

  // Generate multi-platform comparison using mock data
  const comparisons = data.map((product: Record<string, unknown>) => {
    const basePrice = Number(product.price);
    const baseRating = Number(product.rating || 4.0);

    const platformPrices = Object.entries(MOCK_PLATFORMS).map(([key, platform]) => {
      const price = Math.round(basePrice * platform.priceMultiplier);
      const rating = Math.min(5, Math.max(1, +(baseRating + platform.ratingOffset).toFixed(1)));
      return {
        platform: platform.name,
        platform_key: key,
        price,
        rating,
        delivery: platform.deliveryDays,
        in_stock: Math.random() > 0.15,
        url: key === "shopai" ? null : `https://${key}.example.com/product/${product.id}`,
      };
    });

    const bestPrice = Math.min(...platformPrices.map((p) => p.price));

    return {
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      image_url: product.image_url,
      description: product.description,
      platforms: platformPrices,
      best_price: bestPrice,
      best_platform: platformPrices.find((p) => p.price === bestPrice)?.platform,
      savings: Math.round(Math.max(...platformPrices.map((p) => p.price)) - bestPrice),
    };
  });

  return { comparisons, query: q, platforms_checked: Object.keys(MOCK_PLATFORMS).length };
}

async function getOrCreateCart(userId: string) {
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase.from("carts").insert({ user_id: userId }).select("id").single();
  if (error) throw new Error(error.message);
  return created.id;
}

async function getCart(userId: string) {
  const cartId = await getOrCreateCart(userId);
  const { data: items, error } = await supabase.from("cart_items").select("*, products(*)").eq("cart_id", cartId);
  if (error) return { error: error.message };
  const totalPrice = items?.reduce(
    (sum: number, item: { quantity: number; products: { price: number } }) => sum + item.quantity * item.products.price, 0
  ) || 0;
  return {
    items: items?.map((item: { id: string; quantity: number; products: { id: string; name: string; price: number; image_url: string } }) => ({
      id: item.id, product_id: item.products.id, name: item.products.name,
      price: item.products.price, quantity: item.quantity, image_url: item.products.image_url,
      subtotal: item.quantity * item.products.price,
    })) || [],
    total_price: totalPrice,
    item_count: items?.length || 0,
  };
}

async function addToCart(userId: string, productId: string, quantity = 1) {
  const cartId = await getOrCreateCart(userId);
  const { data: existing } = await supabase.from("cart_items").select("id, quantity").eq("cart_id", cartId).eq("product_id", productId).maybeSingle();
  if (existing) {
    await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
    return { success: true, message: `Updated quantity to ${existing.quantity + quantity}` };
  }
  const { error } = await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, quantity });
  if (error) return { error: error.message };
  return { success: true, message: "Added to cart" };
}

async function removeFromCart(userId: string, productId: string) {
  const cartId = await getOrCreateCart(userId);
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId);
  if (error) return { error: error.message };
  return { success: true, message: "Removed from cart" };
}

async function updateCartQuantity(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) return removeFromCart(userId, productId);
  const cartId = await getOrCreateCart(userId);
  const { error } = await supabase.from("cart_items").update({ quantity }).eq("cart_id", cartId).eq("product_id", productId);
  if (error) return { error: error.message };
  return { success: true, message: `Quantity updated to ${quantity}` };
}

async function executeTool(name: string, args: Record<string, unknown>, userId: string | null) {
  switch (name) {
    case "search_products": return searchProducts(args);
    case "compare_products": return compareProducts(args);
    case "get_cart":
      if (!userId) return { error: "Please log in to view your cart" };
      return getCart(userId);
    case "add_to_cart":
      if (!userId) return { error: "Please log in to add items to cart" };
      return addToCart(userId, args.product_id as string, (args.quantity as number) || 1);
    case "remove_from_cart":
      if (!userId) return { error: "Please log in to manage your cart" };
      return removeFromCart(userId, args.product_id as string);
    case "update_cart_quantity":
      if (!userId) return { error: "Please log in to manage your cart" };
      return updateCartQuantity(userId, args.product_id as string, args.quantity as number);
    default: return { error: `Unknown tool: ${name}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const languageInstructions: Record<string, string> = {
      en: "Respond in English.",
      hi: "Respond in Hindi (हिंदी). Keep product names in English.",
      kn: "Respond in Kannada (ಕನ್ನಡ). Keep product names in English.",
      te: "Respond in Telugu (తెలుగు). Keep product names in English.",
      ta: "Respond in Tamil (தமிழ்). Keep product names in English.",
      ml: "Respond in Malayalam (മലയാളം). Keep product names in English.",
      mr: "Respond in Marathi (मराठी). Keep product names in English.",
      gu: "Respond in Gujarati (ગુજરાતી). Keep product names in English.",
      bn: "Respond in Bengali (বাংলা). Keep product names in English.",
      pa: "Respond in Punjabi (ਪੰਜਾਬੀ). Keep product names in English.",
      ur: "Respond in Urdu (اردو). Keep product names in English.",
      or: "Respond in Odia (ଓଡ଼ିଆ). Keep product names in English.",
      as: "Respond in Assamese (অসমীয়া). Keep product names in English.",
      es: "Respond in Spanish (Español). Keep product names in English.",
      fr: "Respond in French (Français). Keep product names in English.",
    };
    const langInstruction = languageInstructions[language] || languageInstructions.en;

    const systemPrompt = `You are ShopAI — an elite AI shopping assistant for a premium e-commerce store. ${langInstruction}

Your capabilities:
- Search and recommend products from our catalog
- Compare products across 5 platforms (ShopAI, Meesho, AJIO, H&M, Flipkart) using the compare_products tool
- Help users manage their shopping cart (add, remove, update quantities)
- Provide outfit suggestions, fashion advice, and personalized recommendations
- Answer questions about products, pricing, availability, and delivery

Guidelines:
- Be concise and helpful. Keep responses under 3 sentences unless comparing products or giving recommendations.
- When showing products, ALWAYS use the search_products tool to get real data.
- When user asks to compare or find best deals, use the compare_products tool.
- When displaying comparison results, format them as a clear comparison table with platform, price, rating, and delivery info.
- Prices are in Indian Rupees (₹). Format as ₹X,XXX.
- If user wants to add to cart, use the product's UUID from search results.
- For outfit suggestions, search multiple categories and suggest combinations.
- If user is not logged in and tries cart operations, politely ask them to log in.
- Never make up products — always search the database.
- Be proactive — if someone asks about a product, show them options.
- When showing product results, format each product clearly with: name, brand, price, rating (as stars), and mention the product ID so user can add to cart.
- For comparisons, highlight the BEST DEAL clearly.`;

    let currentMessages: Record<string, unknown>[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    let maxIterations = 5;
    let finalContent = "";

    while (maxIterations > 0) {
      maxIterations--;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: currentMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Service credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      if (!choice) throw new Error("No response from AI");

      const message = choice.message;

      if (!message.tool_calls || message.tool_calls.length === 0) {
        finalContent = message.content || "";
        break;
      }

      currentMessages.push(message);

      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(toolCall.function.name, args, userId);
        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    return new Response(
      JSON.stringify({ content: finalContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
