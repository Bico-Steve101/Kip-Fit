const client = require('../config');

class Product {
    constructor(id, name, price, availability, description, images) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.availability = availability;
        this.description = description;
        this.images = images;
    }

    static async findById(id) {
        try {
            const db = client.db('KIPFIT'); 
            const product = await db.collection('products').findOne({ id: id });
            return product;
        } catch (error) {
            console.error('Error finding product by ID:', error);
            throw error;
        }
    }

    async addReview(rating, comment) {
        try {
            const db = client.db('KIPFIT'); 
            const result = await db.collection('products').updateOne(
                { id: this.id },
                { $push: { reviews: { rating, comment } } }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error('Error adding review to product:', error);
            throw error;
        }
    }
}

module.exports = Product;
