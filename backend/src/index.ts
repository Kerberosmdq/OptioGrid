import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('OptioGrid API is running');
});

app.post('/api/extract', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Basic validation
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract Metadata
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';

        // Price extraction (very basic heuristic)
        let price = 0;
        let currency = 'USD';

        // Try to find price in common meta tags or structured data
        const priceMeta = $('meta[property="product:price:amount"]').attr('content');
        const currencyMeta = $('meta[property="product:price:currency"]').attr('content');

        if (priceMeta) {
            price = parseFloat(priceMeta);
        }
        if (currencyMeta) {
            currency = currencyMeta;
        }

        res.json({
            title: title.trim(),
            description: description.trim(),
            image_url: image,
            price,
            currency,
            url
        });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract metadata', details: error instanceof Error ? error.message : String(error) });
    }
});

app.post('/api/recommend', async (req, res) => {
    try {
        const { items, criteria } = req.body;

        if (!items || !Array.isArray(items) || items.length < 2) {
            return res.status(400).json({ error: 'At least 2 items are required for comparison' });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Mock response if no API key
            return res.json({
                recommendation_id: items[0].id,
                reasoning: "Esta es una recomendación simulada porque no se proporcionó una clave API de OpenAI. El primer artículo fue seleccionado por defecto.",
                scores: items.reduce((acc: any, item: any) => ({ ...acc, [item.id]: Math.floor(Math.random() * 20) + 80 }), {}),
                pros_cons: items.reduce((acc: any, item: any) => ({
                    ...acc,
                    [item.id]: {
                        pros: ["Buen valor", "Buen diseño"],
                        cons: ["Podría ser más barato"]
                    }
                }), {})
            });
        }

        const openai = new OpenAI({ apiKey });

        const prompt = `
      Compara los siguientes artículos y recomienda el mejor basado en: "${criteria || 'mejor valor general'}".
      Artículos: ${JSON.stringify(items.map((i: any) => ({ id: i.id, title: i.title, price: i.price, description: i.description })))}
      
      Responde en formato JSON (todo el contenido debe estar en Español):
      {
        "recommendation_id": "id_del_mejor_articulo",
        "reasoning": "explicación breve en español",
        "scores": { "item_id": 0-100 },
        "pros_cons": { "item_id": { "pros": ["..."], "cons": ["..."] } }
      }
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful shopping assistant." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error('No content from OpenAI');

        res.json(JSON.parse(content));

    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ error: 'Failed to generate recommendation' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
