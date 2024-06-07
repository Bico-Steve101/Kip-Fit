const images = [<%= product.image_one ? `"${product.image_one}"` : 'null' %>, <%= product.image_two ? `"${product.image_two}"` : 'null' %>, <%= product.image_three ? `"${product.image_three}"` : 'null' %>, <%= product.image_four ? `"${product.image_four}"` : 'null' %>];
    images.forEach(src => {
        if (src) {
            const img = new Image();
            img.src = src;
        }
    });