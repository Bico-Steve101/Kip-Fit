const { client } = require('../config');
const FoodMenuModel = {
    
    addMenu: async (name, description, ingredients, time) => {
        try {
            
            const db = client.db('your_database_name'); 
            
            const collection = db.collection('menus');

            await collection.insertOne({
                name: name,
                description: description,
                ingredients: ingredients,
                time: time
            });

         return 'Menu added successfully';
        } catch (error) {
            console.error('Error adding menu:', error);
            throw new Error('Failed to add menu');
        }
    }
};
module.exports = FoodMenuModel;
