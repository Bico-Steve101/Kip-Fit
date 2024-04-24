// Mock function to fetch products
const fetchProducts = async () => {
    // Replace this with actual database query or API call
    return [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 },
        // Add more products as needed
    ];
};

// router.get('/products', async (req, res) => {
//     try {
//         const products = await fetchProducts();
//         res.json(products);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching products' });
//     }
// });

//module.exports = router;
