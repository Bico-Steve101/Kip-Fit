const express = require('express');
const router = express.Router();
const { pool } = require('../config');
const { isAuthenticated } = require('../middleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new food menu
router.post('/food-menu/add', isAuthenticated, upload.single('image'), async (req, res) => {
    const { category, title, description, ingredients, time, is_recommended } = req.body;
    const userId = req.userId;
    let imageBuffer = null;
    
    if (req.file) {
      imageBuffer = req.file.buffer;
    }
  
    try {
      const newFoodMenu = await pool.query(
        'INSERT INTO diet_menus (user_id, category, title, description, ingredients, time, image, is_recommended) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, category, title, description, ingredients, time, imageBuffer, is_recommended === 'on']
      );
  
      const result = newFoodMenu.rows[0];
  
      if (imageBuffer) {
        result.image = imageBuffer.toString('base64');
      }
  
      res.status(201).json(result);
    } catch (err) {
      console.error('Error adding food menu:', err);
      res.status(500).json({ error: 'Failed to add food menu.' });
    }
});

router.get('/food-menu', isAuthenticated, async (req, res) => {
    const { search, category } = req.query;

    try {
        let query = 'SELECT * FROM diet_menus WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND title ILIKE $' + (params.length + 1);
            params.push(`%${search}%`);
        }

        if (category) {
            query += ' AND category = $' + (params.length + 1);
            params.push(category);
        }

        const result = await pool.query(query, params);

        const fetchMenuQuery = (query, params) => pool.query(query, params);
        const dietsQuery = fetchMenuQuery('SELECT id, category, title, description,time,ingredients, user_id, image, is_recommended FROM diet_menus WHERE is_recommended = true', []);
        const saladsQuery = pool.query('SELECT id, title, description, time,ingredients, user_id, image FROM diet_menus WHERE category = $1', ['Salad']);
        const breakfastsQuery = pool.query('SELECT id, title, description, time,ingredients, user_id, image FROM diet_menus WHERE category = $1', ['Breakfast']);
        const lunchesQuery = pool.query('SELECT id, title, description, time,ingredients, user_id, image FROM diet_menus WHERE category = $1', ['Lunch']);

        const lastRecommendedDietQuery = pool.query('SELECT id, category, title, description, time,ingredients, user_id, image, is_recommended, created_at FROM diet_menus WHERE is_recommended = true ORDER BY created_at DESC LIMIT 1');

        const [dietsResults, saladsResults, breakfastsResults, lunchesResults, lastRecommendedDietResult] = await Promise.all([dietsQuery, saladsQuery, breakfastsQuery, lunchesQuery, lastRecommendedDietQuery]);

        const getImageBase64 = (image) => image ? Buffer.from(image).toString('base64') : null;

        const uniqueUserIds = [...new Set([
            ...dietsResults.rows.map(menu => menu.user_id),
            ...saladsResults.rows.map(menu => menu.user_id),
            ...breakfastsResults.rows.map(menu => menu.user_id),
            ...lunchesResults.rows.map(menu => menu.user_id),
            lastRecommendedDietResult.rows.length > 0 ? lastRecommendedDietResult.rows[0].user_id : null
        ].filter(id => id !== null))];

        const usersQuery = await pool.query('SELECT id, first_name, last_name, avatar FROM users WHERE id = ANY($1)', [uniqueUserIds]);
        const usersById = usersQuery.rows.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});

        const processMenuResults = (menus) => menus.map(menu => ({
            ...menu,
            imageBase64: getImageBase64(menu.image),
            creator: usersById[menu.user_id] ? {
                name: `${usersById[menu.user_id].first_name} ${usersById[menu.user_id].last_name}`,
                avatarBase64: getImageBase64(usersById[menu.user_id].avatar)
            } : null
        }));

        const diets = processMenuResults(dietsResults.rows);
        const salads = processMenuResults(saladsResults.rows);
        const breakfasts = processMenuResults(breakfastsResults.rows);
        const lunches = processMenuResults(lunchesResults.rows);
        const lastRecommendedDiet = lastRecommendedDietResult.rows.length > 0 ? processMenuResults(lastRecommendedDietResult.rows)[0] : null;

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ diets, salads, breakfasts, lunches, lastRecommendedDiet });
        } else {
            res.render('food-menu', { diets, salads, breakfasts, lunches, lastRecommendedDiet });
        }
    } catch (err) {
        console.error('Error fetching diet menus:', err);
        res.status(500).json({ error: 'Failed to fetch diet menus.' });
    }
});

// Update a food menu by ID
router.put('/food-menu/:id', isAuthenticated, async (req, res) => {
	const { category, title, description, ingredients, time } = req.body;
	const id = req.params.id;

	try {
		const updatedFoodMenu = await pool.query(
			'UPDATE diet_menus SET category = $1, title = $2, description = $3, ingredients = $4, time = $5 WHERE id = $6 RETURNING *',
			[category, title, description, ingredients, time, id]
		);

		if (updatedFoodMenu.rows.length === 0) {
			return res.status(404).json({ error: 'Food menu not found.' });
		}

		const foodMenus = await pool.query('SELECT * FROM diet_menus');
		res.render('food-menu', { foodMenus: foodMenus.rows }); 
	} catch (err) {
		console.error('Error updating food menu:', err);
		res.status(500).json({ error: 'Failed to update food menu.' });
	}
});

// Delete a food menu by ID
router.delete('/food-menu/:id', isAuthenticated, async (req, res) => {
	const id = req.params.id;

	try {
		const deletedFoodMenu = await pool.query('DELETE FROM diet_menus WHERE id = $1 RETURNING *', [id]);

		if (deletedFoodMenu.rows.length === 0) {
			return res.status(404).json({ error: 'Food menu not found.' });
		}

		const foodMenus = await pool.query('SELECT * FROM diet_menus');
		res.render('food-menu', { foodMenus: foodMenus.rows }); 
	} catch (err) {
		console.error('Error deleting food menu:', err);
		res.status(500).json({ error: 'Failed to delete food menu.' });
	}
});

module.exports = router;