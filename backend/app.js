const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mondaySdk = require('monday-sdk-js');
const os = require('os');

const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const MONDAY_CLIENT_ID = ""
const MONDAY_CLIENT_SECRET = ""
const MONDAY_REDIRECT_URI = "" // Ganti dengan URL redirect yang sesuai



// monday.setToken(MONDAY_API_KEY);

// Contoh struktur data untuk menyimpan konfigurasi (dalam memori, untuk demonstrasi)
const configurations = {};

async function verifyMondayToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verifikasi token dengan endpoint Monday.com
        
        req.mondayToken = token;// info user bisa kamu pakai nanti
        next();
    } catch (error) {
        console.error("Token verification failed:", error?.response?.data || error.message);
        return res.status(401).json({ error: "Token tidak valid." });
    }
}

app.get("/auth/monday", (req, res) => {
    const clientId = MONDAY_CLIENT_ID;
    const redirectUri = encodeURIComponent(MONDAY_REDIRECT_URI);
    res.redirect(`https://auth.monday.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`);
});

app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    const clientId = MONDAY_CLIENT_ID;
    const clientSecret = MONDAY_CLIENT_SECRET;
    const redirectUri = MONDAY_REDIRECT_URI;
  
    try {
      const response = await fetch("https://auth.monday.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });
  
      const data = await response.json();
      console.log(data)
      const accessToken = data.access_token;

      // You can store the access token in your DB
      res.json({
        access_token: accessToken,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("OAuth error");
    }
  });
  
  


app.post('/configure', (req, res) => {
    /**
     * Menerima konfigurasi dari frontend dan menyimpannya.
     */
    try {
        const { boardId, endpointUrl, method = 'GET', params = {}, body, bodyType = 'json', mapping = {} } = req.body;

        if (!boardId || !endpointUrl || !mapping) {
            return res.status(400).json({ error: "Board ID, Endpoint URL, dan Mapping harus disediakan." });
        }

        configurations[boardId] = {
            endpointUrl,
            method: method.toUpperCase(),
            params,
            body,
            bodyType: bodyType.toLowerCase(),
            mapping
        };

        res.status(200).json({ message: `Konfigurasi untuk Board ID ${boardId} berhasil disimpan.` });
    } catch (error) {
        console.error("Error during configuration:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/trigger/:boardId',verifyMondayToken, async (req, res) => {
    /**
     * Memicu penarikan data dan pembaruan monday.com board.
     */

    const { boardId } = req.params;
    const config = configurations[boardId];

    if (!config) {
        return res.status(404).json({ error: `Tidak ada konfigurasi untuk Board ID ${boardId}.` });
    }

    const { endpointUrl, method, params, body, bodyType, mapping } = config;

    try {
        const headers = {};
        if (body && bodyType === 'json') {
            headers['Content-Type'] = 'application/json';
        }

        const response = await axios.request({
            method,
            url: endpointUrl,
            params,
            headers,
            data: bodyType === 'json' && body ? body : (bodyType === 'raw' ? body : undefined),
        });
        response.data; // Data dari API

        console.log(req)

        await processAndUpdateMonday(boardId, response.data, mapping,  req.mondayToken);
        res.status(200).json({ message: `Data dari ${endpointUrl} berhasil diproses dan diperbarui untuk Board ID ${boardId}.` });
    } catch (error) {
        console.error("Error during API call or monday update:", error);
        res.status(500).json({ error: error.message });
    }
});

async function processAndUpdateMonday(boardId, apiData, mapping, token) {
    const monday = mondaySdk();
    monday.setToken(token);
    const itemsToCreate = [];
    console.log("boardId yang diterima:", boardId);

    if (Array.isArray(apiData)) {
        for (const itemData of apiData) {
            const itemValues = {};
            for (const mondayColumnId in mapping) {
                const apiPath = mapping[mondayColumnId];
                try {
                    const value = getNestedValue(itemData, apiPath);
                    if (value !== undefined && value !== null) {
                        itemValues[mondayColumnId] = String(value);
                    }
                } catch (error) {
                    console.error(`Error processing path '${apiPath}':`, error);
                }
            }

            console.log("itemValues sebelum push:", itemValues);
            itemsToCreate.push({ itemName: itemData.name || 'New Item', columnValues: itemValues });
        }

        console.log("itemsToCreate sebelum API call:", JSON.stringify(itemsToCreate, null, 2));

        for (const item of itemsToCreate) {
            const mutation = `
              mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (
                  board_id: $boardId,
                  item_name: $itemName,
                  column_values: $columnValues
                ) {
                  id
                }
              }
            `;

            const variables = {
                boardId: String(boardId),
                itemName: item.itemName,
                columnValues: JSON.stringify(item.columnValues), // 👈 penting!
            };

            try {
                const res = await monday.api(mutation, { variables });
                console.log("Respons dari monday API:", res);
                if (res.errors && res.errors.length > 0) {
                    console.error("Error creating item in monday:", res.errors);
                } else {
                    console.log("Item berhasil dibuat:", res.data);
                }
            } catch (error) {
                console.error("Error interacting with monday API:", error);
            }
        }
    } else {
        console.warn("Respons API bukan berupa array.");
    }
}


function getNestedValue(obj, path) {
    /**
     * Mendapatkan nilai nested dari objek berdasarkan path string (misalnya, 'data.items[0].name').
     */
    try {
        return path.split('.').reduce((o, key) => {
            const match = key.match(/([^\[]+)\[(\d+)\]/);
            if (match) {
                const prop = match[1];
                const index = parseInt(match[2], 10);
                return o && o[prop] && Array.isArray(o[prop]) ? o[prop][index] : undefined;
            }
            return o && o[key];
        }, obj);
    } catch (error) {
        return undefined;
    }
}

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port} atau port ${port} di monday code`);
});